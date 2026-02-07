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
    
    // 获取现有数据
    const existing = await env.MBTI_USERS?.get(phone)
    const userData = existing ? JSON.parse(existing) : { phone, pin, credits: 0, records: [] }
    
    // 如果是新用户，设置PIN码；如果是老用户，验证PIN码
    if (existing) {
      // 老用户：如果已有PIN码，需要验证
      if (userData.pin && userData.pin !== pin) {
        return Response.json({ error: 'PIN码错误' }, { status: 401 })
      }
      // 如果老用户没有PIN码（兼容旧数据），设置新PIN码
      if (!userData.pin) {
        userData.pin = pin
      }
    } else {
      // 新用户：设置PIN码
      userData.pin = pin
    }
    
    // 确保有 credits 字段（兼容旧数据）
    if (typeof userData.credits !== 'number') {
      userData.credits = 0
    }
    
    // 添加新记录
    const newRecord = {
      result,
      answers,
      questionSet,
      timestamp: Date.now(),
      viewed: false  // 是否已使用积分查看
    }
    userData.records.push(newRecord)
    
    // 只保留最近 20 条记录
    if (userData.records.length > 20) {
      userData.records = userData.records.slice(-20)
    }
    
    // 保存到 KV
    await env.MBTI_USERS?.put(phone, JSON.stringify(userData))
    
    return Response.json({ 
      success: true, 
      recordCount: userData.records.length,
      credits: userData.credits,
      timestamp: newRecord.timestamp,
      isNewUser: !existing
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
