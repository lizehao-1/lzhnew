import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'

const DEFAULT_PRICE = '1'

type PayData = {
  outTradeNo: string
  tradeNo: string
  payType: string
  payInfo: string
  money?: string
}

/**
 * 支付页面 - 按行业最佳实践设计
 * 
 * 流程：
 * 1. 输入手机号 → 保存记录 → 检查积分
 * 2. 有积分 → 使用积分 → 跳转结果
 * 3. 无积分 → 创建订单 → 支付 → 轮询确认
 * 
 * 关键点：
 * - 后端 query-order 会自动补偿积分（如果回调失败）
 * - 前端只需轮询订单状态，不需要复杂的积分检查逻辑
 */
export default function Payment() {
  const navigate = useNavigate()
  const [result, setResult] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [step, setStep] = useState<'phone' | 'checking' | 'intro' | 'pay' | 'polling'>(() => {
    return localStorage.getItem('mbti_from_test') === '1' ? 'checking' : 'phone'
  })
  const [payData, setPayData] = useState<PayData | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const MAX_POLLS = 30 // 最多轮询30次（60秒）

  // 初始化
  useEffect(() => {
    const savedResult = localStorage.getItem('mbti_result')
    if (!savedResult) {
      navigate('/')
      return
    }
    setResult(savedResult)
    
    const savedPhone = localStorage.getItem('mbti_phone')
    const savedPin = localStorage.getItem('mbti_pin')
    if (savedPhone) setPhone(savedPhone)
    if (savedPin) setPin(savedPin)
    
    // 检查未完成订单
    const savedOrder = localStorage.getItem('mbti_pending_order')
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder)
        const orderTime = extractOrderTimestamp(order.outTradeNo)
        // 30分钟内的订单才恢复
        if (orderTime && Date.now() - orderTime < 30 * 60 * 1000) {
          setPayData(order)
          setStep('polling')
          localStorage.removeItem('mbti_from_test')
          return
        }
        localStorage.removeItem('mbti_pending_order')
      } catch { 
        localStorage.removeItem('mbti_pending_order')
      }
    }
    
    // 有登录信息，自动检查
    if (savedPhone && savedPin && /^1[3-9]\d{9}$/.test(savedPhone) && /^\d{4}$/.test(savedPin)) {
      handleAutoLogin(savedResult, savedPhone, savedPin).finally(() => {
        localStorage.removeItem('mbti_from_test')
      })
      return
    }

    localStorage.removeItem('mbti_from_test')
    setStep('phone')
  }, [])

  // 自动登录检查
  const handleAutoLogin = async (result: string, phone: string, pin: string) => {
    setStep('checking')
    try {
      const questionSet = localStorage.getItem('mbti_question_set')
      const resp = await fetch('/api/user/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin, result, questionSet })
      })
      const data = await resp.json()
      
      if (resp.status === 401) {
        setStep('phone')
        setPhoneError('密码错误，请重新输入')
        return
      }
      
      if (data.success && data.credits > 0) {
        // 有积分，使用积分
        const useResp = await fetch('/api/user/use-credit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, timestamp: data.timestamp })
        })
        const useData = await useResp.json()
        if (useData.success) {
          localStorage.setItem('mbti_paid', 'true')
          window.dispatchEvent(new Event('mbti-login-change'))
          navigate('/result')
          return
        }
      }
      setStep('intro')
    } catch {
      setStep('intro')
    }
  }

  const benefits = useMemo(() => [
    '四维度偏好分析图表',
    '核心优势与成长空间',
    '职业方向建议',
    '人际关系与沟通技巧',
    '本周可执行的行动建议',
  ], [])

  const handlePhoneSubmit = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setPhoneError('请输入正确的手机号')
      return
    }
    if (!pin || !/^\d{4}$/.test(pin)) {
      setPhoneError('PIN码必须是4位数字')
      return
    }
    setPhoneError('')
    localStorage.setItem('mbti_phone', phone)
    localStorage.setItem('mbti_pin', pin)
    window.dispatchEvent(new Event('mbti-login-change'))
    
    if (result) {
      await handleAutoLogin(result, phone, pin)
    }
  }

  const createOrder = async () => {
    if (!result) return
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请先输入有效手机号')
      setStep('phone')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const resp = await fetch('/api/zy/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mbtiResult: result, phone, type: 'alipay', method: 'web' }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || '创建订单失败')
      
      setPayData(data)
      setStep('pay')
      setPollCount(0)
      localStorage.setItem('mbti_pending_order', JSON.stringify(data))

      if (data.payType === 'qrcode') {
        setQrDataUrl(await QRCode.toDataURL(data.payInfo, { width: 200 }))
      } else {
        setQrDataUrl(null)
      }
    } catch (err: any) {
      setError(err.message || '创建订单失败')
    } finally {
      setLoading(false)
    }
  }

  const syncCreditsAfterPayment = useCallback(async () => {
    const savedPhone = localStorage.getItem('mbti_phone')
    const savedPin = localStorage.getItem('mbti_pin')
    if (!savedPhone || !savedPin) return
    try {
      await fetch(`/api/user/query?phone=${encodeURIComponent(savedPhone)}&pin=${encodeURIComponent(savedPin)}&t=${Date.now()}`)
    } catch {
      // ignore
    }
  }, [])

  // 查询订单状态（后端会自动补偿积分）
  const checkOrderStatus = useCallback(async () => {
    if (!payData) return false
    
    try {
      const resp = await fetch(`/api/zy/query-order?outTradeNo=${encodeURIComponent(payData.outTradeNo)}`)
      const data = await resp.json()
      
      if (data.paid) {
        // 订单已支付，后端已自动补偿积分
        localStorage.removeItem('mbti_pending_order')
        localStorage.setItem('mbti_last_paid_order', payData.outTradeNo)
        localStorage.setItem('mbti_last_paid_at', String(Date.now()))
        localStorage.removeItem('mbti_credits_delta')
        localStorage.removeItem('mbti_credits_override_at')
        localStorage.setItem('mbti_paid', 'true')
        await syncCreditsAfterPayment()
        window.dispatchEvent(new Event('mbti-login-change'))
        navigate('/result')
        return true
      }
    } catch { /* ignore */ }
    return false
  }, [payData, navigate, syncCreditsAfterPayment])

  // 轮询支付状态
  useEffect(() => {
    if (step !== 'polling' || !payData) return
    
    let cancelled = false
    
    const poll = async () => {
      if (cancelled) return
      
      const paid = await checkOrderStatus()
      if (paid || cancelled) return
      
      setPollCount(prev => {
        if (prev >= MAX_POLLS) {
          setError('支付确认超时，请点击"手动刷新"重试')
          return prev
        }
        return prev + 1
      })
    }
    
    poll() // 立即执行一次
    const timer = setInterval(poll, 2000)
    
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [step, payData, checkOrderStatus])

  const openPayment = () => {
    if (!payData) return
    if (payData.payType === 'jump' || payData.payType === 'urlscheme') {
      window.open(payData.payInfo, '_blank')
    } else if (payData.payType === 'html') {
      const w = window.open('', '_blank')
      if (w) {
        w.document.write(payData.payInfo)
        w.document.close()
      }
    }
  }

  // 手动刷新
  const manualRefresh = async () => {
    setError(null)
    setPollCount(0)
    const paid = await checkOrderStatus()
    if (!paid) {
      setError('暂未查询到支付结果，请稍后再试')
    }
  }

  // 取消并重新支付
  const cancelAndRetry = () => {
    localStorage.removeItem('mbti_pending_order')
    setPayData(null)
    setPollCount(0)
    setError(null)
    setStep('intro')
  }

  if (!result) return null
  const displayPrice = payData?.money || DEFAULT_PRICE

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mbti-card p-6">
        {/* 结果预览 */}
        <div className="text-center mb-6">
          <div className="text-xs text-slate-500 mb-1">你的类型</div>
          <div className="text-4xl font-black text-slate-950">{result}</div>
        </div>

        {/* 步骤1: 输入手机号 */}
        {step === 'phone' && (
          <div>
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">保存你的测试结果</h2>
              <p className="text-xs text-slate-500 mt-1">支付后可随时查看历史记录</p>
            </div>
            <div className="space-y-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="请输入手机号"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-center text-lg tracking-widest"
              />
              <input
                type="tel"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="设置4位数字密码"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-center text-lg tracking-widest"
              />
              <p className="text-xs text-slate-400 text-center">🔒 密码用于保护你的测试记录</p>
              {phoneError && <p className="text-xs text-red-500 text-center">{phoneError}</p>}
              <button className="w-full mbti-button-primary" onClick={handlePhoneSubmit}>继续</button>
            </div>
          </div>
        )}

        {/* 检查中 */}
        {step === 'checking' && (
          <div className="text-center py-6">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 mx-auto" />
            <p className="mt-4 text-sm text-slate-600">正在检查账户...</p>
          </div>
        )}

        {/* 步骤2: 支付介绍 */}
        {step === 'intro' && (
          <div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-900">完整人格解析报告</span>
                <span className="text-xl font-black text-slate-950">¥{displayPrice}</span>
              </div>
              <div className="space-y-2">
                {benefits.map((b) => (
                  <div key={b} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="text-emerald-500">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  💡 支付一次可查看 <span className="font-bold text-slate-700">3次</span> 完整报告
                </p>
              </div>
            </div>
            <button className="w-full mbti-button-primary" onClick={createOrder} disabled={loading}>
              {loading ? '创建订单中...' : `支付 ¥${displayPrice} 查看报告`}
            </button>
            <button className="w-full mt-3 mbti-button-ghost" onClick={() => navigate('/')}>
              暂不支付，返回首页
            </button>
            {error && <p className="mt-3 text-xs text-red-500 text-center">{error}</p>}
          </div>
        )}

        {/* 步骤3: 支付中 */}
        {step === 'pay' && payData && (
          <div>
            {qrDataUrl ? (
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-3">扫码支付</p>
                <img src={qrDataUrl} alt="支付二维码" className="mx-auto rounded-xl" />
                <p className="mt-3 text-lg font-bold text-slate-950">¥{displayPrice}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-4">点击下方按钮打开支付</p>
                <button className="mbti-button-primary" onClick={openPayment}>打开支付</button>
              </div>
            )}
            <button className="w-full mt-4 mbti-button-ghost" onClick={() => setStep('polling')}>
              我已支付
            </button>
            <p className="mt-3 text-xs text-slate-400 text-center">订单号: {payData.outTradeNo}</p>
          </div>
        )}

        {/* 步骤4: 轮询确认 */}
        {step === 'polling' && (
          <div className="text-center py-6">
            {pollCount < MAX_POLLS && !error ? (
              <>
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 mx-auto" />
                <p className="mt-4 text-sm text-slate-600">正在确认支付...</p>
                <p className="mt-1 text-xs text-slate-400">确认后自动跳转</p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">支付确认超时</p>
                <p className="mt-1 text-xs text-slate-400">如已支付，请点击手动刷新</p>
              </>
            )}
            {error && <p className="mt-2 text-xs text-amber-600">{error}</p>}
            <div className="mt-4 space-y-2">
              <button className="w-full mbti-button-primary" onClick={manualRefresh}>
                手动刷新
              </button>
              <button className="text-xs text-slate-400 hover:text-slate-600 underline" onClick={cancelAndRetry}>
                取消，重新支付
              </button>
            </div>
          </div>
        )}

        {/* 底部链接 */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400">
          <button onClick={() => navigate('/test')} className="hover:text-slate-600">重新测试</button>
          <button onClick={() => navigate('/')} className="hover:text-slate-600">返回首页</button>
        </div>
      </div>
    </div>
  )
}

function extractOrderTimestamp(outTradeNo?: string): number | null {
  if (!outTradeNo) return null
  const parts = outTradeNo.split('_')
  if (parts[0] !== 'MBTI') return null
  if (parts.length >= 4 && /^1[3-9]\d{9}$/.test(parts[1])) {
    const ts = Number(parts[2])
    return Number.isFinite(ts) ? ts : null
  }
  if (parts.length >= 3) {
    const ts = Number(parts[1])
    return Number.isFinite(ts) ? ts : null
  }
  return null
}
