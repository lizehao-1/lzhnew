/**
 * 管理员API：手动添加积分
 * POST /api/admin/add-credits
 * Body: { phone, credits, adminKey }
 */
export async function onRequestPost(context) {
  const { request, env } = context
  
  try {
    const { phone, credits, adminKey } = await request.json()
    
    // 管理员密钥验证（必须在Cloudflare环境变量中设置ADMIN_KEY）
    const ADMIN_KEY = env.ADMIN_KEY
    if (!ADMIN_KEY) {
      return Response.json({ error: '服务器未配置管理员密钥' }, { status: 500 })
    }
    if (adminKey !== ADMIN_KEY) {
      return Response.json({ error: '无权限' }, { status: 403 })
    }
    
    if (!phone) {
      return Response.json({ error: '缺少手机号' }, { status: 400 })
    }
    
    const creditsToAdd = parseInt(credits) || 3
    
    // 获取现有数据
    const data = await env.MBTI_USERS?.get(phone)
    
    let userData
    if (data) {
      userData = JSON.parse(data)
      if (typeof userData.credits !== 'number') {
        userData.credits = 0
      }
      userData.credits += creditsToAdd
    } else {
      // 用户不存在，创建新用户
      userData = { phone, credits: creditsToAdd, records: [] }
    }
    
    await env.MBTI_USERS?.put(phone, JSON.stringify(userData))
    
    return Response.json({ 
      success: true, 
      phone,
      creditsAdded: creditsToAdd,
      totalCredits: userData.credits
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
