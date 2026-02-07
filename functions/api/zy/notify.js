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

    const PUBLIC_KEY = env.ZY_PUBLIC_KEY || ''
    
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
    const db = env.MBTI_DB
    const existingOrder = await db.prepare('SELECT processed FROM orders WHERE out_trade_no = ?')
      .bind(outTradeNo)
      .first()
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
        
        await applyPayment(db, outTradeNo, phone, creditsToAdd, isRecharge)
        console.log('Credits added for phone:', phone, 'amount:', creditsToAdd, 'isRecharge:', isRecharge)
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
async function applyPayment(db, outTradeNo, phone, amount = 3, isRecharge = false) {
  try {
    const now = Date.now()
    await db.prepare(
      'INSERT INTO orders (out_trade_no, phone, credits_delta, is_recharge, processed, created_at) VALUES (?, ?, ?, ?, 1, ?)'
    ).bind(outTradeNo, phone, amount, isRecharge ? 1 : 0, now).run()

    await db.prepare(
      'INSERT INTO users (phone, pin, credits, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ' +
      'ON CONFLICT(phone) DO UPDATE SET credits = credits + excluded.credits, updated_at = excluded.updated_at'
    ).bind(phone, '', amount, now, now).run()

    if (!isRecharge) {
      const latest = await db.prepare(
        'SELECT id FROM records WHERE phone = ? AND viewed = 0 ORDER BY ts DESC LIMIT 1'
      ).bind(phone).first()
      if (latest?.id) {
        await db.batch([
          db.prepare('UPDATE records SET viewed = 1 WHERE id = ?').bind(latest.id),
          db.prepare('UPDATE users SET credits = credits - 1, updated_at = ? WHERE phone = ? AND credits > 0').bind(now, phone)
        ])
      }
    }
  } catch (err) {
    console.error('Apply payment error:', err.message)
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

function wrapPkcs1PublicToSpki(pkcs1Bytes) {
  const algId = Uint8Array.from([
    0x30, 0x0d,
    0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01,
    0x05, 0x00,
  ])
  const bitStringBody = new Uint8Array(pkcs1Bytes.length + 1)
  bitStringBody[0] = 0x00
  bitStringBody.set(pkcs1Bytes, 1)
  const publicKey = derEncode(0x03, bitStringBody)
  return derEncode(0x30, derConcat(algId, publicKey))
}

function parsePublicKeyDer(raw) {
  const pem = normalizePem(raw, 'PUBLIC KEY')
  const isPkcs1 = /-----BEGIN RSA PUBLIC KEY-----/.test(pem)
  const b64 = pem.replace(/-----BEGIN [^-]+-----/g, '').replace(/-----END [^-]+-----/g, '').replace(/\s+/g, '')
  const keyBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  return isPkcs1 ? wrapPkcs1PublicToSpki(keyBytes) : keyBytes
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

async function verifyParams(params, publicKeyPem) {
  const sign = params.sign
  if (!sign) return false
  
  const signString = buildSignString(params)
  
  try {
    const binaryKey = parsePublicKeyDer(publicKeyPem)

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
