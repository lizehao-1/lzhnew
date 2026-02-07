import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LengthSelector from '../components/LengthSelector'
import QuizRunner from '../components/QuizRunner'
import { useI18n } from '../i18n'
import { LikertQuestion, QuizLength, QuizQuestion, QuizAnswers } from '../tests/types'

type Big5Scores = Record<'O' | 'C' | 'E' | 'A' | 'N', number>

function scoreBig5(answers: QuizAnswers, questions: LikertQuestion[]) {
  const scores: Big5Scores = { O: 0, C: 0, E: 0, A: 0, N: 0 }
  const counts: Big5Scores = { O: 0, C: 0, E: 0, A: 0, N: 0 }

  for (const q of questions) {
    const raw = answers[q.id]
    const v = raw === 1 || raw === 2 || raw === 3 || raw === 4 || raw === 5 ? raw : 3
    const centered = v - 3
    const signed = q.reverse ? -centered : centered
    scores[q.trait] += signed
    counts[q.trait] += 1
  }

  const normalized: Record<string, number> = {}
  for (const k of Object.keys(scores) as Array<keyof Big5Scores>) {
    const c = counts[k] || 1
    // Each item is [-2..2], convert average to [0..100]
    const avg = scores[k] / c
    normalized[k] = Math.round(((avg + 2) / 4) * 100)
  }

  return { scores, counts, normalized }
}

async function loadBank(len: QuizLength): Promise<LikertQuestion[]> {
  if (len === 'short') {
    const m = await import('../tests/banks/big5/short')
    return m.big5Short
  }
  if (len === 'standard') {
    const m = await import('../tests/banks/big5/standard')
    return m.big5Standard
  }
  const m = await import('../tests/banks/big5/long')
  return m.big5Long
}

export default function Big5() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [len, setLen] = useState<QuizLength | null>(null)
  const [questions, setQuestions] = useState<LikertQuestion[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof scoreBig5> | null>(null)

  const options = useMemo(
    () => [
      {
        id: 'short' as const,
        title: t('len_short_title'),
        desc: t('big5_len_short_desc'),
        meta: t('big5_len_short_meta'),
      },
      {
        id: 'standard' as const,
        title: t('len_standard_title'),
        desc: t('big5_len_standard_desc'),
        meta: t('big5_len_standard_meta'),
        recommended: true,
      },
      {
        id: 'long' as const,
        title: t('len_long_title'),
        desc: t('big5_len_long_desc'),
        meta: t('big5_len_long_meta'),
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
        title={t('big5_title')}
        subtitle={t('big5_intro')}
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
    const bars: Array<{ k: string; label: string; v: number }> = [
      { k: 'O', label: 'O ???', v: result.normalized.O },
      { k: 'C', label: 'C ???', v: result.normalized.C },
      { k: 'E', label: 'E ???', v: result.normalized.E },
      { k: 'A', label: 'A ???', v: result.normalized.A },
      { k: 'N', label: 'N ????', v: result.normalized.N },
    ]

    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14 page-enter">
        <div className="mbti-card p-6 sm:p-8">
          <div className="text-xs font-semibold text-slate-500">{t('test_hub_badge')}</div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-950 font-display">
            {t('big5_result_title')}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">{t('big5_result_desc')}</p>

          <div className="mt-6 space-y-3">
            {bars.map((b) => (
              <div key={b.k} className="flex items-center gap-3">
                <div className="w-24 text-xs font-semibold text-slate-600">{b.label}</div>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-slate-900" style={{ width: `${b.v}%` }} />
                </div>
                <div className="w-10 text-xs text-slate-500">{b.v}%</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="mbti-button-primary" onClick={() => window.alert(t('home_coming_soon'))}>
              {t('coach_cta')}
            </button>
            <button className="mbti-button-ghost" onClick={() => navigate('/')}> {t('back_home')} </button>
            <button className="mbti-button-ghost" onClick={() => {
              setResult(null)
              setLen(null)
              setQuestions(null)
            }}>
              {t('test_restart')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <QuizRunner
      title={t('big5_title')}
      subtitle={len === 'short' ? t('len_short_title') : len === 'standard' ? t('len_standard_title') : t('len_long_title')}
      questions={questions as QuizQuestion[]}
      storageKey={`lzh_big5_${len}_answers`}
      onFinish={({ answers, questions: qs }) => {
        const typed = (qs as LikertQuestion[]).filter((q) => q.kind === 'likert')
        setResult(scoreBig5(answers, typed))
      }}
    />
  )
}
