import { useState } from 'react'
import { useI18n } from '../i18n'

type UserRow = {
  phone: string
  pin: string
  credits: number
  created_at?: number
  updated_at?: number
  last_result?: string
  last_ts?: number
}

export default function AdminUsers() {
  const { t } = useI18n()
  const [adminKey, setAdminKey] = useState('')
  const [phone, setPhone] = useState('')
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const resp = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey,
          phone: phone.trim() || undefined,
          limit: 50
        })
      })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error || 'request failed')
        setUsers([])
        return
      }
      setUsers(Array.isArray(data.users) ? data.users : [])
    } catch (err: any) {
      setError(err?.message || 'request failed')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const formatTs = (ts?: number) => {
    if (!ts) return '-'
    const d = new Date(ts)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 page-enter">
      <div className="mbti-card p-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 text-center mb-2 font-display">{t('admin_title')}</h1>
        <p className="text-xs text-slate-500 text-center mb-6">{t('admin_sub')}</p>

        <div className="space-y-3 mb-4">
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder={t('admin_key_ph')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-center"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder={t('admin_phone_ph')}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:outline-none text-center tracking-widest"
          />
          <button className="w-full mbti-button-primary" onClick={fetchUsers} disabled={loading}>
            {loading ? 'Loading...' : t('admin_query')}
          </button>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>

        <div className="space-y-3">
          {users.length === 0 && !loading && (
            <div className="text-center text-xs text-slate-400 py-4">{t('admin_no_results')}</div>
          )}

          {users.map((u) => (
            <div key={u.phone} className="rounded-xl border border-slate-200 bg-white/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{u.phone}</div>
                  <div className="text-xs text-slate-500">{t('admin_pin')}: {u.pin || '-'}</div>
                  <div className="text-xs text-slate-400">{t('admin_updated')}: {formatTs(u.updated_at)}</div>
                  <div className="text-xs text-slate-400">{t('admin_created')}: {formatTs(u.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">{t('admin_credits')}</div>
                  <div className="text-2xl font-black text-amber-600">{u.credits ?? 0}</div>
                  <div className="text-xs text-slate-500 mt-2">{t('admin_last_result')}</div>
                  <div className="text-sm font-semibold text-slate-700">{u.last_result || '-'}</div>
                  <div className="text-xs text-slate-400">{formatTs(u.last_ts)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
