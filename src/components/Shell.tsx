import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import UserMenu from './UserMenu'

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-slate-950 text-white grid place-items-center shadow-[0_10px_30px_rgba(2,6,23,0.20)]">
        <span className="font-black tracking-tight">MB</span>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-slate-900">MBTI 测试</div>
        <div className="text-xs text-slate-500">48 题 · 10 分钟</div>
      </div>
    </div>
  )
}

export default function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const showChrome = pathname !== '/test'

  return (
    <div className="min-h-screen">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-orange-400/15 blur-3xl" />
        <div className="absolute left-1/4 bottom-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      {showChrome && (
        <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/55 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link to="/" className="rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-200">
              <LogoMark />
            </Link>
            <nav className="flex items-center gap-2">
              <Link className="mbti-pill hover:bg-white" to="/test">
                开始测试
              </Link>
              <UserMenu />
            </nav>
          </div>
        </header>
      )}

      <main className={showChrome ? '' : 'pt-4'}>{children}</main>

      {showChrome && (
        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-slate-500">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              免责声明：MBTI 为性格偏好参考工具，不代表能力高低；请理性看待测试结果。
            </div>
            <div className="flex gap-3">
              <Link className="hover:text-slate-700" to="/">
                首页
              </Link>
              <Link className="hover:text-slate-700" to="/test">
                测试
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

