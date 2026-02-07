/**
 * 查询用户历史记录
 * GET /api/user/query?phone=xxx&pin=xxxx
 * 
 * 返回用户的所有测试记录和剩余积分
 * 需要PIN码验证
 */
export async function onRequestGet(context) {
  const { request, env } = context
  
  try {
    const url = new URL(request.url)
    const phone = url.searchParams.get('phone')
    const pin = url.searchParams.get('pin')
    
    if (!phone) {
      return Response.json({ error: '缺少手机号' }, { status: 400 })
    }
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return Response.json({ error: '手机号格式不正确' }, { status: 400 })
    }
    
    const db = env.MBTI_DB
    const user = await db.prepare('SELECT phone, pin, credits FROM users WHERE phone = ?')
      .bind(phone)
      .first()

    if (!user) {
      return noCacheResponse({ found: false, records: [], credits: 0 })
    }

    if (user.pin && user.pin !== pin) {
      return noCacheResponse({ error: 'PIN码错误', found: true, needPin: true }, 401)
    }

    const records = await db.prepare(
      'SELECT result, question_set AS questionSet, ts AS timestamp, viewed FROM records WHERE phone = ? ORDER BY ts ASC'
    ).bind(phone).all()

    return noCacheResponse({
      found: true,
      records: records.results || [],
      credits: user.credits || 0
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
