/**
 * 保存用户测试结果
 * POST /api/user/save
 * Body: { phone, pin, result, answers, questionSet }
 * 
 * 积分系统：
 * - credits: 剩余查看完整报告次数
 * - 支付一次 = 3次查看机会（当前 + 2次重测）
 * - 积分用完需重新付费
 * 
 * PIN码：4位数字，用于验证身份
 */
export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    const { phone, pin, result, answers, questionSet } = await request.json()
    
    if (!phone || !result) {
      return Response.json({ error: '缺少必要参数' }, { status: 400 })
    }
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return Response.json({ error: '手机号格式不正确' }, { status: 400 })
    }
    
    // 验证PIN码格式（4位数字）
    if (!pin || !/^\d{4}$/.test(pin)) {
      return Response.json({ error: 'PIN码必须是4位数字' }, { status: 400 })
    }
    
    const db = env.MBTI_DB
    const now = Date.now()

    const existing = await db.prepare('SELECT phone, pin, credits FROM users WHERE phone = ?')
      .bind(phone)
      .first()

    if (existing) {
      if (existing.pin && existing.pin !== pin) {
        return Response.json({ error: 'PIN码错误' }, { status: 401 })
      }
      if (!existing.pin) {
        await db.prepare('UPDATE users SET pin = ?, updated_at = ? WHERE phone = ?')
          .bind(pin, now, phone)
          .run()
      }
    } else {
      await db.prepare('INSERT INTO users (phone, pin, credits, created_at, updated_at) VALUES (?, ?, 0, ?, ?)')
        .bind(phone, pin, now, now)
        .run()
    }

    const recent = await db.prepare(
      'SELECT ts FROM records WHERE phone = ? AND result = ? AND IFNULL(question_set, \"\") = IFNULL(?, \"\") AND ts > ? ORDER BY ts DESC LIMIT 1'
    ).bind(phone, result, questionSet || '', now - 5 * 60 * 1000).first()

    if (recent?.ts) {
      const creditsRow = await db.prepare('SELECT credits FROM users WHERE phone = ?').bind(phone).first()
      return Response.json({
        success: true,
        recordCount: null,
        credits: creditsRow?.credits || 0,
        timestamp: recent.ts,
        isNewUser: !existing,
        existingRecord: true
      })
    }

    await db.prepare('INSERT INTO records (phone, result, question_set, ts, viewed) VALUES (?, ?, ?, ?, 0)')
      .bind(phone, result, questionSet || null, now)
      .run()

    const creditsRow = await db.prepare('SELECT credits FROM users WHERE phone = ?').bind(phone).first()

    return Response.json({
      success: true,
      recordCount: null,
      credits: creditsRow?.credits || 0,
      timestamp: now,
      isNewUser: !existing,
      existingRecord: false
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
