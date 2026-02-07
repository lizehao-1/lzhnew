import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { personalities } from '../data/personalities'
import { useI18n } from '../i18n'

type Record = {
  result: string
  timestamp: number
  viewed?: boolean
  questionSet?: string
}

export default function History() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<Record[] | null>(null)
  const [credits, setCredits] = useState(0)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const savedPhone = localStorage.getItem('mbti_phone')
    const savedPin = localStorage.getItem('mbti_pin')
    if (savedPhone && savedPin) {
      setPhone(savedPhone)
      setPin(savedPin)
      fetchData(savedPhone, savedPin)
    }
  }, [])

  useEffect(() => {
    const handleFocus = () => {
      const savedPhone = localStorage.getItem('mbti_phone')
      const savedPin = localStorage.getItem('mbti_pin')
      if (savedPhone && savedPin) {
        fetchData(savedPhone, savedPin)
      }
    }
    window.addEventListener('focus', handleFocus)
    window.addEventListener('mbti-login-change', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('mbti-login-change', handleFocus)
    }
  }, [])

  const fetchData = async (phone: string, pin: string) => {
    setLoading(true)
    try {
      await maybeSyncPayment(phone)
      const resp = await fetch(`/api/user/query?phone=${encodeURIComponent(phone)}&pin=${encodeURIComponent(pin)}&t=${Date.now()}`)
      const data = await resp.json()
      if (resp.status === 401 || data.needPin) {
        setRecords(null)
        setCredits(0)
        return
      }
      if (!resp.ok) {
        setCredits(0)
        return
      }
      if (data.found) {
        setRecords(data.records?.length > 0 ? [...data.records].reverse() : [])
        const creditsValue = data.credits || 0
        setCredits(creditsValue)
        setNotFound(data.records?.length === 0)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const validatePhone = (value: string) => {
    if (!value) return t('err_phone_required')
    if (!/^1[3-9]\d{9}$/.test(value)) return t('err_phone_invalid')
    return ''
  }

  const validatePin = (value: string) => {
    if (!value) return t('err_pin_required')
    if (!/^\d{4}$/.test(value)) return t('err_pin_invalid')
    return ''
  }

  const handleQuery = async () => {
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
    setLoading(true)
    setNotFound(false)

    try {
      await maybeSyncPayment(phone)
      const resp = await fetch(`/api/user/query?phone=${encodeURIComponent(phone)}&pin=${encodeURIComponent(pin)}&t=${Date.now()}`)
      const data = await resp.json()

      if (resp.status === 401 || data.needPin) {
        setPhoneError(t('err_pin_wrong'))
        setRecords(null)
        setCredits(0)
        setLoading(false)
        return
      }

      if (!resp.ok) {
        setPhoneError(data.error || t('err_query_failed'))
        setRecords(null)
        setCredits(0)
        setLoading(false)
        return
      }

      if (data.found) {
        const list = data.records?.length > 0 ? [...data.records].reverse() : []
        setRecords(list)
        const creditsValue = data.credits || 0
        setCredits(creditsValue)
        localStorage.setItem('mbti_phone', phone)
        localStorage.setItem('mbti_pin', pin)
        window.dispatchEvent(new Event('mbti-login-change'))
        setNotFound(list.length === 0)
      } else {
        setNotFound(true)
        setRecords(null)
        setCredits(0)
      }
    } catch {
      setPhoneError(t('err_query_failed'))
    } finally {
      setLoading(false)
    }
  }

  const viewResult = async (record: Record) => {
    if (record.viewed) {
      localStorage.setItem('mbti_result', record.result)
      localStorage.setItem('mbti_paid', 'true')
      navigate('/result')
      return
    }

    if (credits <= 0) {
      alert(t('history_no_credit'))
      return
    }

    try {
      const resp = await fetch('/api/user/use-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, timestamp: record.timestamp })
      })
      const data = await resp.json()

      if (data.success) {
        setCredits(data.credits)
        setRecords(prev => prev?.map(r =>
          r.timestamp === record.timestamp ? { ...r, viewed: true } : r
        ) || null)

        localStorage.setItem('mbti_result', record.result)
        localStorage.setItem('mbti_paid', 'true')
        navigate('/result')
      } else if (data.needPayment) {
        alert(t('history_no_credit'))
        setCredits(0)
      }
    } catch {
      alert(t('err_action_failed'))
    }
  }

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const getSetName = (setId?: string) => {
    switch (setId) {
      case '28': return t('set_quick')
      case '93': return t('set_full')
      default: return t('set_standard')
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 page-enter">
      <div className="mbti-card p-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 text-center mb-2 font-display">{t('history_title')}</h1>
        <p className="text-xs text-slate-500 text-center mb-6">{t('history_sub')}</p>

        <div className="space-y-3 mb-6">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder={t('history_phone_ph')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-center text-lg tracking-widest"
          />
          <input
            type="tel"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder={t('history_pin_ph')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-center text-lg tracking-widest"
            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
          />
          {phoneError && <p className="text-xs text-red-500 text-center">{phoneError}</p>}
          <button className="w-full mbti-button-primary" onClick={handleQuery} disabled={loading}>
            {loading ? t('loading') : t('history_btn')}
          </button>
        </div>

        {notFound && (
          <div className="text-center py-6 text-slate-500">
            <p className="text-sm">{t('history_notfound_title')}</p>
            <p className="text-xs mt-1">{t('history_notfound_desc')}</p>
          </div>
        )}

        {records && records.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
              <span className="text-sm text-amber-800">{t('history_remaining')}</span>
              <span className="text-xl font-black text-amber-600">{credits}</span>
            </div>

            <p className="text-xs text-slate-500">{t('history_found', { count: records.length })}</p>
            {records.map((record, i) => {
              const p = personalities[record.result]
              const canView = record.viewed || credits > 0
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 transition-colors ${
                    canView
                      ? 'border-slate-200 bg-white/60 hover:border-slate-300 cursor-pointer'
                      : 'border-slate-100 bg-slate-50/50 cursor-not-allowed'
                  }`}
                  onClick={() => canView && viewResult(record)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-black ${canView ? 'text-slate-950' : 'text-slate-400'}`}>
                        {record.result}
                      </span>
                      <div>
                        <div className={`text-sm font-medium ${canView ? 'text-slate-700' : 'text-slate-400'}`}>
                          {p?.name || t('unknown_type')}
                        </div>
                        <div className="text-xs text-slate-400">{getSetName(record.questionSet)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-0.5 rounded-full ${
                        record.viewed
                          ? 'bg-emerald-100 text-emerald-700'
                          : canView
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        {record.viewed ? t('history_viewed') : canView ? t('history_can_view') : t('history_need_pay')}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{formatDate(record.timestamp)}</div>
                    </div>
                  </div>
                </div>
              )
            })}

            {credits === 0 && (
              <div className="text-center mt-4">
                <p className="text-xs text-slate-500 mb-2">
                  {t('history_no_credit')}
                </p>
                <button
                  onClick={() => navigate('/recharge')}
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                >
                  {t('history_go_recharge')}
                </button>
              </div>
            )}
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

function maybeSyncPayment(phone: string) {
  const order = localStorage.getItem('mbti_last_paid_order')
  const at = Number(localStorage.getItem('mbti_last_paid_at') || '0')
  if (!order || !at) return Promise.resolve(false)
  if (Date.now() - at > 30 * 60 * 1000) {
    localStorage.removeItem('mbti_last_paid_order')
    localStorage.removeItem('mbti_last_paid_at')
    return Promise.resolve(false)
  }
  if (!phone) return Promise.resolve(false)
  return fetch(`/api/zy/query-order?outTradeNo=${encodeURIComponent(order)}`)
    .then(r => r.json())
    .then(data => {
      if (data?.paid) return true
      return false
    })
    .catch(() => false)
}

// D1 is strongly consistent now; no optimistic override needed.
