import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LengthSelector from '../components/LengthSelector'
import QuizRunner from '../components/QuizRunner'
import { useI18n } from '../i18n'
import { ChoiceQuestion, QuizLength, QuizQuestion, QuizAnswers } from '../tests/types'

type RIASECKey = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

function scoreRIASEC(answers: QuizAnswers, questions: ChoiceQuestion[]) {
  const scores: Record<RIASECKey, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }

  for (const q of questions) {
    const picked = answers[q.id] as string | undefined
    const opt = q.options.find((o) => o.id === picked)
    if (!opt) continue
    for (const [k, v] of Object.entries(opt.scores)) {
      if (k in scores) scores[k as RIASECKey] += v
    }
  }

  const sorted = (Object.keys(scores) as RIASECKey[])
    .map((k) => ({ k, v: scores[k] }))
    .sort((a, b) => b.v - a.v)

  const top = sorted.slice(0, 3).map((x) => x.k).join('')
  return { scores, sorted, top }
}

async function loadBank(len: QuizLength): Promise<ChoiceQuestion[]> {
  if (len === 'short') {
    const m = await import('../tests/banks/riasec/short')
    return m.riasecShort
  }
  if (len === 'standard') {
    const m = await import('../tests/banks/riasec/standard')
    return m.riasecStandard
  }
  const m = await import('../tests/banks/riasec/long')
  return m.riasecLong
}

export default function RIASEC() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [len, setLen] = useState<QuizLength | null>(null)
  const [questions, setQuestions] = useState<ChoiceQuestion[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof scoreRIASEC> | null>(null)

  const options = useMemo(
    () => [
      {
        id: 'short' as const,
        title: t('len_short_title'),
        desc: t('riasec_len_short_desc'),
        meta: t('riasec_len_short_meta'),
      },
      {
        id: 'standard' as const,
        title: t('len_standard_title'),
        desc: t('riasec_len_standard_desc'),
        meta: t('riasec_len_standard_meta'),
        recommended: true,
      },
      {
        id: 'long' as const,
        title: t('len_long_title'),
        desc: t('riasec_len_long_desc'),
        meta: t('riasec_len_long_meta'),
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
        title={t('riasec_title')}
        subtitle={t('riasec_intro')}
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
            {t('riasec_result_title', { code: result.top })}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">{t('riasec_result_desc')}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {result.sorted.map((item) => (
              <div key={item.k} className="rounded-2xl border border-slate-200/60 bg-white/70 p-4">
                <div className="text-sm font-bold text-slate-900">{item.k}</div>
                <div className="text-xs text-slate-500">{t('riasec_code_hint')}</div>
                <div className="mt-2 text-2xl font-black text-slate-950">{item.v}</div>
              </div>
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
      title={t('riasec_title')}
      subtitle={len === 'short' ? t('len_short_title') : len === 'standard' ? t('len_standard_title') : t('len_long_title')}
      questions={questions as QuizQuestion[]}
      storageKey={`lzh_riasec_${len}_answers`}
      onFinish={({ answers, questions: qs }) => {
        const typed = (qs as ChoiceQuestion[]).filter((q) => q.kind === 'choice')
        setResult(scoreRIASEC(answers, typed))
      }}
    />
  )
}
