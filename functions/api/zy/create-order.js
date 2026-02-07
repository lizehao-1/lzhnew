/**
 * Cloudflare Pages Function: 创建志云付订单
 * POST /api/zy/create-order
 */

export async function onRequest(context) {
  const { request, env } = context
  
  // CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    })
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }

  try {
    const API_BASE = env.ZY_API_BASE || 'http://pay.zy520888.com'
    const PID = env.ZY_PID
    const PRIVATE_KEY = env.ZY_PRIVATE_KEY || ''
    
    // 价格表（后端定义，不可篡改）
    const PRICE_TABLE = {
      'default': '1',        // 默认单次支付
      'RECHARGE_3': '1',     // 3次 ¥1
      'RECHARGE_10': '3',    // 10次 ¥3
      'RECHARGE_30': '8',    // 30次 ¥8
    }
    
    // Cloudflare Pages 提供的 URL
    const url = new URL(request.url)
    const FRONTEND_URL = `${url.protocol}//${url.host}`

    if (!PID) {
      return new Response(JSON.stringify({ error: 'Missing ZY_PID' }), { status: 500, headers })
    }
    if (!PRIVATE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing ZY_PRIVATE_KEY' }), { status: 500, headers })
    }

    const payload = await request.json().catch(() => ({}))
    const mbtiResult = payload.mbtiResult
    const phone = payload.phone || ''  // 手机号
    const type = payload.type || 'alipay'
    const apiMethod = payload.method || 'web'

    if (!mbtiResult) {
      return new Response(JSON.stringify({ error: 'mbtiResult required' }), { status: 400, headers })
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return new Response(JSON.stringify({ error: 'valid phone required' }), { status: 400, headers })
    }

    // 根据 mbtiResult 查价格表，找不到就用默认价格
    const finalPrice = PRICE_TABLE[mbtiResult] || PRICE_TABLE['default']

    // 订单号格式：MBTI_手机号_时间戳_随机数（用于回调时识别用户）
    const outTradeNo = phone 
      ? `MBTI_${phone}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      : `MBTI_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    const now = Math.floor(Date.now() / 1000).toString()
    const clientip = getClientIp(request)
    const ua = request.headers.get('user-agent') || ''
    const device = ua.includes('Mobile') ? 'mobile' : 'pc'

    const notifyUrl = `${FRONTEND_URL}/api/zy/notify`
    const returnUrl = `${FRONTEND_URL}/payment`

    const params = {
      pid: parseInt(PID, 10),
      method: apiMethod,
      device,
      type,
      out_trade_no: outTradeNo,
      notify_url: notifyUrl,
      return_url: returnUrl,
      name: 'MBTI报告解锁',
      money: parseFloat(finalPrice).toFixed(2),
      clientip,
      param: mbtiResult,
      timestamp: now,
      sign_type: 'RSA',
    }

    // 签名
    params.sign = await signParams(params, PRIVATE_KEY)

    console.log('Creating order:', outTradeNo)

    const resp = await postForm(`${API_BASE}/api/pay/create`, params)
    console.log('ZY response:', JSON.stringify(resp))

    if (resp.code !== 0) {
      return new Response(JSON.stringify({ error: resp.msg || 'Create failed', response: resp }), { status: 400, headers })
    }

    return new Response(JSON.stringify({
      outTradeNo,
      tradeNo: resp.trade_no,
      payType: resp.pay_type,
      payInfo: resp.pay_info,
      money: finalPrice,
    }), { status: 200, headers })

  } catch (err) {
    console.error('Error:', err.message, err.stack)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
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
  console.log('Sign string:', signString)

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

function isIPv4(ip) {
  return /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(ip)
}

function getClientIp(request) {
  const raw = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || ''
  const first = raw.split(',')[0].trim()
  return isIPv4(first) ? first : '127.0.0.1'
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
