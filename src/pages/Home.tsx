import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'

type TestCard = {
  key: string
  title: string
  desc: string
  tag: string
  meta: string
  status: 'live' | 'soon'
  cta: string
  image: string
  action: () => void
}

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

  const tests: TestCard[] = [
    {
      key: 'mbti',
      title: t('home_test_mbti_title'),
      desc: t('home_test_mbti_desc'),
      tag: t('home_test_mbti_tag'),
      meta: t('home_test_mbti_meta'),
      status: 'live',
      cta: t('home_test_mbti_cta'),
      image: '/images/tests/mbti.jpg',
      action: () => navigate('/test'),
    },
    {
      key: 'big5',
      title: t('home_test_big5_title'),
      desc: t('home_test_big5_desc'),
      tag: t('home_test_big5_tag'),
      meta: t('home_test_big5_meta'),
      status: 'soon',
      cta: t('home_test_soon_cta'),
      image: '/images/tests/big5.jpg',
      action: () => navigate('/tests/big5'),
    },
    {
      key: 'riasec',
      title: t('home_test_riasec_title'),
      desc: t('home_test_riasec_desc'),
      tag: t('home_test_riasec_tag'),
      meta: t('home_test_riasec_meta'),
      status: 'soon',
      cta: t('home_test_soon_cta'),
      image: '/images/tests/riasec.jpg',
      action: () => navigate('/tests/riasec'),
    },
    {
      key: 'sjt',
      title: t('home_test_sjt_title'),
      desc: t('home_test_sjt_desc'),
      tag: t('home_test_sjt_tag'),
      meta: t('home_test_sjt_meta'),
      status: 'soon',
      cta: t('home_test_soon_cta'),
      image: '/images/tests/sjt.jpg',
      action: () => navigate('/tests/sjt'),
    },
    {
      key: 'visual',
      title: t('home_test_visual_title'),
      desc: t('home_test_visual_desc'),
      tag: t('home_test_visual_tag'),
      meta: t('home_test_visual_meta'),
      status: 'soon',
      cta: t('home_test_soon_cta'),
      image: '/images/tests/visual.jpg',
      action: () => navigate('/tests/visual'),
    },
  ]

  const highlights = [
    { title: t('home_highlight_1_title'), desc: t('home_highlight_1_desc') },
    { title: t('home_highlight_2_title'), desc: t('home_highlight_2_desc') },
    { title: t('home_highlight_3_title'), desc: t('home_highlight_3_desc') },
  ]

  const steps = [
    { title: t('home_step_1_title'), desc: t('home_step_1_desc') },
    { title: t('home_step_2_title'), desc: t('home_step_2_desc') },
    { title: t('home_step_3_title'), desc: t('home_step_3_desc') },
  ]

  const previewMetrics = [
    { label: t('home_preview_metric_1'), percent: 30 },
    { label: t('home_preview_metric_2'), percent: 55 },
    { label: t('home_preview_metric_3'), percent: 72 },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16 page-enter">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium">
            {toast}
          </div>
        </div>
      )}

      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="mbti-pill">{t('home_badge_1')}</span>
            <span className="mbti-pill">{t('home_badge_2')}</span>
            <span className="mbti-pill">{t('home_badge_3')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-display leading-[1.05]">
            {t('home_title')}
          </h1>
          <p className="mt-3 text-xl text-slate-600 sm:text-2xl">
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
                <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                  {t('home_preview_title')}
                </div>
                <div className="text-sm text-slate-500">{t('home_preview_subtitle')}</div>
              </div>
              <span className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">{t('home_preview_sample')}</span>
            </div>

            <div className="space-y-3 mb-5">
              {previewMetrics.map((metric) => (
                <div key={metric.label} className="flex items-center gap-3">
                  <span className="w-10 text-xs font-semibold text-slate-500">{metric.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-slate-900" style={{ width: `${metric.percent}%` }} />
                  </div>
                  <span className="w-8 text-xs text-slate-400">{metric.percent}%</span>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/60 bg-slate-50/60 p-3">
                <div className="text-xs font-semibold text-slate-700 mb-2">{t('home_preview_focus')}</div>
                <div className="flex flex-wrap gap-1">
                  {t('home_preview_focus_items').split('、').map((s) => (
                    <span key={s} className="text-xs text-slate-700 bg-white/70 px-2 py-0.5 rounded-full border border-slate-200/70">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200/60 bg-slate-50/60 p-3">
                <div className="text-xs font-semibold text-slate-700 mb-2">{t('home_preview_action')}</div>
                <div className="flex flex-wrap gap-1">
                  {t('home_preview_action_items').split('、').map((s) => (
                    <span key={s} className="text-xs text-slate-700 bg-white/70 px-2 py-0.5 rounded-full border border-slate-200/70">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 font-display">
              {t('home_tests_title')}
            </h2>
            <p className="text-sm text-slate-600 mt-1">{t('home_tests_sub')}</p>
          </div>
          <span className="text-xs text-slate-500">{t('home_tests_hint')}</span>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tests.map((test) => (
            <button
              key={test.key}
              className="test-card text-left"
              onClick={test.action}
            >
              <div className="test-card__media">
                <img
                  src={test.image}
                  alt={test.title}
                  loading="lazy"
                  decoding="async"
                  className="test-card__img"
                />
              </div>
              <div className="test-card__overlay" />
              <div className="test-card__content">
                <div className="flex items-center gap-2 text-xs text-slate-100">
                  <span className="test-pill">{test.tag}</span>
                  <span className={`test-status ${test.status === 'live' ? 'test-status--live' : ''}`}>
                    {test.status === 'live' ? t('home_test_status_live') : t('home_test_status_soon')}
                  </span>
                </div>
                <div className="mt-3 text-lg font-bold text-white">{test.title}</div>
                <p className="mt-2 text-sm text-slate-200">{test.desc}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-200">
                  <span>{test.meta}</span>
                  <span className="font-semibold">{test.cta}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {highlights.map((f) => (
          <div key={f.title} className="mbti-card p-5">
            <div className="text-sm font-bold text-slate-900 mb-1">{f.title}</div>
            <div className="text-sm leading-relaxed text-slate-600">{f.desc}</div>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mb-4 font-display">
          {t('home_steps_title')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="mbti-card p-5">
              <div className="text-xs text-slate-500 mb-2">{t('home_steps_label', { n: index + 1 })}</div>
              <div className="text-sm font-bold text-slate-900 mb-1">{step.title}</div>
              <div className="text-sm text-slate-600">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 mbti-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 font-display">
              {t('home_section_cta')}
            </div>
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
