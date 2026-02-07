import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'

// 默认价格
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
  const [step, setStep] = useState<'intro' | 'pay' | 'checking'>('intro')
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
  }, [navigate])

  const benefits = useMemo(
    () => [
      '类型核心动机与行为模式',
      '优势与盲点（含建议）',
      '更适配的职业/环境偏好',
      '人际关系与沟通提示',
    ],
    [],
  )

  const createOrder = async () => {
    if (!result) return
    setError(null)
    setLoading(true)
    try {
      const resp = await fetch(`/api/zy/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mbtiResult: result, type: 'alipay', method: 'web', action: 'create' }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Create order failed')
      setPayData(data)
      setStep('pay')

      if (data.payType === 'qrcode') {
        const url = await QRCode.toDataURL(data.payInfo, { width: 220 })
        setQrDataUrl(url)
      } else {
        setQrDataUrl(null)
      }
    } catch (err: any) {
      setError(err.message || 'Create order failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!payData) return
    const timer = setInterval(async () => {
      try {
        const resp = await fetch(
          `/api/zy/query-order?outTradeNo=${encodeURIComponent(payData.outTradeNo)}`
        )
        const data = await resp.json()
        if (data.paid) {
          localStorage.setItem('mbti_paid', 'true')
          navigate('/result')
        }
      } catch {
        // ignore
      }
    }, 2000)
    return () => clearInterval(timer)
  }, [payData, navigate])

  const openPayment = () => {
    if (!payData) return
    if (payData.payType === 'jump' || payData.payType === 'urlscheme') {
      window.open(payData.payInfo, '_blank')
      return
    }
    if (payData.payType === 'html') {
      const w = window.open('', '_blank')
      if (w) {
        w.document.write(payData.payInfo)
        w.document.close()
      }
      return
    }
  }

  if (!result) return null
  const displayPrice = payData?.money || DEFAULT_PRICE
  const displayPriceText = `¥${displayPrice}`

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mbti-card p-7 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500">测试已完成</div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              你的类型是 <span className="underline decoration-sky-300/60">{result}</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              你已经拿到了四字母类型。接下来是一份更“可用”的完整报告：把类型拆成可理解、可沟通、可行动的建议。
            </p>
          </div>
          <button className="mbti-pill hover:bg-white" onClick={() => navigate('/test')}>
            重新作答
          </button>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white/60 p-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-500">完整人格解析报告</div>
                <div className="mt-1 text-lg font-black text-slate-950">一次解读，长期可用</div>
              </div>
              <div className="text-2xl font-black text-slate-950">{displayPriceText}</div>
            </div>

            <div className="mt-5 grid gap-2">
              {benefits.map((b) => (
                <div key={b} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-0.5 inline-block h-5 w-5 rounded-lg bg-emerald-500/15 text-emerald-700 grid place-items-center">
                    ✓
                  </span>
                  <span>{b}</span>
                </div>
              ))}
            </div>

            {step === 'intro' && (
              <>
                <button
                  className="mt-6 w-full mbti-button-primary"
                  onClick={createOrder}
                  disabled={loading}
                >
                  {loading ? '正在创建订单…' : `打开支付 ${displayPriceText}`}
                </button>
                {/* 测试用：跳过支付按钮，正式上线时删除 */}
                <button
                  className="mt-3 w-full text-xs text-slate-400 hover:text-slate-600 underline"
                  onClick={() => {
                    localStorage.setItem('mbti_paid', 'true')
                    navigate('/result')
                  }}
                >
                  [测试] 跳过支付，直接查看结果
                </button>
              </>
            )}
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white/60 p-6">
            <div className="text-xs font-semibold text-slate-500">提示</div>
            <div className="mt-2 text-sm leading-relaxed text-slate-600">
              付款时可备注你的类型：<span className="font-semibold text-slate-900">{result}</span>（方便核对）。
            </div>
            <div className="mt-4 text-xs text-slate-500">
              说明：支付完成后系统会自动校验订单状态并放行报告。
            </div>
            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        {step !== 'intro' && (
          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
              <div className="text-sm font-semibold text-slate-900">扫码或跳转支付</div>
              <div className="mt-4 grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="支付二维码"
                    className="h-52 w-52 rounded-xl object-contain"
                  />
                ) : (
                  <div className="text-xs text-slate-500">
                    当前支付方式不是二维码，点击右侧按钮打开支付。
                  </div>
                )}
                <div className="mt-3 text-lg font-black text-slate-950">{displayPriceText}</div>
              </div>
              {payData && (
                <div className="mt-3 text-xs text-slate-500">
                  订单号：{payData.outTradeNo}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
              <div className="text-sm font-semibold text-slate-900">完成后继续</div>

              {step === 'pay' && (
                <>
                  <p className="mt-2 text-sm text-slate-600">
                    若为跳转支付，点击下方按钮打开支付页面。
                  </p>
                  <button className="mt-5 w-full mbti-button-primary" onClick={openPayment}>
                    打开支付
                  </button>
                  <button
                    className="mt-3 w-full mbti-button-ghost"
                    onClick={() => setStep('checking')}
                  >
                    我已支付，开始校验
                  </button>
                </>
              )}

              {step === 'checking' && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-2xl border-2 border-slate-200 border-t-slate-950" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">正在确认…</div>
                      <div className="text-xs text-slate-500">确认后自动跳转结果页</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
