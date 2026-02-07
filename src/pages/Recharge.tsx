import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'

const PACKAGES = [
  { id: 1, credits: 3, price: '1', desc: '单次购买', popular: false },
  { id: 2, credits: 10, price: '3', desc: '多次使用', popular: true },
  { id: 3, credits: 30, price: '8', desc: '长期使用', popular: false },
]

type PayData = {
  outTradeNo: string
  tradeNo: string
  payType: string
  payInfo: string
  money?: string
}

export default function Recharge() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [currentCredits, setCurrentCredits] = useState<number | null>(null)
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[1])
  const [step, setStep] = useState<'select' | 'pay' | 'checking'>('select')
  const [payData, setPayData] = useState<PayData | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [, setPollCount] = useState(0)
  const MAX_POLLS = 150 // 最多轮询150次（5分钟）

  // 从 localStorage 获取登录信息
  useEffect(() => {
    const savedPhone = localStorage.getItem('mbti_phone')
    const savedPin = localStorage.getItem('mbti_pin')
    if (savedPhone && savedPin) {
      setPhone(savedPhone)
      setPin(savedPin)
      // 获取当前积分
      fetchCredits(savedPhone, savedPin)
    }
  }, [])

  useEffect(() => {
    const refresh = () => {
      const savedPhone = localStorage.getItem('mbti_phone')
      const savedPin = localStorage.getItem('mbti_pin')
      if (savedPhone && savedPin) {
        setPhone(savedPhone)
        setPin(savedPin)
        fetchCredits(savedPhone, savedPin)
      }
    }
    window.addEventListener('focus', refresh)
    window.addEventListener('mbti-login-change', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('mbti-login-change', refresh)
    }
  }, [])

  const fetchCredits = async (phone: string, pin: string) => {
    try {
      const resp = await fetch(`/api/user/query?phone=${encodeURIComponent(phone)}&pin=${encodeURIComponent(pin)}&t=${Date.now()}`)
      const data = await resp.json()
      if (!resp.ok || resp.status === 401 || data.needPin) {
        setCurrentCredits(0)
        return
      }
      if (data.found) {
        setCurrentCredits(data.credits || 0)
      }
    } catch {
      // 静默失败
    }
  }

  const createOrder = async () => {
    if (!phone) {
      setError('请先登录')
      return
    }
    setError(null)
    setLoading(true)
    
    try {
      const resp = await fetch('/api/zy/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mbtiResult: `RECHARGE_${selectedPkg.credits}`,
          phone,
          type: 'alipay', 
          method: 'web'
        }),
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

  // 轮询支付状态
  useEffect(() => {
    if (!payData) return
    const timer = setInterval(async () => {
      // 超时检查
      setPollCount(prev => {
        if (prev >= MAX_POLLS) {
          setError('支付超时，请刷新页面重试或联系客服')
          setStep('select')
          return prev
        }
        return prev + 1
      })
      
      try {
        const resp = await fetch(`/api/zy/query-order?outTradeNo=${encodeURIComponent(payData.outTradeNo)}`)
        const data = await resp.json()
        if (data.paid) {
          // 支付成功，等待1秒让回调执行完再刷新积分
          await new Promise(r => setTimeout(r, 1000))
          if (phone && pin) {
            await fetchCredits(phone, pin)
          }
          // 触发全局积分刷新事件
          window.dispatchEvent(new Event('mbti-login-change'))
          // 使用 toast 风格提示，不阻塞
          setStep('select')
          setPayData(null)
          setPollCount(0)
          navigate('/', { state: { message: `充值成功！获得 ${selectedPkg.credits} 次查看机会` } })
        }
      } catch { /* ignore */ }
    }, 2000)
    return () => clearInterval(timer)
  }, [payData, navigate, phone, pin, selectedPkg.credits])

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

  // 测试用：模拟充值
  const fakeRecharge = async () => {
    if (!phone) {
      alert('请先登录')
      return
    }
    try {
      const resp = await fetch('/api/admin/add-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, credits: selectedPkg.credits, adminKey: 'mbti-admin-2026' })
      })
      const data = await resp.json()
      if (data.success) {
        setCurrentCredits(data.totalCredits)
        alert(`充值成功！获得 ${selectedPkg.credits} 次查看机会`)
      }
    } catch {
      alert('操作失败')
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mbti-card p-6">
        <h1 className="text-xl font-black text-slate-950 text-center mb-2">积分充值</h1>
        <p className="text-xs text-slate-500 text-center mb-6">购买查看次数，解锁完整人格报告</p>

        {/* 当前积分 */}
        {phone && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 mb-6">
            <div>
              <span className="text-sm text-amber-800">当前剩余</span>
              <span className="text-xs text-slate-500 ml-2">
                {phone.slice(0, 3)}****{phone.slice(-4)}
              </span>
            </div>
            <span className="text-xl font-black text-amber-600">{currentCredits ?? '-'}</span>
          </div>
        )}

        {!phone && (
          <div className="text-center py-4 mb-6 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-600">请先登录后再充值</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-2 text-xs text-sky-600 hover:text-sky-700"
            >
              返回首页登录 →
            </button>
          </div>
        )}

        {/* 选择套餐 */}
        {step === 'select' && phone && (
          <div>
            <div className="space-y-3 mb-6">
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPkg.id === pkg.id
                      ? 'border-slate-800 bg-slate-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-slate-950">{pkg.credits}</span>
                      <div>
                        <div className="text-sm font-medium text-slate-700">次查看机会</div>
                        <div className="text-xs text-slate-400">{pkg.desc}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-950">¥{pkg.price}</div>
                      {pkg.popular && (
                        <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">推荐</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button 
              className="w-full mbti-button-primary" 
              onClick={createOrder}
              disabled={loading}
            >
              {loading ? '创建订单中...' : `支付 ¥${selectedPkg.price}`}
            </button>
            
            {/* 测试用 - 仅开发环境显示 */}
            {import.meta.env.DEV && (
              <button 
                className="w-full mt-2 text-xs text-orange-500 hover:text-orange-600 py-2" 
                onClick={fakeRecharge}
              >
                🔧 [测试] 模拟充值
              </button>
            )}
            
            {error && <p className="mt-3 text-xs text-red-500 text-center">{error}</p>}
          </div>
        )}

        {/* 支付中 */}
        {step === 'pay' && payData && (
          <div>
            {qrDataUrl ? (
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-3">扫码支付</p>
                <img src={qrDataUrl} alt="支付二维码" className="mx-auto rounded-xl" />
                <p className="mt-3 text-lg font-bold text-slate-950">¥{selectedPkg.price}</p>
                <p className="text-xs text-slate-500 mt-1">充值 {selectedPkg.credits} 次查看机会</p>
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

        {/* 确认中 */}
        {step === 'checking' && (
          <div className="text-center py-6">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 mx-auto" />
            <p className="mt-4 text-sm text-slate-600">正在确认支付...</p>
            <p className="mt-1 text-xs text-slate-400">确认后自动跳转</p>
            <button 
              className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline"
              onClick={() => {
                setStep('pay')
                setPollCount(0)
              }}
            >
              取消等待，重新支付
            </button>
          </div>
        )}

        {/* 底部链接 */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button onClick={() => navigate('/')} className="text-xs text-slate-400 hover:text-slate-600">
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}
