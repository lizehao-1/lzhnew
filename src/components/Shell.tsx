import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import UserMenu from './UserMenu'
import { useI18n } from '../i18n'

function LogoMark({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white grid place-items-center shadow-[0_18px_40px_rgba(2,6,23,0.28)] ring-1 ring-white/10">
        <span className="font-black tracking-tight text-xs sm:text-sm">MB</span>
      </div>
      <div className="leading-tight hidden sm:block">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
    </div>
  )
}

export default function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const showChrome = pathname !== '/test'
  const { locale, setLocale, t } = useI18n()

  return (
    <div className="min-h-screen">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-8 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl animate-float" />
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute left-1/4 bottom-0 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl" />
      </div>

      {showChrome && (
        <header className="sticky top-0 z-10 glass-header">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
            <Link to="/" className="rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-200">
              <LogoMark title={t('brand_title')} subtitle={t('brand_subtitle')} />
            </Link>
            <nav className="flex items-center gap-2 sm:gap-3">
              <Link className="mbti-pill hover:bg-white text-xs sm:text-sm px-3 sm:px-4" to="/test">
                {t('nav_start')}
              </Link>
              <button
                className="mbti-pill hover:bg-white text-xs sm:text-sm px-3 sm:px-4"
                onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
              >
                {t('lang_label')}
              </button>
              <UserMenu />
            </nav>
          </div>
        </header>
      )}

      <main className={showChrome ? '' : 'pt-4'}>{children}</main>

      {showChrome && (
        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-slate-500">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>{t('footer_disclaimer')}</div>
            <div className="flex gap-3">
              <Link className="hover:text-slate-700" to="/">
                {t('nav_home')}
              </Link>
              <Link className="hover:text-slate-700" to="/test">
                {t('nav_test')}
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
