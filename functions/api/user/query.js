/**
 * 查询用户历史记录
 * GET /api/user/query?phone=xxx
 */
export async function onRequestGet(context) {
  const { request, env } = context
  
  try {
    const url = new URL(request.url)
    const phone = url.searchParams.get('phone')
    
    if (!phone) {
      return Response.json({ error: '缺少手机号' }, { status: 400 })
    }
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return Response.json({ error: '手机号格式不正确' }, { status: 400 })
    }
    
    // 从 KV 获取数据
    const data = await env.MBTI_USERS?.get(phone)
    
    if (!data) {
      return Response.json({ found: false, records: [] })
    }
    
    const userData = JSON.parse(data)
    return Response.json({ found: true, records: userData.records })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
