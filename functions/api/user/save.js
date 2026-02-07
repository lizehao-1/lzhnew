/**
 * 保存用户测试结果
 * POST /api/user/save
 * Body: { phone, result, answers, questionSet }
 */
export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    const { phone, result, answers, questionSet } = await request.json()
    
    if (!phone || !result) {
      return Response.json({ error: '缺少必要参数' }, { status: 400 })
    }
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return Response.json({ error: '手机号格式不正确' }, { status: 400 })
    }
    
    // 获取现有数据
    const existing = await env.MBTI_USERS?.get(phone)
    const userData = existing ? JSON.parse(existing) : { phone, records: [] }
    
    // 添加新记录
    userData.records.push({
      result,
      answers,
      questionSet,
      timestamp: Date.now(),
      paid: false
    })
    
    // 只保留最近 10 条记录
    if (userData.records.length > 10) {
      userData.records = userData.records.slice(-10)
    }
    
    // 保存到 KV
    await env.MBTI_USERS?.put(phone, JSON.stringify(userData))
    
    return Response.json({ success: true, recordCount: userData.records.length })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
