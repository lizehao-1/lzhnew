/**
 * 使用积分查看完整报告
 * POST /api/user/use-credit
 * Body: { phone, timestamp }
 * 
 * 消耗1次积分，标记该记录为已查看
 */
export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    const { phone, timestamp } = await request.json()
    
    if (!phone || !timestamp) {
      return Response.json({ error: '缺少必要参数' }, { status: 400 })
    }
    
    // 从 KV 获取数据
    const data = await env.MBTI_USERS?.get(phone)
    
    if (!data) {
      return Response.json({ error: '用户不存在' }, { status: 404 })
    }
    
    const userData = JSON.parse(data)
    
    // 找到对应记录
    const record = userData.records.find(r => r.timestamp === timestamp)
    if (!record) {
      return Response.json({ error: '记录不存在' }, { status: 404 })
    }
    
    // 如果已经查看过，不再消耗积分
    if (record.viewed) {
      return Response.json({ 
        success: true, 
        credits: userData.credits,
        alreadyViewed: true 
      })
    }
    
    // 检查积分
    if (userData.credits <= 0) {
      return Response.json({ 
        error: '积分不足，请先支付', 
        needPayment: true,
        credits: 0 
      }, { status: 402 })
    }
    
    // 消耗积分
    userData.credits -= 1
    record.viewed = true
    
    // 保存回 KV
    await env.MBTI_USERS?.put(phone, JSON.stringify(userData))
    
    return Response.json({ 
      success: true, 
      credits: userData.credits,
      alreadyViewed: false
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
