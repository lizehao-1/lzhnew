import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LengthSelector from '../components/LengthSelector'
import QuizRunner from '../components/QuizRunner'
import { useI18n } from '../i18n'
import { ImageQuestion, QuizLength, QuizQuestion, QuizAnswers } from '../tests/types'

type VisualResult = {
  tags: Array<{ k: string; v: number }>
}

function scoreVisual(answers: QuizAnswers, questions: ImageQuestion[]): VisualResult {
  const scores: Record<string, number> = {}
  for (const q of questions) {
    const picked = answers[q.id] as string | undefined
    const opt = q.options.find((o) => o.id === picked)
    if (!opt) continue
    for (const [k, v] of Object.entries(opt.scores)) {
      scores[k] = (scores[k] || 0) + v
    }
  }
  const tags = Object.entries(scores)
    .map(([k, v]) => ({ k, v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 3)
  return { tags }
}

async function loadBank(len: QuizLength): Promise<ImageQuestion[]> {
  if (len === 'short') {
    const m = await import('../tests/banks/visual/short')
    return m.visualShort
  }
  if (len === 'standard') {
    const m = await import('../tests/banks/visual/standard')
    return m.visualStandard
  }
  const m = await import('../tests/banks/visual/long')
  return m.visualLong
}

export default function VisualTest() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [len, setLen] = useState<QuizLength | null>(null)
  const [questions, setQuestions] = useState<ImageQuestion[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VisualResult | null>(null)

  const options = useMemo(
    () => [
      {
        id: 'short' as const,
        title: t('len_short_title'),
        desc: t('visual_len_short_desc'),
        meta: t('visual_len_short_meta'),
      },
      {
        id: 'standard' as const,
        title: t('len_standard_title'),
        desc: t('visual_len_standard_desc'),
        meta: t('visual_len_standard_meta'),
        recommended: true,
      },
      {
        id: 'long' as const,
        title: t('len_long_title'),
        desc: t('visual_len_long_desc'),
        meta: t('visual_len_long_meta'),
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
        title={t('visual_title')}
        subtitle={t('visual_intro')}
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
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 page-enter">
        <div className="mbti-card p-6 sm:p-8">
          <div className="text-xs font-semibold text-slate-500">{t('test_hub_badge')}</div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-950 font-display">
            {t('visual_result_title')}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">{t('visual_result_desc')}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {result.tags.map((tag) => (
              <span
                key={tag.k}
                className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {tag.k} ? {tag.v}
              </span>
            ))}
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
      title={t('visual_title')}
      subtitle={len === 'short' ? t('len_short_title') : len === 'standard' ? t('len_standard_title') : t('len_long_title')}
      questions={questions as QuizQuestion[]}
      storageKey={`lzh_visual_${len}_answers`}
      onFinish={({ answers, questions: qs }) => {
        const typed = (qs as ImageQuestion[]).filter((q) => q.kind === 'image')
        setResult(scoreVisual(answers, typed))
      }}
    />
  )
}
