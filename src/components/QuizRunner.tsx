import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QuizQuestion, QuizAnswers, LikertOptionValue } from '../tests/types'
import { useI18n } from '../i18n'

type FinishPayload = {
  answers: QuizAnswers
  questions: QuizQuestion[]
}

function clampLikert(value: unknown): LikertOptionValue {
  if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5) return value
  return 3
}

export default function QuizRunner({
  title,
  subtitle,
  questions,
  onFinish,
  storageKey,
}: {
  title: string
  subtitle?: string
  questions: QuizQuestion[]
  onFinish: (payload: FinishPayload) => void
  storageKey: string
}) {
  const navigate = useNavigate()
  const { t } = useI18n()

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>(() => {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return {}
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') return parsed as QuizAnswers
    } catch {
      // ignore
    }
    return {}
  })

  const answersRef = useRef<QuizAnswers>(answers)
  useEffect(() => {
    answersRef.current = answers
    localStorage.setItem(storageKey, JSON.stringify(answers))
  }, [answers, storageKey])

  const current = questions[index]
  const progress = questions.length ? ((index + 1) / questions.length) * 100 : 0

  const likertOptions = useMemo(
    () =>
      [
        { value: 5 as const, label: t('opt_strong_agree') },
        { value: 4 as const, label: t('opt_agree') },
        { value: 3 as const, label: t('opt_neutral') },
        { value: 2 as const, label: t('opt_disagree') },
        { value: 1 as const, label: t('opt_strong_disagree') },
      ],
    [t]
  )

  const setAnswer = (value: unknown) => {
    if (!current) return
    setAnswers((prev) => ({ ...prev, [current.id]: value }))
  }

  const next = () => {
    if (!current) return
    if (index < questions.length - 1) {
      setIndex((i) => i + 1)
      return
    }
    onFinish({ answers: answersRef.current, questions })
  }

  const prev = () => setIndex((i) => Math.max(0, i - 1))

  if (!current) return null

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-4 page-enter">
      <div className="mb-5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur px-4 py-3">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700">{title}</span>
            {subtitle && <span>{subtitle}</span>}
          </div>
          <span>
            {index + 1}/{questions.length} ? {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mbti-card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 leading-relaxed">{current.prompt}</h2>

        {current.kind === 'likert' && (
          <div className="mt-5 grid gap-2">
            {likertOptions.map((opt) => {
              const selected = clampLikert(answers[current.id]) === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setAnswer(opt.value)
                    next()
                  }}
                  className={[
                    'w-full rounded-xl border px-4 py-3 text-left transition-all duration-150',
                    selected
                      ? 'border-slate-800 bg-slate-800 text-white'
                      : 'border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span
                      className={`text-xs w-5 h-5 rounded-md flex items-center justify-center ${
                        selected ? 'bg-white/20' : 'bg-slate-100'
                      }`}
                    >
                      {opt.value}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {current.kind === 'choice' && (
          <div className="mt-5 grid gap-2">
            {current.options.map((opt) => {
              const selected = (answers[current.id] as string | undefined) === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setAnswer(opt.id)
                    next()
                  }}
                  className={[
                    'w-full rounded-xl border px-4 py-3 text-left transition-all duration-150',
                    selected
                      ? 'border-slate-800 bg-slate-800 text-white'
                      : 'border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300',
                  ].join(' ')}
                >
                  <div className="text-sm font-medium">{opt.text}</div>
                </button>
              )
            })}
          </div>
        )}

        {current.kind === 'image' && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {current.options.map((opt) => {
              const selected = (answers[current.id] as string | undefined) === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setAnswer(opt.id)
                    next()
                  }}
                  className={`visual-card ${selected ? 'visual-card--active' : ''}`}
                >
                  <img src={opt.src} alt={opt.alt || ''} loading="lazy" decoding="async" />
                  {opt.label && (
                    <div className="px-4 py-3 text-left text-sm font-semibold text-slate-800">
                      {opt.label}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {current.example && (
          <div className="mt-4 min-h-[40px] flex items-start">
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('test_example')} {current.example}
            </p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={prev}
            className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-30"
            disabled={index === 0}
          >
            {t('test_prev')}
          </button>
          <button className="text-xs text-slate-400 hover:text-slate-600" onClick={() => navigate('/')}>
            {t('test_exit')}
          </button>
        </div>
      </div>
    </div>
  )
}
