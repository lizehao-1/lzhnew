/**
 * Admin API: list users with latest record
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
      const row = await db.prepare(
        'SELECT u.phone, u.pin, u.credits, u.created_at, u.updated_at, r.result AS last_result, r.ts AS last_ts ' +
        'FROM users u ' +
        'LEFT JOIN records r ON r.phone = u.phone ' +
        'AND r.ts = (SELECT MAX(ts) FROM records WHERE phone = u.phone) ' +
        'WHERE u.phone = ?'
      ).bind(phone).first()
      return Response.json({ users: row ? [row] : [] })
    }

    const rows = await db.prepare(
      'SELECT u.phone, u.pin, u.credits, u.created_at, u.updated_at, r.result AS last_result, r.ts AS last_ts ' +
      'FROM users u ' +
      'LEFT JOIN records r ON r.phone = u.phone ' +
      'AND r.ts = (SELECT MAX(ts) FROM records WHERE phone = u.phone) ' +
      'ORDER BY u.updated_at DESC LIMIT ? OFFSET ?'
    )
      .bind(safeLimit, safeOffset)
      .all()

    return Response.json({ users: rows?.results || [] })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
