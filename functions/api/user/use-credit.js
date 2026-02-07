/**
 * 使用积分查看完整报告
 * POST /api/user/use-credit
 * Body: { phone, timestamp }
 * 
 * 消耗1次积分，标记该记录为已查看
 */
export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    const { phone, timestamp } = await request.json()
    
    if (!phone || !timestamp) {
      return noCacheResponse({ error: '缺少必要参数' }, 400)
    }
    
    const db = env.MBTI_DB
    const user = await db.prepare('SELECT credits FROM users WHERE phone = ?').bind(phone).first()

    if (!user) {
      return noCacheResponse({ error: '用户不存在' }, 404)
    }

    const record = await db.prepare('SELECT viewed FROM records WHERE phone = ? AND ts = ?')
      .bind(phone, timestamp)
      .first()

    if (!record) {
      return noCacheResponse({ error: '记录不存在' }, 404)
    }

    if (record.viewed) {
      return noCacheResponse({
        success: true,
        credits: user.credits,
        alreadyViewed: true
      })
    }

    const dec = await db.prepare('UPDATE users SET credits = credits - 1, updated_at = ? WHERE phone = ? AND credits > 0')
      .bind(Date.now(), phone)
      .run()

    if (dec.meta?.changes === 0) {
      return noCacheResponse({
        error: '积分不足，请先支付',
        needPayment: true,
        credits: 0
      }, 402)
    }

    await db.prepare('UPDATE records SET viewed = 1 WHERE phone = ? AND ts = ?')
      .bind(phone, timestamp)
      .run()

    const updated = await db.prepare('SELECT credits FROM users WHERE phone = ?').bind(phone).first()

    return noCacheResponse({
      success: true,
      credits: updated?.credits ?? 0,
      alreadyViewed: false
    })
  } catch (err) {
    return noCacheResponse({ error: err.message }, 500)
  }
}

// 返回禁止缓存的 JSON 响应
function noCacheResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}
