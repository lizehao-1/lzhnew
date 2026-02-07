/**
 * Admin API: list users
 * POST /api/admin/users
 * Body: { adminKey, phone?, limit?, offset? }
 */
export async function onRequestPost(context) {
  const { request, env } = context

  try {
    const { adminKey, phone, limit, offset } = await request.json()

    const ADMIN_KEY = env.ADMIN_KEY
    if (!ADMIN_KEY) {
      return Response.json({ error: 'ADMIN_KEY not set' }, { status: 500 })
    }
    if (adminKey !== ADMIN_KEY) {
      return Response.json({ error: 'unauthorized' }, { status: 403 })
    }

    const db = env.MBTI_DB
    const safeLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 200)
    const safeOffset = Math.max(parseInt(offset) || 0, 0)

    if (phone) {
      const row = await db.prepare('SELECT phone, credits, created_at, updated_at FROM users WHERE phone = ?')
        .bind(phone)
        .first()
      return Response.json({ users: row ? [row] : [] })
    }

    const rows = await db.prepare(
      'SELECT phone, credits, created_at, updated_at FROM users ORDER BY updated_at DESC LIMIT ? OFFSET ?'
    )
      .bind(safeLimit, safeOffset)
      .all()

    return Response.json({ users: rows?.results || [] })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
