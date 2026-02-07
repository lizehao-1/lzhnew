/**
 * Cloudflare Pages Function: 查询订单状态
 * GET /api/zy/query-order?outTradeNo=xxx
 * 
 * 如果订单已支付但积分未到账，会自动补偿增加积分
 */

export async function onRequest(context) {
  const { request, env } = context
  
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  try {
    const API_BASE = env.ZY_API_BASE || 'http://pay.zy520888.com'
    const PID = env.ZY_PID
    const PRIVATE_KEY = env.ZY_PRIVATE_KEY || ''

    if (!PID || !PRIVATE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing ZY config' }), { status: 500, headers })
    }

    const url = new URL(request.url)
    const outTradeNo = url.searchParams.get('outTradeNo')
    
    if (!outTradeNo) {
      return new Response(JSON.stringify({ error: 'outTradeNo required' }), { status: 400, headers })
    }

    console.log('Querying order:', outTradeNo)

    const params = {
      pid: parseInt(PID, 10),
      out_trade_no: outTradeNo,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      sign_type: 'RSA',
    }
    params.sign = await signParams(params, PRIVATE_KEY)

    const resp = await postForm(`${API_BASE}/api/pay/query`, params)
    console.log('ZY query response:', JSON.stringify(resp))

    if (resp.code !== 0) {
      return new Response(JSON.stringify({ 
        outTradeNo, 
        paid: false, 
        status: 0,
        error: resp.msg 
      }), { status: 200, headers })
    }

    const paid = Number(resp.status) === 1
    
    // 如果订单已支付，检查是否需要补偿积分
    if (paid) {
      await compensateCreditsIfNeeded(env, outTradeNo, resp.param)
    }
    
    return new Response(JSON.stringify({ 
      outTradeNo, 
      paid, 
      status: resp.status,
      tradeNo: resp.trade_no,
      money: resp.money
    }), { status: 200, headers })

  } catch (err) {
    console.error('Query error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}

/**
 * 补偿积分：如果订单已支付但回调未执行，手动增加积分
 */
async function compensateCreditsIfNeeded(env, outTradeNo, paramValue) {
  try {
    // 检查订单是否已处理
    const orderKey = `ORDER_${outTradeNo}`
    const existingOrder = await env.MBTI_USERS?.get(orderKey)
    if (existingOrder) {
      console.log('Order already processed:', outTradeNo)
      return // 已处理，无需补偿
    }
    
    // 从订单号提取手机号
    const parts = outTradeNo.split('_')
    if (parts.length < 2 || parts[0] !== 'MBTI') return
    
    const phone = parts[1]
    if (!/^1[3-9]\d{9}$/.test(phone)) return
    
    // 判断积分数量
    const isRecharge = paramValue?.startsWith('RECHARGE_')
    let creditsToAdd = 3
    if (isRecharge) {
      const rechargeCredits = parseInt(paramValue.replace('RECHARGE_', ''), 10)
      if (rechargeCredits > 0) creditsToAdd = rechargeCredits
    }
    
    // 增加积分
    const data = await env.MBTI_USERS?.get(phone)
    if (!data) {
      // 用户不存在，创建
      const userData = { phone, credits: creditsToAdd, records: [] }
      await env.MBTI_USERS?.put(phone, JSON.stringify(userData))
    } else {
      const userData = JSON.parse(data)
      if (typeof userData.credits !== 'number') userData.credits = 0
      userData.credits += creditsToAdd
      
      // 如果是普通支付，标记最新记录为已查看
      if (!isRecharge && userData.records?.length > 0) {
        const latestRecord = userData.records[userData.records.length - 1]
        if (latestRecord && !latestRecord.viewed) {
          userData.credits -= 1
          latestRecord.viewed = true
        }
      }
      
      await env.MBTI_USERS?.put(phone, JSON.stringify(userData))
    }
    
    // 标记订单已处理
    await env.MBTI_USERS?.put(orderKey, JSON.stringify({
      processed: true,
      phone,
      credits: creditsToAdd,
      isRecharge,
      compensated: true, // 标记为补偿的
      time: Date.now()
    }))
    
    console.log('Compensated credits for:', phone, 'amount:', creditsToAdd)
  } catch (err) {
    console.error('Compensate error:', err.message)
  }
}

function normalizePem(raw, expectedLabel) {
  if (!raw) return ''
  const text = String(raw).replace(/\\n/g, '\n').trim()
  if (/-----BEGIN [^-]+-----/.test(text)) {
    return text
  }
  const compact = text.replace(/\s+/g, '')
  const lines = compact.match(/.{1,64}/g) || [compact]
  return `-----BEGIN ${expectedLabel}-----\n${lines.join('\n')}\n-----END ${expectedLabel}-----`
}

function derLength(len) {
  if (len < 0x80) return Uint8Array.from([len])
  const bytes = []
  let n = len
  while (n > 0) {
    bytes.unshift(n & 0xff)
    n >>= 8
  }
  return Uint8Array.from([0x80 | bytes.length, ...bytes])
}

function derEncode(tag, valueBytes) {
  const len = derLength(valueBytes.length)
  const out = new Uint8Array(1 + len.length + valueBytes.length)
  out[0] = tag
  out.set(len, 1)
  out.set(valueBytes, 1 + len.length)
  return out
}

function derConcat(...chunks) {
  const total = chunks.reduce((sum, c) => sum + c.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    out.set(c, offset)
    offset += c.length
  }
  return out
}

function wrapPkcs1PrivateToPkcs8(pkcs1Bytes) {
  const version = Uint8Array.from([0x02, 0x01, 0x00])
  const algId = Uint8Array.from([
    0x30, 0x0d,
    0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01,
    0x05, 0x00,
  ])
  const privateKey = derEncode(0x04, pkcs1Bytes)
  return derEncode(0x30, derConcat(version, algId, privateKey))
}

function parsePrivateKeyDer(raw) {
  const pem = normalizePem(raw, 'PRIVATE KEY')
  const isPkcs1 = /-----BEGIN RSA PRIVATE KEY-----/.test(pem)
  const b64 = pem.replace(/-----BEGIN [^-]+-----/g, '').replace(/-----END [^-]+-----/g, '').replace(/\s+/g, '')
  const keyBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  return isPkcs1 ? wrapPkcs1PrivateToPkcs8(keyBytes) : keyBytes
}

function buildSignString(params) {
  return Object.entries(params)
    .filter(([key, value]) => {
      if (key === 'sign' || key === 'sign_type') return false
      if (value === undefined || value === null) return false
      if (typeof value === 'string' && value.trim() === '') return false
      return true
    })
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
}

async function signParams(params, privateKeyPem) {
  const signString = buildSignString(params)
  
  const binaryKey = parsePrivateKeyDer(privateKeyPem)

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const encoder = new TextEncoder()
  const data = encoder.encode(signString)
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, data)
  
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
}

async function postForm(url, params) {
  const stringParams = {}
  for (const [key, value] of Object.entries(params)) {
    stringParams[key] = String(value)
  }
  
  const body = new URLSearchParams(stringParams).toString()
  
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  
  const text = await resp.text()
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}
