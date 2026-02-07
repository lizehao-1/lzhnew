import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { personalities } from '../data/personalities'

type Record = {
  result: string
  timestamp: number
  paid: boolean
  questionSet?: string
}

export default function History() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<Record[] | null>(null)
  const [notFound, setNotFound] = useState(false)

  const validatePhone = (value: string) => {
    if (!value) return '请输入手机号'
    if (!/^1[3-9]\d{9}$/.test(value)) return '请输入正确的手机号'
    return ''
  }

  const handleQuery = async () => {
    const err = validatePhone(phone)
    if (err) {
      setPhoneError(err)
      return
    }
    setPhoneError('')
    setLoading(true)
    setNotFound(false)

    try {
      const resp = await fetch(`/api/user/query?phone=${encodeURIComponent(phone)}`)
      const data = await resp.json()
      
      if (data.found && data.records?.length > 0) {
        setRecords(data.records.reverse()) // 最新的在前
      } else {
        setNotFound(true)
        setRecords(null)
      }
    } catch {
      setPhoneError('查询失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const viewResult = (record: Record) => {
    if (!record.paid) {
      alert('该记录未支付，无法查看完整报告')
      return
    }
    localStorage.setItem('mbti_result', record.result)
    localStorage.setItem('mbti_paid', 'true')
    navigate('/result')
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
        <p className="text-xs text-slate-500 text-center mb-6">输入手机号查看之前的测试结果</p>

        <div className="space-y-3 mb-6">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="请输入手机号"
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
            <p className="text-xs text-slate-500">找到 {records.length} 条记录</p>
            {records.map((record, i) => {
              const p = personalities[record.result]
              return (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-white/60 p-4 hover:border-slate-300 transition-colors cursor-pointer"
                  onClick={() => viewResult(record)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-slate-950">{record.result}</span>
                      <div>
                        <div className="text-sm font-medium text-slate-700">{p?.name || '未知类型'}</div>
                        <div className="text-xs text-slate-400">{getSetName(record.questionSet)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-0.5 rounded-full ${record.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {record.paid ? '已支付' : '未支付'}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{formatDate(record.timestamp)}</div>
                    </div>
                  </div>
                </div>
              )
            })}
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
