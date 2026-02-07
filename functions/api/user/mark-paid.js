/**
 * 标记用户已支付
 * POST /api/user/mark-paid
 * Body: { phone, timestamp }
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
    
    // 标记指定记录或最新记录为已支付
    if (timestamp) {
      const record = userData.records.find(r => r.timestamp === timestamp)
      if (record) record.paid = true
    } else if (userData.records.length > 0) {
      userData.records[userData.records.length - 1].paid = true
    }
    
    // 保存回 KV
    await env.MBTI_USERS?.put(phone, JSON.stringify(userData))
    
    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
