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
      return noCacheResponse({ error: '缺少必要参数' }, 400)
    }
    
    // 从 KV 获取数据
    const data = await env.MBTI_USERS?.get(phone)
    
    if (!data) {
      return noCacheResponse({ error: '用户不存在' }, 404)
    }
    
    const userData = JSON.parse(data)
    
    // 找到对应记录
    const record = userData.records.find(r => r.timestamp === timestamp)
    if (!record) {
      return noCacheResponse({ error: '记录不存在' }, 404)
    }
    
    // 如果已经查看过，不再消耗积分
    if (record.viewed) {
      return noCacheResponse({ 
        success: true, 
        credits: userData.credits,
        alreadyViewed: true 
      })
    }
    
    // 检查积分
    if (userData.credits <= 0) {
      return noCacheResponse({ 
        error: '积分不足，请先支付', 
        needPayment: true,
        credits: 0 
      }, 402)
    }
    
    // 消耗积分
    userData.credits -= 1
    record.viewed = true
    
    // 保存回 KV
    await env.MBTI_USERS?.put(phone, JSON.stringify(userData))
    
    return noCacheResponse({ 
      success: true, 
      credits: userData.credits,
      alreadyViewed: false
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
