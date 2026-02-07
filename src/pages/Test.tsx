import { useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'

type Answers = Record<number, number>

const options = [
  { value: 5, label: '非常同意' },
  { value: 4, label: '比较同意' },
  { value: 3, label: '中立' },
  { value: 2, label: '比较不同意' },
  { value: 1, label: '非常不同意' },
] as const

function calculateResult(answers: Answers): string {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }

  questions.forEach((q) => {
    const answer = answers[q.id] ?? 3
    const score = answer - 3 // -2 to +2

    if (q.dimension === 'EI') {
      if (q.direction === 'positive') scores.E += score
      else scores.I += score
    } else if (q.dimension === 'SN') {
      if (q.direction === 'positive') scores.S += score
      else scores.N += score
    } else if (q.dimension === 'TF') {
      if (q.direction === 'positive') scores.T += score
      else scores.F += score
    } else if (q.dimension === 'JP') {
      if (q.direction === 'positive') scores.J += score
      else scores.P += score
    }
  })

  return (
    (scores.E >= scores.I ? 'E' : 'I') +
    (scores.S >= scores.N ? 'S' : 'N') +
    (scores.T >= scores.F ? 'T' : 'F') +
    (scores.J >= scores.P ? 'J' : 'P')
  )
}

export default function Test() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [isTransitioning, setIsTransitioning] = useState(false)
  const answersRef = useRef<Answers>({})

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])

  const handleAnswer = (value: number) => {
    if (isTransitioning) return // 防止快速点击

    // 同步更新 ref
    answersRef.current = { ...answersRef.current, [currentQuestion.id]: value }
    setAnswers(answersRef.current)

    if (currentIndex < questions.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((i) => i + 1)
        setIsTransitioning(false)
      }, 150)
    } else {
      // 最后一题，直接跳转
      const result = calculateResult(answersRef.current)
      localStorage.setItem('mbti_answers', JSON.stringify(answersRef.current))
      localStorage.setItem('mbti_result', result)
      navigate('/payment')
    }
  }

  const goBack = () => {
    if (isTransitioning) return
    setCurrentIndex((i) => Math.max(0, i - 1))
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-4">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white/65 backdrop-blur px-5 py-4 shadow-[0_14px_45px_rgba(2,6,23,0.08)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">进度</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              第 {currentIndex + 1} 题 / 共 {questions.length} 题
              <span className="ml-2 text-slate-500">（已答 {answeredCount} 题）</span>
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-900">{Math.round(progress)}%</div>
        </div>

        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-emerald-400 to-orange-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mbti-card p-7 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1">
            <div className="text-xs font-semibold text-slate-500">请选一个最符合的</div>
            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              {currentQuestion.text}
            </h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              💡 {currentQuestion.example}
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-3">
          {options.map((option) => {
            const selected = answers[currentQuestion.id] === option.value
            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                disabled={isTransitioning}
                className={[
                  'group w-full rounded-2xl border px-5 py-4 text-left transition',
                  selected
                    ? 'border-slate-950 bg-slate-950 text-white shadow-[0_16px_35px_rgba(2,6,23,0.25)]'
                    : 'border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{option.label}</div>
                  <div
                    className={[
                      'h-8 w-8 rounded-xl border grid place-items-center text-xs font-black transition',
                      selected
                        ? 'border-white/25 bg-white/10'
                        : 'border-slate-200 bg-white group-hover:border-slate-300',
                    ].join(' ')}
                  >
                    {option.value}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={goBack}
            className="mbti-button-ghost disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={currentIndex === 0 || isTransitioning}
          >
            返回上一题
          </button>
          <button className="mbti-pill hover:bg-white" onClick={() => navigate('/')}>
            退出
          </button>
        </div>
        <div className="mt-3 text-xs text-slate-500 text-center">
          选择后自动进入下一题（最后一题会进入支付页）。
        </div>
      </div>
    </div>
  )
}
