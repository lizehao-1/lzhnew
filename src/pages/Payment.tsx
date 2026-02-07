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
 * 鏀粯椤甸潰 - 鎸夎涓氭渶浣冲疄璺佃璁?
 * 
 * 娴佺▼锛?
 * 1. 杈撳叆鎵嬫満鍙?鈫?淇濆瓨璁板綍 鈫?妫€鏌ョН鍒?
 * 2. 鏈夌Н鍒?鈫?浣跨敤绉垎 鈫?璺宠浆缁撴灉
 * 3. 鏃犵Н鍒?鈫?鍒涘缓璁㈠崟 鈫?鏀粯 鈫?杞纭
 * 
 * 鍏抽敭鐐癸細
 * - 鍚庣 query-order 浼氳嚜鍔ㄨˉ鍋跨Н鍒嗭紙濡傛灉鍥炶皟澶辫触锛?
 * - 鍓嶇鍙渶杞璁㈠崟鐘舵€侊紝涓嶉渶瑕佸鏉傜殑绉垎妫€鏌ラ€昏緫
 */
export default function Payment() {
  const navigate = useNavigate()
  const [result, setResult] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [step, setStep] = useState<'phone' | 'checking' | 'intro' | 'pay' | 'polling'>(() => {
    const savedPhone = localStorage.getItem('mbti_phone')
    const savedPin = localStorage.getItem('mbti_pin')
    if (savedPhone && savedPin && /^1[3-9]\d{9}$/.test(savedPhone) && /^\d{4}$/.test(savedPin)) {
      return 'checking'
    }
    return 'phone'
  })
  const [payData, setPayData] = useState<PayData | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const MAX_POLLS = 30 // 鏈€澶氳疆璇?0娆★紙60绉掞級

  // 鍒濆鍖?
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
    
    // 妫€鏌ユ湭瀹屾垚璁㈠崟
    const savedOrder = localStorage.getItem('mbti_pending_order')
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder)
        const orderTime = extractOrderTimestamp(order.outTradeNo)
        // 30鍒嗛挓鍐呯殑璁㈠崟鎵嶆仮澶?
        if (orderTime && Date.now() - orderTime < 30 * 60 * 1000) {
          setPayData(order)
          setStep('polling')
          return
        }
        localStorage.removeItem('mbti_pending_order')
      } catch { 
        localStorage.removeItem('mbti_pending_order')
      }
    }
    
    // 鏈夌櫥褰曚俊鎭紝鑷姩妫€鏌?
    if (savedPhone && savedPin && /^1[3-9]\d{9}$/.test(savedPhone) && /^\d{4}$/.test(savedPin)) {
      handleAutoLogin(savedResult, savedPhone, savedPin)
    }
  }, [])

  // 鑷姩鐧诲綍妫€鏌?
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
        setPhoneError('瀵嗙爜閿欒锛岃閲嶆柊杈撳叆')
        return
      }
      
      if (data.success && data.credits > 0) {
        // 鏈夌Н鍒嗭紝浣跨敤绉垎
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
    '鍥涚淮搴﹀亸濂藉垎鏋愬浘琛?,
    '鏍稿績浼樺娍涓庢垚闀跨┖闂?,
    '鑱屼笟鏂瑰悜寤鸿',
    '浜洪檯鍏崇郴涓庢矡閫氭妧宸?,
    '鏈懆鍙墽琛岀殑琛屽姩寤鸿',
  ], [])

  const handlePhoneSubmit = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setPhoneError('璇疯緭鍏ユ纭殑鎵嬫満鍙?)
      return
    }
    if (!pin || !/^\d{4}$/.test(pin)) {
      setPhoneError('PIN鐮佸繀椤绘槸4浣嶆暟瀛?)
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
      setError('璇峰厛杈撳叆鏈夋晥鎵嬫満鍙?)
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
      if (!resp.ok) throw new Error(data.error || '鍒涘缓璁㈠崟澶辫触')
      
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
      setError(err.message || '鍒涘缓璁㈠崟澶辫触')
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

  // 鏌ヨ璁㈠崟鐘舵€侊紙鍚庣浼氳嚜鍔ㄨˉ鍋跨Н鍒嗭級
  const checkOrderStatus = useCallback(async () => {
    if (!payData) return false
    
    try {
      const resp = await fetch(`/api/zy/query-order?outTradeNo=${encodeURIComponent(payData.outTradeNo)}`)
      const data = await resp.json()
      
      if (data.paid) {
        // 璁㈠崟宸叉敮浠橈紝鍚庣宸茶嚜鍔ㄨˉ鍋跨Н鍒?
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

  // 杞鏀粯鐘舵€?
  useEffect(() => {
    if (step !== 'polling' || !payData) return
    
    let cancelled = false
    
    const poll = async () => {
      if (cancelled) return
      
      const paid = await checkOrderStatus()
      if (paid || cancelled) return
      
      setPollCount(prev => {
        if (prev >= MAX_POLLS) {
          setError('鏀粯纭瓒呮椂锛岃鐐瑰嚮"鎵嬪姩鍒锋柊"閲嶈瘯')
          return prev
        }
        return prev + 1
      })
    }
    
    poll() // 绔嬪嵆鎵ц涓€娆?
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

  // 鎵嬪姩鍒锋柊
  const manualRefresh = async () => {
    setError(null)
    setPollCount(0)
    const paid = await checkOrderStatus()
    if (!paid) {
      setError('鏆傛湭鏌ヨ鍒版敮浠樼粨鏋滐紝璇风◢鍚庡啀璇?)
    }
  }

  // 鍙栨秷骞堕噸鏂版敮浠?
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
        {/* 缁撴灉棰勮 */}
        <div className="text-center mb-6">
          <div className="text-xs text-slate-500 mb-1">浣犵殑绫诲瀷</div>
          <div className="text-4xl font-black text-slate-950">{result}</div>
        </div>

        {/* 姝ラ1: 杈撳叆鎵嬫満鍙?*/}
        {step === 'phone' && (
          <div>
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">淇濆瓨浣犵殑娴嬭瘯缁撴灉</h2>
              <p className="text-xs text-slate-500 mt-1">鏀粯鍚庡彲闅忔椂鏌ョ湅鍘嗗彶璁板綍</p>
            </div>
            <div className="space-y-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="璇疯緭鍏ユ墜鏈哄彿"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-center text-lg tracking-widest"
              />
              <input
                type="tel"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="璁剧疆4浣嶆暟瀛楀瘑鐮?
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-center text-lg tracking-widest"
              />
              <p className="text-xs text-slate-400 text-center">馃敀 瀵嗙爜鐢ㄤ簬淇濇姢浣犵殑娴嬭瘯璁板綍</p>
              {phoneError && <p className="text-xs text-red-500 text-center">{phoneError}</p>}
              <button className="w-full mbti-button-primary" onClick={handlePhoneSubmit}>缁х画</button>
            </div>
          </div>
        )}

        {/* 妫€鏌ヤ腑 */}
        {step === 'checking' && (
          <div className="text-center py-6">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 mx-auto" />
            <p className="mt-4 text-sm text-slate-600">姝ｅ湪妫€鏌ヨ处鎴?..</p>
          </div>
        )}

        {/* 姝ラ2: 鏀粯浠嬬粛 */}
        {step === 'intro' && (
          <div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-900">瀹屾暣浜烘牸瑙ｆ瀽鎶ュ憡</span>
                <span className="text-xl font-black text-slate-950">楼{displayPrice}</span>
              </div>
              <div className="space-y-2">
                {benefits.map((b) => (
                  <div key={b} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="text-emerald-500">鉁?/span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  馃挕 鏀粯涓€娆″彲鏌ョ湅 <span className="font-bold text-slate-700">3娆?/span> 瀹屾暣鎶ュ憡
                </p>
              </div>
            </div>
            <button className="w-full mbti-button-primary" onClick={createOrder} disabled={loading}>
              {loading ? '鍒涘缓璁㈠崟涓?..' : `鏀粯 楼${displayPrice} 鏌ョ湅鎶ュ憡`}
            </button>
            <button className="w-full mt-3 mbti-button-ghost" onClick={() => navigate('/')}>
              鏆備笉鏀粯锛岃繑鍥為椤?
            </button>
            {error && <p className="mt-3 text-xs text-red-500 text-center">{error}</p>}
          </div>
        )}

        {/* 姝ラ3: 鏀粯涓?*/}
        {step === 'pay' && payData && (
          <div>
            {qrDataUrl ? (
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-3">鎵爜鏀粯</p>
                <img src={qrDataUrl} alt="鏀粯浜岀淮鐮? className="mx-auto rounded-xl" />
                <p className="mt-3 text-lg font-bold text-slate-950">楼{displayPrice}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-4">鐐瑰嚮涓嬫柟鎸夐挳鎵撳紑鏀粯</p>
                <button className="mbti-button-primary" onClick={openPayment}>鎵撳紑鏀粯</button>
              </div>
            )}
            <button className="w-full mt-4 mbti-button-ghost" onClick={() => setStep('polling')}>
              鎴戝凡鏀粯
            </button>
            <p className="mt-3 text-xs text-slate-400 text-center">璁㈠崟鍙? {payData.outTradeNo}</p>
          </div>
        )}

        {/* 姝ラ4: 杞纭 */}
        {step === 'polling' && (
          <div className="text-center py-6">
            {pollCount < MAX_POLLS && !error ? (
              <>
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 mx-auto" />
                <p className="mt-4 text-sm text-slate-600">姝ｅ湪纭鏀粯...</p>
                <p className="mt-1 text-xs text-slate-400">纭鍚庤嚜鍔ㄨ烦杞?/p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">鏀粯纭瓒呮椂</p>
                <p className="mt-1 text-xs text-slate-400">濡傚凡鏀粯锛岃鐐瑰嚮鎵嬪姩鍒锋柊</p>
              </>
            )}
            {error && <p className="mt-2 text-xs text-amber-600">{error}</p>}
            <div className="mt-4 space-y-2">
              <button className="w-full mbti-button-primary" onClick={manualRefresh}>
                鎵嬪姩鍒锋柊
              </button>
              <button className="text-xs text-slate-400 hover:text-slate-600 underline" onClick={cancelAndRetry}>
                鍙栨秷锛岄噸鏂版敮浠?
              </button>
            </div>
          </div>
        )}

        {/* 搴曢儴閾炬帴 */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400">
          <button onClick={() => navigate('/test')} className="hover:text-slate-600">閲嶆柊娴嬭瘯</button>
          <button onClick={() => navigate('/')} className="hover:text-slate-600">杩斿洖棣栭〉</button>
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
