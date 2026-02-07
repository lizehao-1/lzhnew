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
    
    // 从 KV 获取数据
    const data = await env.MBTI_USERS?.get(phone)
    
    if (!data) {
      return Response.json({ found: false, records: [], credits: 0 })
    }
    
    const userData = JSON.parse(data)
    
    // 验证PIN码
    if (userData.pin && userData.pin !== pin) {
      return Response.json({ error: 'PIN码错误', found: true, needPin: true }, { status: 401 })
    }
    
    return Response.json({ 
      found: true, 
      records: userData.records,
      credits: userData.credits || 0
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
