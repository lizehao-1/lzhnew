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
    
    // 从订单号中提取手机号（格式：MBTI_手机号_时间戳）
    const outTradeNo = params.out_trade_no || ''
    const paramValue = params.param || ''  // 包含 RECHARGE_积分数 或 MBTI类型
    const parts = outTradeNo.split('_')
    if (parts.length >= 2 && parts[0] === 'MBTI') {
      const phone = parts[1]
      if (/^1[3-9]\d{9}$/.test(phone)) {
        // 判断是充值还是普通支付
        let creditsToAdd = 3  // 默认3积分
        if (paramValue.startsWith('RECHARGE_')) {
          const rechargeCredits = parseInt(paramValue.replace('RECHARGE_', ''), 10)
          if (rechargeCredits > 0) {
            creditsToAdd = rechargeCredits
          }
        }
        // 增加用户积分
        await addCredits(env, phone, creditsToAdd)
        console.log('Credits added for phone:', phone, 'amount:', creditsToAdd)
      }
    }
    
    // 返回 success 告诉志云付已收到通知
    return new Response('success', { status: 200 })

  } catch (err) {
    console.error('Notify error:', err.message)
    return new Response('error', { status: 500 })
  }
}

// 增加用户积分
async function addCredits(env, phone, amount = 3) {
  try {
    const data = await env.MBTI_USERS?.get(phone)
    if (!data) {
      // 用户不存在，创建新用户
      const userData = { phone, credits: amount, records: [] }
      await env.MBTI_USERS?.put(phone, JSON.stringify(userData))
      return
    }
    
    const userData = JSON.parse(data)
    if (typeof userData.credits !== 'number') {
      userData.credits = 0
    }
    userData.credits += amount
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
