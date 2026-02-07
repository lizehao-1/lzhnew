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
    
    // 从 KV 获取数据
    const data = await env.MBTI_USERS?.get(phone)
    
    if (!data) {
      return Response.json({ error: '用户不存在' }, { status: 404 })
    }
    
    const userData = JSON.parse(data)
    
    // 确保有 credits 字段
    if (typeof userData.credits !== 'number') {
      userData.credits = 0
    }
    
    // 增加3次查看积分
    userData.credits += 3
    
    // 保存回 KV
    await env.MBTI_USERS?.put(phone, JSON.stringify(userData))
    
    return Response.json({ success: true, credits: userData.credits })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
