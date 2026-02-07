import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { useI18n } from '../i18n'

type PayData = {
  outTradeNo: string
  tradeNo: string
  payType: string
  payInfo: string
  money?: string
}

export default function Recharge() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [currentCredits, setCurrentCredits] = useState<number | null>(null)
  const [selectedPkg, setSelectedPkg] = useState({ id: 2, credits: 10, price: '3', desc: t('pkg_multi'), popular: true })
  const [step, setStep] = useState<'select' | 'pay' | 'checking'>('select')
  const [payData, setPayData] = useState<PayData | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [, setPollCount] = useState(0)
  const MAX_POLLS = 150

  const packages = [
    { id: 1, credits: 3, price: '1', desc: t('pkg_single'), popular: false },
    { id: 2, credits: 10, price: '3', desc: t('pkg_multi'), popular: true },
    { id: 3, credits: 30, price: '8', desc: t('pkg_long'), popular: false },
  ]

  useEffect(() => {
    const savedPhone = localStorage.getItem('mbti_phone')
    const savedPin = localStorage.getItem('mbti_pin')
    if (savedPhone && savedPin) {
      setPhone(savedPhone)
      setPin(savedPin)
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
      await maybeSyncPayment()
      const resp = await fetch(`/api/user/query?phone=${encodeURIComponent(phone)}&pin=${encodeURIComponent(pin)}&t=${Date.now()}`)
      const data = await resp.json()
      if (!resp.ok || resp.status === 401 || data.needPin) {
        setCurrentCredits(0)
        return
      }
      if (data.found) {
        const creditsValue = data.credits || 0
        setCurrentCredits(creditsValue)
      }
    } catch {
      // ignore
    }
  }

  const createOrder = async () => {
    if (!phone) {
      setError(t('err_login_first'))
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
      if (!resp.ok) throw new Error(data.error || t('err_order_failed'))
      setPayData(data)
      setStep('pay')

      if (data.payType === 'qrcode') {
        const url = await QRCode.toDataURL(data.payInfo, { width: 200 })
        setQrDataUrl(url)
      } else {
        setQrDataUrl(null)
      }
    } catch (err: any) {
      setError(err.message || t('err_order_failed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!payData) return
    const timer = setInterval(async () => {
      setPollCount(prev => {
        if (prev >= MAX_POLLS) {
          setError(t('recharge_timeout'))
          setStep('select')
          return prev
        }
        return prev + 1
      })

      try {
        const resp = await fetch(`/api/zy/query-order?outTradeNo=${encodeURIComponent(payData.outTradeNo)}`)
        const data = await resp.json()
        if (data.paid) {
          await new Promise(r => setTimeout(r, 1000))
          if (phone && pin) {
            await fetchCredits(phone, pin)
          }
          window.dispatchEvent(new Event('mbti-login-change'))
          setStep('select')
          setPayData(null)
          setPollCount(0)
          navigate('/', { state: { message: t('recharge_success', { credits: selectedPkg.credits }) } })
        }
      } catch { /* ignore */ }
    }, 2000)
    return () => clearInterval(timer)
  }, [payData, navigate, phone, pin, selectedPkg.credits, t])

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

  return (
    <div className="mx-auto max-w-xl px-4 py-10 page-enter">
      <div className="mbti-card p-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 text-center mb-2 font-display">{t('recharge_title')}</h1>
        <p className="text-xs text-slate-500 text-center mb-6">{t('recharge_sub')}</p>

        {phone && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 mb-6">
            <div>
              <span className="text-sm text-amber-800">{t('recharge_current')}</span>
              <span className="text-xs text-slate-500 ml-2">
                {phone.slice(0, 3)}****{phone.slice(-4)}
              </span>
            </div>
            <span className="text-xl font-black text-amber-600">{currentCredits ?? '-'}</span>
          </div>
        )}

        {!phone && (
          <div className="text-center py-4 mb-6 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-sm text-slate-600">{t('recharge_login_tip')}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 text-xs text-sky-600 hover:text-sky-700"
            >
              {t('recharge_back_login')}
            </button>
          </div>
        )}

        {step === 'select' && phone && (
          <div>
            <div className="space-y-3 mb-6">
              {packages.map((pkg) => (
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
                        <div className="text-sm font-medium text-slate-700">{t('views_label')}</div>
                        <div className="text-xs text-slate-400">{pkg.desc}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-950">￥{pkg.price}</div>
                      {pkg.popular && (
                        <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">{t('recommended')}</span>
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
              {loading ? t('creating_order') : `${t('recharge_pay')} ￥${selectedPkg.price}`}
            </button>

            {error && <p className="mt-3 text-xs text-red-500 text-center">{error}</p>}
          </div>
        )}

        {step === 'pay' && payData && (
          <div>
            {qrDataUrl ? (
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-3">{t('scan_pay')}</p>
                <img src={qrDataUrl} alt="QR" className="mx-auto rounded-xl" />
                <p className="mt-3 text-lg font-bold text-slate-950">￥{selectedPkg.price}</p>
                <p className="text-xs text-slate-500 mt-1">{t('recharge_view_times', { credits: selectedPkg.credits })}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-4">{t('click_to_pay')}</p>
                <button className="mbti-button-primary" onClick={openPayment}>{t('recharge_open')}</button>
              </div>
            )}
            <button className="w-full mt-4 mbti-button-ghost" onClick={() => setStep('checking')}>
              {t('recharge_paid')}
            </button>
            <p className="mt-3 text-xs text-slate-400 text-center">{t('order_no')} {payData.outTradeNo}</p>
          </div>
        )}

        {step === 'checking' && (
          <div className="text-center py-6">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 mx-auto" />
            <p className="mt-4 text-sm text-slate-600">{t('recharge_wait')}</p>
            <p className="mt-1 text-xs text-slate-400">{t('recharge_auto')}</p>
            <button
              className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline"
              onClick={() => {
                setStep('pay')
                setPollCount(0)
              }}
            >
              {t('recharge_cancel_wait')}
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button onClick={() => navigate('/')} className="text-xs text-slate-400 hover:text-slate-600">
            {t('back_home')}
          </button>
        </div>
      </div>
    </div>
  )
}

function maybeSyncPayment() {
  const order = localStorage.getItem('mbti_last_paid_order')
  const at = Number(localStorage.getItem('mbti_last_paid_at') || '0')
  if (!order || !at) return Promise.resolve(false)
  if (Date.now() - at > 30 * 60 * 1000) {
    localStorage.removeItem('mbti_last_paid_order')
    localStorage.removeItem('mbti_last_paid_at')
    return Promise.resolve(false)
  }
  return fetch(`/api/zy/query-order?outTradeNo=${encodeURIComponent(order)}`)
    .then(r => r.json())
    .then(data => {
      if (data?.paid) return true
      return false
    })
    .catch(() => false)
}

// D1 is strongly consistent now; no optimistic override needed.
