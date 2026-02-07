import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LengthSelector from '../components/LengthSelector'
import QuizRunner from '../components/QuizRunner'
import { useI18n } from '../i18n'
import { ChoiceQuestion, QuizLength, QuizQuestion, QuizAnswers } from '../tests/types'

type Metric = 'collaboration' | 'execution' | 'assertiveness' | 'risk'

type SJTResult = {
  metrics: Record<Metric, number>
}

function scoreSJT(answers: QuizAnswers, questions: ChoiceQuestion[]): SJTResult {
  const metrics: Record<Metric, number> = {
    collaboration: 0,
    execution: 0,
    assertiveness: 0,
    risk: 0,
  }

  for (const q of questions) {
    const picked = answers[q.id] as string | undefined
    const opt = q.options.find((o) => o.id === picked)
    if (!opt) continue
    for (const [k, v] of Object.entries(opt.scores)) {
      if (k in metrics) metrics[k as Metric] += v
    }
  }

  return { metrics }
}

async function loadBank(len: QuizLength): Promise<ChoiceQuestion[]> {
  if (len === 'short') {
    const m = await import('../tests/banks/sjt/short')
    return m.sjtShort
  }
  if (len === 'standard') {
    const m = await import('../tests/banks/sjt/standard')
    return m.sjtStandard
  }
  const m = await import('../tests/banks/sjt/long')
  return m.sjtLong
}

export default function SJT() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [len, setLen] = useState<QuizLength | null>(null)
  const [questions, setQuestions] = useState<ChoiceQuestion[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SJTResult | null>(null)

  const options = useMemo(
    () => [
      {
        id: 'short' as const,
        title: t('len_short_title'),
        desc: t('sjt_len_short_desc'),
        meta: t('sjt_len_short_meta'),
      },
      {
        id: 'standard' as const,
        title: t('len_standard_title'),
        desc: t('sjt_len_standard_desc'),
        meta: t('sjt_len_standard_meta'),
        recommended: true,
      },
      {
        id: 'long' as const,
        title: t('len_long_title'),
        desc: t('sjt_len_long_desc'),
        meta: t('sjt_len_long_meta'),
      },
    ],
    [t]
  )

  useEffect(() => {
    if (!len) return
    setLoading(true)
    loadBank(len)
      .then((qs) => setQuestions(qs))
      .finally(() => setLoading(false))
  }, [len])

  if (!len) {
    return (
      <LengthSelector
        title={t('sjt_title')}
        subtitle={t('sjt_intro')}
        options={options}
        onSelect={setLen}
      />
    )
  }

  if (loading || !questions) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 mx-auto" />
          <p className="mt-3 text-sm text-slate-500">{t('test_loading')}</p>
        </div>
      </div>
    )
  }

  if (result) {
    const items: Array<{ k: Metric; label: string; v: number }> = [
      { k: 'collaboration', label: t('sjt_metric_collaboration'), v: result.metrics.collaboration },
      { k: 'execution', label: t('sjt_metric_execution'), v: result.metrics.execution },
      { k: 'assertiveness', label: t('sjt_metric_assertiveness'), v: result.metrics.assertiveness },
      { k: 'risk', label: t('sjt_metric_risk'), v: result.metrics.risk },
    ]

    const maxAbs = Math.max(1, ...items.map((i) => Math.abs(i.v)))

    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 page-enter">
        <div className="mbti-card p-6 sm:p-8">
          <div className="text-xs font-semibold text-slate-500">{t('test_hub_badge')}</div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-950 font-display">
            {t('sjt_result_title')}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">{t('sjt_result_desc')}</p>

          <div className="mt-6 space-y-3">
            {items.map((it) => {
              const pct = Math.round((Math.abs(it.v) / maxAbs) * 100)
              return (
                <div key={it.k} className="flex items-center gap-3">
                  <div className="w-28 text-xs font-semibold text-slate-600">{it.label}</div>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${pct}%`, opacity: it.v >= 0 ? 1 : 0.5 }}
                    />
                  </div>
                  <div className="w-12 text-xs text-slate-500">{it.v}</div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="mbti-button-primary" onClick={() => window.alert(t('home_coming_soon'))}>
              {t('coach_cta')}
            </button>
            <button className="mbti-button-ghost" onClick={() => navigate('/')}>{t('back_home')}</button>
            <button
              className="mbti-button-ghost"
              onClick={() => {
                setResult(null)
                setLen(null)
                setQuestions(null)
              }}
            >
              {t('test_restart')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <QuizRunner
      title={t('sjt_title')}
      subtitle={len === 'short' ? t('len_short_title') : len === 'standard' ? t('len_standard_title') : t('len_long_title')}
      questions={questions as QuizQuestion[]}
      storageKey={`lzh_sjt_${len}_answers`}
      onFinish={({ answers, questions: qs }) => {
        const typed = (qs as ChoiceQuestion[]).filter((q) => q.kind === 'choice')
        setResult(scoreSJT(answers, typed))
      }}
    />
  )
}
