import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [toast, setToast] = useState<string | null>(null)
  const { t } = useI18n()

  useEffect(() => {
    const state = location.state as { message?: string } | null
    if (state?.message) {
      setToast(state.message)
      window.history.replaceState({}, document.title)
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  const features = [
    { icon: '??', title: t('feature_1_title'), desc: t('feature_1_desc') },
    { icon: '??', title: t('feature_2_title'), desc: t('feature_2_desc') },
    { icon: '??', title: t('feature_3_title'), desc: t('feature_3_desc') },
  ]

  const dimensions = [
    { left: t('dim_e'), right: t('dim_i'), desc: t('dim_ei_desc') },
    { left: t('dim_s'), right: t('dim_n'), desc: t('dim_sn_desc') },
    { left: t('dim_t'), right: t('dim_f'), desc: t('dim_tf_desc') },
    { left: t('dim_j'), right: t('dim_p'), desc: t('dim_jp_desc') },
  ]

  const usecases = [t('usecase_1'), t('usecase_2'), t('usecase_3'), t('usecase_4')]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16 page-enter">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium">
            ? {toast}
          </div>
        </div>
      )}

      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="mbti-pill">{t('home_badge_1')}</span>
            <span className="mbti-pill">{t('home_badge_2')}</span>
            <span className="mbti-pill">{t('home_badge_3')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-display leading-[1.05]">
            {t('home_title')}
          </h1>
          <p className="mt-2 text-xl text-slate-600 sm:text-2xl">
            {t('home_subtitle')}
          </p>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
            {t('home_intro')}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button className="mbti-button-primary text-base" onClick={() => navigate('/test')}>
              {t('home_cta_primary')}
            </button>
            <button className="mbti-button-ghost text-sm" onClick={() => navigate('/history')}>
              {t('home_cta_secondary')}
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            {t('home_note')}
          </p>
        </div>

        <div className="relative">
          <div className="mbti-card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="text-xs font-semibold text-slate-500">{t('home_preview_label')}</div>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-4xl font-black tracking-tight text-slate-950">INTJ</span>
                  <div className="pb-1">
                    <div className="text-base font-bold text-slate-900">{t('home_preview_title')}</div>
                    <div className="text-sm text-slate-500">{t('home_preview_subtitle')}</div>
                  </div>
                </div>
              </div>
              <span className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">{t('home_preview_sample')}</span>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: 'E/I', percent: 23, color: 'bg-sky-500' },
                { label: 'S/N', percent: 35, color: 'bg-emerald-500' },
                { label: 'T/F', percent: 78, color: 'bg-orange-500' },
                { label: 'J/P', percent: 65, color: 'bg-purple-500' },
              ].map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-semibold text-slate-500">{d.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.percent}%` }} />
                  </div>
                  <span className="w-8 text-xs text-slate-400">{d.percent}%</span>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                <div className="text-xs font-semibold text-emerald-600 mb-2">{t('home_strengths')}</div>
                <div className="flex flex-wrap gap-1">
                  {['战略思维', '独立自主', '追求卓越'].map((s) => (
                    <span key={s} className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                <div className="text-xs font-semibold text-amber-600 mb-2">{t('home_growth')}</div>
                <div className="flex flex-wrap gap-1">
                  {['情感表达', '灵活变通'].map((w) => (
                    <span key={w} className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{w}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="mbti-card p-5">
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="text-sm font-bold text-slate-900 mb-1">{f.title}</div>
            <div className="text-sm leading-relaxed text-slate-600">{f.desc}</div>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mb-4 font-display">{t('home_section_what')}</h2>
        <div className="mbti-card p-6">
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            {t('home_intro')}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {dimensions.map((d) => (
              <div key={d.left} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-sky-600">{d.left}</span>
                  <span className="text-slate-300">vs</span>
                  <span className="text-sm font-bold text-orange-500">{d.right}</span>
                </div>
                <p className="text-xs text-slate-500">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mb-4 font-display">{t('home_section_use')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {usecases.map((text) => (
            <div key={text} className="mbti-card p-4 flex items-start gap-3">
              <span className="text-xl">?</span>
              <span className="text-sm text-slate-600">{text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 mbti-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 font-display">{t('home_section_cta')}</div>
            <div className="mt-1 text-sm text-slate-600">{t('home_section_cta_sub')}</div>
          </div>
          <button className="mbti-button-primary whitespace-nowrap" onClick={() => navigate('/test')}>
            {t('home_cta_primary')} →
          </button>
        </div>
      </section>

      <div className="mt-8 text-center text-xs text-slate-400">
        {t('footer_disclaimer')}
      </div>
    </div>
  )
}
