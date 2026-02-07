import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { personalities } from '../data/personalities'

type Record = {
  result: string
  timestamp: number
  viewed?: boolean
  questionSet?: string
}

export default function History() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<Record[] | null>(null)
  const [credits, setCredits] = useState(0)
  const [notFound, setNotFound] = useState(false)

  const validatePhone = (value: string) => {
    if (!value) return '请输入手机号'
    if (!/^1[3-9]\d{9}$/.test(value)) return '请输入正确的手机号'
    return ''
  }

  const validatePin = (value: string) => {
    if (!value) return '请输入PIN码'
    if (!/^\d{4}$/.test(value)) return 'PIN码必须是4位数字'
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
      const resp = await fetch(`/api/user/query?phone=${encodeURIComponent(phone)}&pin=${encodeURIComponent(pin)}`)
      const data = await resp.json()
      
      if (data.error === 'PIN码错误') {
        setPhoneError('PIN码错误')
        setRecords(null)
        setLoading(false)
        return
      }
      
      if (data.found && data.records?.length > 0) {
        setRecords(data.records.reverse())
        setCredits(data.credits || 0)
        // 保存到本地，方便后续使用
        localStorage.setItem('mbti_phone', phone)
        localStorage.setItem('mbti_pin', pin)
      } else {
        setNotFound(true)
        setRecords(null)
        setCredits(0)
      }
    } catch {
      setPhoneError('查询失败，请重试')
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
      alert('积分不足，请先支付后查看完整报告')
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
        alert('积分不足，请先支付后查看完整报告')
        setCredits(0)
      }
    } catch {
      alert('操作失败，请重试')
    }
  }

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const getSetName = (setId?: string) => {
    switch (setId) {
      case '28': return '快速版'
      case '93': return '完整版'
      default: return '标准版'
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mbti-card p-6">
        <h1 className="text-xl font-black text-slate-950 text-center mb-2">查询历史记录</h1>
        <p className="text-xs text-slate-500 text-center mb-6">输入手机号和密码查看之前的测试结果</p>

        <div className="space-y-3 mb-6">
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
            placeholder="请输入4位数字密码"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-center text-lg tracking-widest"
            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
          />
          {phoneError && <p className="text-xs text-red-500 text-center">{phoneError}</p>}
          <button className="w-full mbti-button-primary" onClick={handleQuery} disabled={loading}>
            {loading ? '查询中...' : '查询'}
          </button>
        </div>

        {notFound && (
          <div className="text-center py-6 text-slate-500">
            <p className="text-sm">未找到记录</p>
            <p className="text-xs mt-1">该手机号暂无测试记录</p>
          </div>
        )}

        {records && records.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
              <span className="text-sm text-amber-800">剩余查看次数</span>
              <span className="text-xl font-black text-amber-600">{credits}</span>
            </div>
            
            <p className="text-xs text-slate-500">找到 {records.length} 条记录</p>
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
                          {p?.name || '未知类型'}
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
                        {record.viewed ? '已查看' : canView ? '可查看' : '需支付'}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{formatDate(record.timestamp)}</div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {credits === 0 && (
              <p className="text-xs text-center text-slate-500 mt-4">
                💡 支付 ¥1 可获得3次查看机会
              </p>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button onClick={() => navigate('/')} className="text-xs text-slate-400 hover:text-slate-600">
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}
