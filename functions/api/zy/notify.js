/**
 * Cloudflare Pages Function: 支付回调通知
 * GET/POST /api/zy/notify
 * 
 * 支付成功后自动增加用户积分
 */

export async function onRequest(context) {
  const { request, env } = context

  try {
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams)
    
    // 如果是 POST，合并 body 参数
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type') || ''
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const body = await request.text()
        for (const [key, value] of new URLSearchParams(body)) {
          params[key] = value
        }
      }
    }

    console.log('Notify params:', JSON.stringify(params))

    const PUBLIC_KEY = getPublicKey(env.ZY_PUBLIC_KEY || '')
    
    if (!PUBLIC_KEY) {
      console.log('Missing public key')
      return new Response('error', { status: 500 })
    }

    // 验签
    const isValid = await verifyParams(params, PUBLIC_KEY)
    if (!isValid) {
      console.log('Invalid signature')
      return new Response('invalid sign', { status: 400 })
    }

    if (params.trade_status !== 'TRADE_SUCCESS') {
      console.log('Invalid trade status:', params.trade_status)
      return new Response('invalid status', { status: 400 })
    }

    console.log('Payment success:', params.out_trade_no)
    
    const outTradeNo = params.out_trade_no || ''
    
    // 幂等性检查：防止重复回调导致重复增加积分
    const orderKey = `ORDER_${outTradeNo}`
    const existingOrder = await env.MBTI_USERS?.get(orderKey)
    if (existingOrder) {
      console.log('Order already processed, skipping:', outTradeNo)
      return new Response('success', { status: 200 })
    }
    
    // 从订单号中提取手机号（格式：MBTI_手机号_时间戳_随机数）
    const paramValue = params.param || ''  // 包含 RECHARGE_积分数 或 MBTI类型
    const parts = outTradeNo.split('_')
    if (parts.length >= 2 && parts[0] === 'MBTI') {
      const phone = parts[1]
      if (/^1[3-9]\d{9}$/.test(phone)) {
        // 判断是充值还是普通支付
        const isRecharge = paramValue.startsWith('RECHARGE_')
        let creditsToAdd = 3  // 默认3积分
        if (isRecharge) {
          const rechargeCredits = parseInt(paramValue.replace('RECHARGE_', ''), 10)
          if (rechargeCredits > 0) {
            creditsToAdd = rechargeCredits
          }
        }
        
        // 增加用户积分，如果是普通支付则同时扣1积分并标记最新记录为已查看
        await addCreditsAndUseOne(env, phone, creditsToAdd, !isRecharge)
        console.log('Credits added for phone:', phone, 'amount:', creditsToAdd, 'isRecharge:', isRecharge)
        
        // 标记订单已处理（防止重复回调）
        await env.MBTI_USERS?.put(orderKey, JSON.stringify({ 
          processed: true, 
          phone,
          credits: creditsToAdd,
          isRecharge,
          time: Date.now() 
        }))
      }
    }
    
    // 返回 success 告诉志云付已收到通知
    return new Response('success', { status: 200 })

  } catch (err) {
    console.error('Notify error:', err.message)
    return new Response('error', { status: 500 })
  }
}

// 增加用户积分，如果是普通支付则同时扣1积分并标记最新记录为已查看
async function addCreditsAndUseOne(env, phone, amount = 3, useOneCredit = false) {
  try {
    const data = await env.MBTI_USERS?.get(phone)
    if (!data) {
      // 用户不存在，创建新用户（充值场景，不应该发生在普通支付）
      const userData = { phone, credits: amount, records: [] }
      await env.MBTI_USERS?.put(phone, JSON.stringify(userData))
      return
    }
    
    const userData = JSON.parse(data)
    if (typeof userData.credits !== 'number') {
      userData.credits = 0
    }
    
    // 增加积分
    userData.credits += amount
    
    // 如果是普通支付（非充值），扣1积分并标记最新记录为已查看
    if (useOneCredit && userData.records && userData.records.length > 0) {
      // 找到最新的未查看记录
      const latestRecord = userData.records[userData.records.length - 1]
      if (latestRecord && !latestRecord.viewed) {
        userData.credits -= 1  // 扣1积分
        latestRecord.viewed = true  // 标记为已查看
        console.log('Auto used 1 credit for latest record, remaining:', userData.credits)
      }
    }
    
    await env.MBTI_USERS?.put(phone, JSON.stringify(userData))
  } catch (err) {
    console.error('Add credits error:', err.message)
  }
}

function getPublicKey(raw) {
  if (!raw) return ''
  let text = raw.replace(/\\n/g, '\n').replace(/\s+/g, '').trim()
  text = text
    .replace(/-----BEGIN\s*PUBLIC\s*KEY-----/gi, '')
    .replace(/-----END\s*PUBLIC\s*KEY-----/gi, '')
    .replace(/\s/g, '')
  const lines = text.match(/.{1,64}/g) || [text]
  return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`
}

function buildSignString(params) {
  return Object.entries(params)
    .filter(([key, value]) => {
      if (key === 'sign' || key === 'sign_type') return false
      if (value === undefined || value === null) return false
      if (typeof value === 'string' && value.trim() === '') return false
      return true
    })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
}

async function verifyParams(params, publicKeyPem) {
  const sign = params.sign
  if (!sign) return false
  
  const signString = buildSignString(params)
  
  try {
    const pemContents = publicKeyPem
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '')
    
    const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))
    
    const publicKey = await crypto.subtle.importKey(
      'spki',
      binaryKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const encoder = new TextEncoder()
    const data = encoder.encode(signString)
    const signature = Uint8Array.from(atob(sign), c => c.charCodeAt(0))
    
    return await crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, signature, data)
  } catch (err) {
    console.error('Verify error:', err.message)
    return false
  }
}
