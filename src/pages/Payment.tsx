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

export default function Payment() {
  const navigate = useNavigate()
  const [result, setResult] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [step, setStep] = useState<'phone' | 'intro' | 'pay' | 'checking'>('phone')
  const [payData, setPayData] = useState<PayData | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const savedResult = localStorage.getItem('mbti_result')
    if (!savedResult) {
      navigate('/')
      return
    }
    setResult(savedResult)
    
    // 恢复之前输入的手机号
    const savedPhone = localStorage.getItem('mbti_phone')
    if (savedPhone) {
      setPhone(savedPhone)
    }
  }, [navigate])

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

  const handlePhoneSubmit = async () => {
    const err = validatePhone(phone)
    if (err) {
      setPhoneError(err)
      return
    }
    setPhoneError('')
    localStorage.setItem('mbti_phone', phone)
    
    // 保存测试结果到服务器
    try {
      const answers = localStorage.getItem('mbti_answers')
      const questionSet = localStorage.getItem('mbti_question_set')
      await fetch('/api/user/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, result, answers: answers ? JSON.parse(answers) : {}, questionSet })
      })
    } catch {
      // 忽略保存失败，不影响流程
    }
    
    setStep('intro')
  }

  const createOrder = async () => {
    if (!result) return
    setError(null)
    setLoading(true)
    try {
      const resp = await fetch('/api/zy/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mbtiResult: result, type: 'alipay', method: 'web', action: 'create' }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || '创建订单失败')
      setPayData(data)
      setStep('pay')

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
    const timer = setInterval(async () => {
      try {
        const resp = await fetch(`/api/zy/query-order?outTradeNo=${encodeURIComponent(payData.outTradeNo)}`)
        const data = await resp.json()
        if (data.paid) {
          localStorage.setItem('mbti_paid', 'true')
          // 标记服务器端已支付
          if (phone) {
            fetch('/api/user/mark-paid', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone })
            }).catch(() => {})
          }
          navigate('/result')
        }
      } catch { /* ignore */ }
    }, 2000)
    return () => clearInterval(timer)
  }, [payData, navigate, phone])

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

  const skipPayment = () => {
    localStorage.setItem('mbti_paid', 'true')
    navigate('/result')
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
              <h2 className="text-lg font-bold text-slate-900">输入手机号查看结果</h2>
              <p className="text-xs text-slate-500 mt-1">用于保存记录，下次可直接查询历史结果</p>
            </div>
            <div className="space-y-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="请输入手机号"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-center text-lg tracking-widest"
              />
              {phoneError && <p className="text-xs text-red-500 text-center">{phoneError}</p>}
              <button className="w-full mbti-button-primary" onClick={handlePhoneSubmit}>
                继续
              </button>
            </div>
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
            </div>
            <button className="w-full mbti-button-primary" onClick={createOrder} disabled={loading}>
              {loading ? '创建订单中...' : `支付 ¥${displayPrice} 查看报告`}
            </button>
            {/* 测试用跳过按钮 */}
            <button className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600" onClick={skipPayment}>
              [测试] 跳过支付
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
