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
  recordTimestamp?: number
  phone?: string
}

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
  const [recordTimestamp, setRecordTimestamp] = useState<number | null>(null)
  const [, setPollCount] = useState(0)
  const MAX_POLLS = 150 // 最多轮询150次（5分钟）

  useEffect(() => {
    const savedResult = localStorage.getItem('mbti_result')
    if (!savedResult) {
      navigate('/')
      return
    }
    setResult(savedResult)
    
    // 恢复之前输入的手机号和PIN
    const savedPhone = localStorage.getItem('mbti_phone')
    const savedPin = localStorage.getItem('mbti_pin')
    if (savedPhone) setPhone(savedPhone)
    if (savedPin) setPin(savedPin)
    
    // 检查是否有未完成的订单（用户付款后返回）
    const savedOrder = localStorage.getItem('mbti_pending_order')
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder)
        // 检查订单是否超过30分钟，超过则清理
        const orderTime = order.outTradeNo?.match(/_(\d+)_/)?.[1]
        if (orderTime && Date.now() - parseInt(orderTime) > 30 * 60 * 1000) {
          localStorage.removeItem('mbti_pending_order')
        } else {
          // 先检查用户是否已有积分（回调可能已执行）
          const checkPhone = order.phone || savedPhone
          const checkPin = savedPin
          if (checkPhone && checkPin) {
            checkCreditsAndProceed(savedResult, checkPhone, checkPin, order)
            return
          }
          setPayData(order)
          setRecordTimestamp(order.recordTimestamp)
          setStep('checking') // 直接进入检查状态
          return // 不执行自动登录，直接检查订单
        }
      } catch { 
        localStorage.removeItem('mbti_pending_order')
      }
    }
    
    // 如果已有完整登录信息，自动提交（延迟执行确保状态已更新）
    if (savedPhone && savedPin && /^1[3-9]\d{9}$/.test(savedPhone) && /^\d{4}$/.test(savedPin)) {
      // 使用 setTimeout 确保组件完全挂载后再执行
      const timer = setTimeout(() => {
        autoSubmit(savedResult, savedPhone, savedPin)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, []) // 只在组件挂载时执行一次

  // 自动提交登录
  const autoSubmit = async (result: string, phone: string, pin: string) => {
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
        // PIN码错误，让用户重新输入
        setStep('phone')
        setPhoneError('密码错误，请重新输入')
        return
      }
      
      if (saveData.success) {
        setRecordTimestamp(saveData.timestamp)
        if (saveData.credits > 0) {
          await useCredit(saveData.timestamp, phone)
        } else {
          setStep('intro')
        }
      } else {
        setStep('intro')
      }
    } catch {
      setStep('intro')
    }
  }

  // 检查积分并处理（支付返回后调用）
  const checkCreditsAndProceed = async (result: string, phone: string, pin: string, order: PayData) => {
    setStep('checking_credits')
    setPhone(phone)
    setPin(pin)
    try {
      // 先查询用户积分
      const queryResp = await fetch(`/api/user/query?phone=${encodeURIComponent(phone)}&pin=${encodeURIComponent(pin)}`)
      const queryData = await queryResp.json()
      
      if (queryData.found && queryData.credits > 0) {
        // 有积分，检查最新记录是否已查看
        const records = queryData.records || []
        const latestRecord = records[records.length - 1]
        
        if (latestRecord?.viewed) {
          // 已查看，直接跳转结果页
          localStorage.removeItem('mbti_pending_order')
          localStorage.setItem('mbti_paid', 'true')
          localStorage.setItem('mbti_result', latestRecord.result || result)
          window.dispatchEvent(new Event('mbti-login-change'))
          navigate('/result')
          return
        }
        
        // 有积分但未查看，使用积分
        const timestamp = latestRecord?.timestamp || order.recordTimestamp
        if (timestamp) {
          await useCredit(timestamp, phone)
          localStorage.removeItem('mbti_pending_order')
          return
        }
      }
      
      // 没有积分，继续轮询订单状态
      setPayData(order)
      setRecordTimestamp(order.recordTimestamp || null)
      setStep('checking')
    } catch {
      // 出错则继续轮询
      setPayData(order)
      setRecordTimestamp(order.recordTimestamp || null)
      setStep('checking')
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
    // 触发登录状态变化事件，让 UserMenu 更新
    window.dispatchEvent(new Event('mbti-login-change'))
    setStep('checking_credits')
    
    try {
      // 保存测试结果到服务器（只存结果，不存答案）
      const questionSet = localStorage.getItem('mbti_question_set')
      const saveResp = await fetch('/api/user/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin, result, questionSet })
      })
      const saveData = await saveResp.json()
      
      if (saveData.error === 'PIN码错误') {
        setPhoneError('PIN码错误，请重新输入')
        setStep('phone')
        return
      }
      
      if (saveData.success) {
        setRecordTimestamp(saveData.timestamp)
        
        // 如果有积分，直接使用积分查看
        if (saveData.credits > 0) {
          await useCredit(saveData.timestamp)
        } else {
          setStep('intro')
        }
      } else {
        setStep('intro')
      }
    } catch {
      setStep('intro')
    }
  }

  const useCredit = async (timestamp: number, phoneOverride?: string) => {
    const usePhone = phoneOverride || phone
    try {
      const resp = await fetch('/api/user/use-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: usePhone, timestamp })
      })
      const data = await resp.json()
      
      if (data.success) {
        localStorage.setItem('mbti_paid', 'true')
        // 触发登录状态刷新
        window.dispatchEvent(new Event('mbti-login-change'))
        navigate('/result')
      } else if (data.needPayment) {
        setStep('intro')
      } else {
        setStep('intro')
      }
    } catch {
      setStep('intro')
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
        body: JSON.stringify({ mbtiResult: result, phone, type: 'alipay', method: 'web', action: 'create' }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || '创建订单失败')
      setPayData(data)
      setStep('pay')
      
      // 保存订单到 localStorage，用户付款返回后可以继续检查
      localStorage.setItem('mbti_pending_order', JSON.stringify({
        ...data,
        recordTimestamp,
        phone
      }))

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

  useEffect(() => {
    if (!payData) return
    let paymentConfirmed = false
    
    const timer = setInterval(async () => {
      // 超时检查
      setPollCount(prev => {
        if (prev >= MAX_POLLS) {
          setError('支付超时，请刷新页面重试或联系客服')
          setStep('intro')
          return prev
        }
        return prev + 1
      })
      
      try {
        const resp = await fetch(`/api/zy/query-order?outTradeNo=${encodeURIComponent(payData.outTradeNo)}`)
        const data = await resp.json()
        
        if (data.paid && !paymentConfirmed) {
          paymentConfirmed = true
          // 支付成功，回调会自动增加积分并扣1积分标记记录为已查看
          // 等待1秒让回调执行完
          await new Promise(r => setTimeout(r, 1000))
          
          localStorage.removeItem('mbti_pending_order')
          localStorage.setItem('mbti_paid', 'true')
          window.dispatchEvent(new Event('mbti-login-change'))
          navigate('/result')
        }
      } catch { /* ignore */ }
    }, 2000)
    return () => clearInterval(timer)
  }, [payData, navigate])

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

  // 模拟支付成功（测试用）- 会增加积分
  const fakePayment = async () => {
    if (!phone || !recordTimestamp) {
      alert('请先输入手机号')
      return
    }
    try {
      // 调用mark-paid增加积分
      const markResp = await fetch('/api/user/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      const markData = await markResp.json()
      if (markData.success) {
        // 使用积分查看当前记录
        await fetch('/api/user/use-credit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, timestamp: recordTimestamp })
        })
        localStorage.setItem('mbti_paid', 'true')
        localStorage.removeItem('mbti_pending_order')
        // 触发登录状态刷新
        window.dispatchEvent(new Event('mbti-login-change'))
        navigate('/result')
      }
    } catch {
      alert('操作失败')
    }
  }

  // 普通用户退出（不支付）
  const exitWithoutPay = () => {
    localStorage.removeItem('mbti_pending_order')
    navigate('/')
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
                  💡 支付一次可查看 <span className="font-bold text-slate-700">3次</span> 完整报告（含2次免费重测）
                </p>
              </div>
            </div>
            <button className="w-full mbti-button-primary" onClick={createOrder} disabled={loading}>
              {loading ? '创建订单中...' : `支付 ¥${displayPrice} 查看报告`}
            </button>
            {/* 普通用户退出按钮 */}
            <button className="w-full mt-3 mbti-button-ghost" onClick={exitWithoutPay}>
              暂不支付，返回首页
            </button>
            {/* 测试用模拟支付按钮 - 仅开发环境显示 */}
            {import.meta.env.DEV && (
              <button className="w-full mt-2 text-xs text-orange-500 hover:text-orange-600 py-2" onClick={fakePayment}>
                🔧 [测试] 模拟支付成功
              </button>
            )}
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
            <button 
              className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline"
              onClick={() => {
                localStorage.removeItem('mbti_pending_order')
                setPayData(null)
                setPollCount(0)
                setStep('intro')
              }}
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
