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
    const PRICE = env.ZY_PRICE || '1'
    const PRIVATE_KEY = getPrivateKey(env.ZY_PRIVATE_KEY || '')
    
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
    const customPrice = payload.price  // 自定义价格（充值用）
    const type = payload.type || 'alipay'
    const apiMethod = payload.method || 'web'

    if (!mbtiResult) {
      return new Response(JSON.stringify({ error: 'mbtiResult required' }), { status: 400, headers })
    }

    // 使用自定义价格或环境变量价格
    const finalPrice = customPrice || PRICE

    // 订单号格式：MBTI_手机号_时间戳_随机数（用于回调时识别用户）
    // 如果是充值订单，格式：MBTI_手机号_RECHARGE_积分数_时间戳_随机数
    const outTradeNo = phone 
      ? `MBTI_${phone}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      : `MBTI_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    const now = Math.floor(Date.now() / 1000).toString()
    const clientip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
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

function getPrivateKey(raw) {
  if (!raw) return ''
  let text = raw.replace(/\\n/g, '\n').replace(/\s+/g, '').trim()
  text = text
    .replace(/-----BEGIN\s*(RSA\s*)?PRIVATE\s*KEY-----/gi, '')
    .replace(/-----END\s*(RSA\s*)?PRIVATE\s*KEY-----/gi, '')
    .replace(/\s/g, '')
  const lines = text.match(/.{1,64}/g) || [text]
  return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`
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

async function signParams(params, privateKeyPem) {
  const signString = buildSignString(params)
  console.log('Sign string:', signString)

  const pemContents = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))
  
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
