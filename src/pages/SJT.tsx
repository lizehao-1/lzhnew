import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LengthSelector from '../components/LengthSelector'
import QuizRunner from '../components/QuizRunner'
import { useI18n } from '../i18n'
import { ChoiceQuestion, QuizLength, QuizQuestion, QuizAnswers } from '../tests/types'

type Metric = 'collaboration' | 'execution' | 'assertiveness' | 'risk'

type Tier = 'low' | 'mid' | 'high'

function tierOf(pct: number): Tier {
  if (pct >= 70) return 'high'
  if (pct >= 45) return 'mid'
  return 'low'
}

function metricMax(len: QuizLength) {
  // Keep normalization stable across banks.
  return len === 'short' ? 12 : len === 'standard' ? 24 : 30
}

function normalizeMetric(raw: number, max: number) {
  const clamped = Math.max(-max, Math.min(max, raw))
  return Math.round(((clamped + max) / (2 * max)) * 100)
}

function getMetricTextKey(metric: Metric, tier: Tier, kind: 'title' | 'desc' | 'hint') {
  return `sjt_${metric}_${tier}_${kind}` as const
}

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
    const max = metricMax((len || 'standard') as QuizLength)
    const base: Array<{ k: Metric; label: string; raw: number }> = [
      { k: 'collaboration', label: t('sjt_metric_collaboration'), raw: result.metrics.collaboration },
      { k: 'execution', label: t('sjt_metric_execution'), raw: result.metrics.execution },
      { k: 'assertiveness', label: t('sjt_metric_assertiveness'), raw: result.metrics.assertiveness },
      { k: 'risk', label: t('sjt_metric_risk'), raw: result.metrics.risk },
    ]

    const items: Array<{ k: Metric; label: string; raw: number; pct: number; tier: Tier }> = base.map((it) => {
      const pct = normalizeMetric(it.raw, max)
      const tier = tierOf(pct)
      return { ...it, pct, tier }
    })

    const strengths = items
      .slice()
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 2)
      .map((i) => i.label)

    const weakest = items
      .slice()
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 1)
      .map((i) => i.label)

    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 page-enter">
        <div className="mbti-card p-6 sm:p-8">
          <div className="text-xs font-semibold text-slate-500">{t('test_hub_badge')}</div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-950 font-display">
            {t('sjt_result_title')}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">{t('sjt_result_desc')}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <div className="text-xs font-semibold text-emerald-700">{t('report_strengths')}</div>
              <div className="mt-2 text-sm text-emerald-900 font-bold">{strengths.join(' · ')}</div>
              <div className="mt-1 text-xs text-emerald-700">{t('report_strengths_hint')}</div>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
              <div className="text-xs font-semibold text-amber-700">{t('report_risks')}</div>
              <div className="mt-2 text-sm text-amber-900 font-bold">{weakest.join(' · ')}</div>
              <div className="mt-1 text-xs text-amber-700">{t('report_risks_hint')}</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {items.map((it) => (
              <div key={it.k} className="rounded-2xl border border-slate-200/60 bg-white/70 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">{it.label}</div>
                    <div className="mt-1 text-sm font-bold text-slate-900">
                      {t(getMetricTextKey(it.k, it.tier, 'title') as never)}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {t(getMetricTextKey(it.k, it.tier, 'desc') as never)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-950">{it.pct}</div>
                    <div className="text-xs text-slate-400">/ 100</div>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-slate-900" style={{ width: `${it.pct}%` }} />
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {t(getMetricTextKey(it.k, it.tier, 'hint') as never)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4">
            <div className="mbti-card p-5">
              <div className="text-sm font-bold text-slate-900">{t('report_interviewer_view')}</div>
              <div className="mt-2 grid gap-2 text-sm text-slate-600">
                <div>• {t('report_interviewer_1')}</div>
                <div>• {t('report_interviewer_2')}</div>
                <div>• {t('report_interviewer_3')}</div>
              </div>
            </div>

            <div className="mbti-card p-5">
              <div className="text-sm font-bold text-slate-900">{t('report_templates')}</div>
              <div className="mt-2 text-sm text-slate-600">{t('report_templates_desc')}</div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">{t('tpl_conflict_title')}</div>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700">{t('tpl_conflict_body')}</pre>
                </div>
                <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">{t('tpl_badnews_title')}</div>
                  <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700">{t('tpl_badnews_body')}</pre>
                </div>
              </div>
            </div>

            <div className="mbti-card p-5">
              <div className="text-sm font-bold text-slate-900">{t('report_training')}</div>
              <div className="mt-2 grid gap-2 text-sm text-slate-600">
                <div>1. {t('train_1')}</div>
                <div>2. {t('train_2')}</div>
                <div>3. {t('train_3')}</div>
              </div>
            </div>
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
