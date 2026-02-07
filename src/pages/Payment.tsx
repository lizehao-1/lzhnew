import { useEffect, useMemo, useState } from 'react'
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
 * 支付页面流程：
 * 1. phone: 输入手机号和PIN码
 * 2. checking_credits: 检查是否有积分
 * 3. intro: 展示支付介绍（无积分时）
 * 4. pay: 显示支付二维码/链接
 * 5. checking: 轮询确认支付状态
 */
export default function Payment() {
  const navigate = useNavigate()
  const [result, setResult] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [step, setStep] = useState<'phone' | 'checking_credits' | 'intro' | 'pay' | 'checking'>('phone')
  const [payData, setPayData] = useState<PayData | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [, setPollCount] = useState(0)
  const MAX_POLLS = 150 // 最多轮询150次（5分钟）

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
    
    // 检查是否有未完成的订单
    const savedOrder = localStorage.getItem('mbti_pending_order')
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder)
        // 检查订单是否超过30分钟
        const orderTime = order.outTradeNo?.match(/_(\d+)_/)?.[1]
        if (orderTime && Date.now() - parseInt(orderTime) > 30 * 60 * 1000) {
          localStorage.removeItem('mbti_pending_order')
        } else if (savedPhone && savedPin) {
          // 有未完成订单，先检查积分状态
          checkAfterPaymentReturn(savedPhone, savedPin, order)
          return
        }
      } catch { 
        localStorage.removeItem('mbti_pending_order')
      }
    }
    
    // 有登录信息，自动检查积分
    if (savedPhone && savedPin && /^1[3-9]\d{9}$/.test(savedPhone) && /^\d{4}$/.test(savedPin)) {
      setTimeout(() => {
        checkCreditsAndSave(savedResult, savedPhone, savedPin)
      }, 100)
    }
  }, [])

  // 支付返回后检查积分状态
  const checkAfterPaymentReturn = async (phone: string, pin: string, order: PayData) => {
    setStep('checking_credits')
    setPhone(phone)
    setPin(pin)
    
    try {
      const queryResp = await fetch(`/api/user/query?phone=${encodeURIComponent(phone)}&pin=${encodeURIComponent(pin)}`)
      const queryData = await queryResp.json()
      
      if (queryData.found) {
        const records = queryData.records || []
        // 找到最新的已查看记录
        const viewedRecord = [...records].reverse().find(r => r.viewed)
        
        if (viewedRecord) {
          // 有已查看的记录，说明支付成功且回调已执行
          localStorage.removeItem('mbti_pending_order')
          localStorage.setItem('mbti_paid', 'true')
          localStorage.setItem('mbti_result', viewedRecord.result)
          window.dispatchEvent(new Event('mbti-login-change'))
          navigate('/result')
          return
        }
        
        // 没有已查看记录，检查是否有积分
        if (queryData.credits > 0) {
          // 有积分，找最新未查看记录使用积分
          const latestUnviewed = [...records].reverse().find(r => !r.viewed)
          if (latestUnviewed) {
            const useResp = await fetch('/api/user/use-credit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone, timestamp: latestUnviewed.timestamp })
            })
            const useData = await useResp.json()
            if (useData.success) {
              localStorage.removeItem('mbti_pending_order')
              localStorage.setItem('mbti_paid', 'true')
              localStorage.setItem('mbti_result', latestUnviewed.result)
              window.dispatchEvent(new Event('mbti-login-change'))
              navigate('/result')
              return
            }
          }
        }
      }
      
      // 没有积分或没有记录，继续轮询订单
      setPayData(order)
      setStep('checking')
    } catch {
      setPayData(order)
      setStep('checking')
    }
  }

  // 检查积分并保存记录
  const checkCreditsAndSave = async (result: string, phone: string, pin: string) => {
    setStep('checking_credits')
    try {
      const questionSet = localStorage.getItem('mbti_question_set')
      const saveResp = await fetch('/api/user/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin, result, questionSet })
      })
      const saveData = await saveResp.json()
      
      if (saveData.error === 'PIN码错误') {
        setStep('phone')
        setPhoneError('密码错误，请重新输入')
        return
      }
      
      if (saveData.success) {
        if (saveData.credits > 0) {
          // 有积分，使用积分查看
          const useResp = await fetch('/api/user/use-credit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, timestamp: saveData.timestamp })
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
      } else {
        setStep('intro')
      }
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

  const validatePhone = (value: string) => {
    if (!value) return '请输入手机号'
    if (!/^1[3-9]\d{9}$/.test(value)) return '请输入正确的手机号'
    return ''
  }

  const validatePin = (value: string) => {
    if (!value) return '请输入4位PIN码'
    if (!/^\d{4}$/.test(value)) return 'PIN码必须是4位数字'
    return ''
  }

  const handlePhoneSubmit = async () => {
    const phoneErr = validatePhone(phone)
    if (phoneErr) {
      setPhoneError(phoneErr)
      return
    }
    const pinErr = validatePin(pin)
    if (pinErr) {
      setPhoneError(pinErr)
      return
    }
    setPhoneError('')
    localStorage.setItem('mbti_phone', phone)
    localStorage.setItem('mbti_pin', pin)
    window.dispatchEvent(new Event('mbti-login-change'))
    
    if (result) {
      await checkCreditsAndSave(result, phone, pin)
    }
  }

  const createOrder = async () => {
    if (!result) return
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
      
      // 保存订单信息
      localStorage.setItem('mbti_pending_order', JSON.stringify(data))

      if (data.payType === 'qrcode') {
        const url = await QRCode.toDataURL(data.payInfo, { width: 200 })
        setQrDataUrl(url)
      } else {
        setQrDataUrl(null)
      }
    } catch (err: any) {
      setError(err.message || '创建订单失败')
    } finally {
      setLoading(false)
    }
  }

  // 轮询支付状态
  useEffect(() => {
    if (!payData || step !== 'checking') return
    
    let cancelled = false
    
    const checkPayment = async () => {
      if (cancelled) return
      
      setPollCount(prev => {
        if (prev >= MAX_POLLS) {
          setError('支付超时，请点击"取消等待"后重试')
          return prev
        }
        return prev + 1
      })
      
      try {
        const resp = await fetch(`/api/zy/query-order?outTradeNo=${encodeURIComponent(payData.outTradeNo)}`)
        const data = await resp.json()
        
        if (data.paid && !cancelled) {
          // 支付成功，等待回调执行
          await new Promise(r => setTimeout(r, 1500))
          
          // 再次检查积分状态确认回调已执行
          const savedPhone = phone || localStorage.getItem('mbti_phone') || ''
          const savedPin = pin || localStorage.getItem('mbti_pin') || ''
          
          if (savedPhone && savedPin) {
            const queryResp = await fetch(`/api/user/query?phone=${encodeURIComponent(savedPhone)}&pin=${encodeURIComponent(savedPin)}`)
            const queryData = await queryResp.json()
            
            if (queryData.found) {
              const records = queryData.records || []
              const viewedRecord = [...records].reverse().find(r => r.viewed)
              
              if (viewedRecord) {
                localStorage.removeItem('mbti_pending_order')
                localStorage.setItem('mbti_paid', 'true')
                localStorage.setItem('mbti_result', viewedRecord.result)
                window.dispatchEvent(new Event('mbti-login-change'))
                navigate('/result')
                return
              }
            }
          }
          
          // 回调可能还没执行完，直接跳转（回调会在后台完成）
          localStorage.removeItem('mbti_pending_order')
          localStorage.setItem('mbti_paid', 'true')
          window.dispatchEvent(new Event('mbti-login-change'))
          navigate('/result')
        }
      } catch { /* ignore */ }
    }
    
    const timer = setInterval(checkPayment, 2000)
    checkPayment() // 立即执行一次
    
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [payData, step, navigate, phone, pin])

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

        {/* 步骤1: 输入手机号和PIN码 */}
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
              <div>
                <input
                  type="tel"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="设置4位数字密码"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-center text-lg tracking-widest"
                />
                <p className="text-xs text-slate-400 mt-2 text-center leading-relaxed">
                  🔒 密码用于保护你的测试记录，防止他人查看<br/>
                  我们只保存测试结果，不收集任何个人信息
                </p>
              </div>
              {phoneError && <p className="text-xs text-red-500 text-center">{phoneError}</p>}
              <button className="w-full mbti-button-primary" onClick={handlePhoneSubmit}>
                继续
              </button>
            </div>
          </div>
        )}

        {/* 检查积分中 */}
        {step === 'checking_credits' && (
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
                  � 支付一次可查看 <span className="font-bold text-slate-700">3次</span> 完整报告（含2次免费重测）
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
            <button className="w-full mt-4 mbti-button-ghost" onClick={() => setStep('checking')}>
              我已支付
            </button>
            <p className="mt-3 text-xs text-slate-400 text-center">订单号: {payData.outTradeNo}</p>
          </div>
        )}

        {/* 步骤4: 确认中 */}
        {step === 'checking' && (
          <div className="text-center py-6">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 mx-auto" />
            <p className="mt-4 text-sm text-slate-600">正在确认支付...</p>
            <p className="mt-1 text-xs text-slate-400">确认后自动跳转</p>
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
            <button 
              className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline"
              onClick={cancelAndRetry}
            >
              取消等待，重新支付
            </button>
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
