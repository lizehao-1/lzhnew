/**
 * 管理员API：手动添加积分
 * POST /api/admin/add-credits
 * Body: { phone, credits, adminKey }
 */
export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    const { phone, credits, adminKey } = await request.json()
    
    // 管理员密钥验证（必须在Cloudflare环境变量中设置ADMIN_KEY）
    const ADMIN_KEY = env.ADMIN_KEY
    if (!ADMIN_KEY) {
      return Response.json({ error: '服务器未配置管理员密钥' }, { status: 500 })
    }
    if (adminKey !== ADMIN_KEY) {
      return Response.json({ error: '无权限' }, { status: 403 })
    }
    
    if (!phone) {
      return Response.json({ error: '缺少手机号' }, { status: 400 })
    }
    
    const creditsToAdd = parseInt(credits) || 3
    
    const db = env.MBTI_DB
    const now = Date.now()

    const existing = await db.prepare('SELECT credits FROM users WHERE phone = ?').bind(phone).first()
    if (!existing) {
      await db.prepare('INSERT INTO users (phone, pin, credits, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
        .bind(phone, '', creditsToAdd, now, now)
        .run()
      return Response.json({
        success: true,
        phone,
        creditsAdded: creditsToAdd,
        totalCredits: creditsToAdd
      })
    }

    await db.prepare('UPDATE users SET credits = credits + ?, updated_at = ? WHERE phone = ?')
      .bind(creditsToAdd, now, phone)
      .run()

    const updated = await db.prepare('SELECT credits FROM users WHERE phone = ?').bind(phone).first()

    return Response.json({
      success: true,
      phone,
      creditsAdded: creditsToAdd,
      totalCredits: updated?.credits ?? 0
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
