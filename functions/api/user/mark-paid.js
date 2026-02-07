/**
 * 标记用户已支付 - 增加积分
 * POST /api/user/mark-paid
 * Body: { phone, timestamp }
 * 
 * 支付成功后增加3次查看积分
 */
export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    const { phone, timestamp } = await request.json()
    
    if (!phone) {
      return Response.json({ error: '缺少手机号' }, { status: 400 })
    }
    
    const db = env.MBTI_DB
    const now = Date.now()

    const existing = await db.prepare('SELECT credits FROM users WHERE phone = ?').bind(phone).first()
    if (!existing) {
      await db.prepare('INSERT INTO users (phone, pin, credits, created_at, updated_at) VALUES (?, ?, 3, ?, ?)')
        .bind(phone, '', now, now)
        .run()
      return Response.json({ success: true, credits: 3 })
    }

    await db.prepare('UPDATE users SET credits = credits + 3, updated_at = ? WHERE phone = ?')
      .bind(now, phone)
      .run()

    const updated = await db.prepare('SELECT credits FROM users WHERE phone = ?').bind(phone).first()
    return Response.json({ success: true, credits: updated?.credits ?? 0 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
