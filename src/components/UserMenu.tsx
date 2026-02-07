import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function UserMenu() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [inputPhone, setInputPhone] = useState('')
  const [inputPin, setInputPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 从 localStorage 恢复登录状态
  useEffect(() => {
    const savedPhone = localStorage.getItem('mbti_phone')
    if (savedPhone) setPhone(savedPhone)
  }, [])

  // 监听登录状态变化
  useEffect(() => {
    const handleLoginChange = () => {
      const savedPhone = localStorage.getItem('mbti_phone')
      setPhone(savedPhone)
    }
    window.addEventListener('mbti-login-change', handleLoginChange)
    return () => window.removeEventListener('mbti-login-change', handleLoginChange)
  }, [])

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
        setShowLogin(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogin = async () => {
    if (!inputPhone || !/^1[3-9]\d{9}$/.test(inputPhone)) {
      setError('请输入正确的手机号')
      return
    }
    if (!inputPin || !/^\d{4}$/.test(inputPin)) {
      setError('请输入4位数字密码')
      return
    }
    setError('')
    setLoading(true)

    try {
      const resp = await fetch(`/api/user/query?phone=${encodeURIComponent(inputPhone)}&pin=${encodeURIComponent(inputPin)}`)
      const data = await resp.json()
      
      if (data.error === 'PIN码错误') {
        setError('密码错误')
        setLoading(false)
        return
      }
      
      if (data.found) {
        localStorage.setItem('mbti_phone', inputPhone)
        localStorage.setItem('mbti_pin', inputPin)
        setPhone(inputPhone)
        setShowLogin(false)
        setInputPhone('')
        setInputPin('')
      } else {
        setError('账号不存在，请先完成测试')
      }
    } catch {
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('mbti_phone')
    localStorage.removeItem('mbti_pin')
    localStorage.removeItem('mbti_paid')
    setPhone(null)
    setShowMenu(false)
  }

  // 已登录状态
  if (phone) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <span className="text-sm font-medium text-slate-700">
            {phone.slice(0, 3)}****{phone.slice(-4)}
          </span>
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-slate-200 bg-white shadow-lg py-2 z-50">
            <button
              onClick={() => { navigate('/history'); setShowMenu(false) }}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              📋 历史记录
            </button>
            <button
              onClick={() => { navigate('/recharge'); setShowMenu(false) }}
              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              💰 充值积分
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50"
            >
              退出登录
            </button>
          </div>
        )}
      </div>
    )
  }

  // 未登录状态
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowLogin(!showLogin)}
        className="mbti-pill hover:bg-white"
      >
        登录
      </button>

      {showLogin && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-lg p-4 z-50">
          <h3 className="text-sm font-bold text-slate-900 mb-3">登录查看历史记录</h3>
          <div className="space-y-2">
            <input
              type="tel"
              value={inputPhone}
              onChange={(e) => setInputPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="手机号"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-slate-400 focus:outline-none"
            />
            <input
              type="tel"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="4位数字密码"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-slate-400 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
            <p className="text-xs text-slate-400 text-center">
              完成测试后自动创建账号
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
