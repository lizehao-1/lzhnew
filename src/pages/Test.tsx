import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Question } from '../data/questions'
import { QuestionSetId, questionSets, loadQuestions } from '../data/question-sets'

type Answers = Record<number, number>

const options = [
  { value: 5, label: '非常同意' },
  { value: 4, label: '比较同意' },
  { value: 3, label: '中立' },
  { value: 2, label: '比较不同意' },
  { value: 1, label: '非常不同意' },
] as const

function calculateResult(answers: Answers, questions: Question[]): string {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }

  questions.forEach((q) => {
    const answer = answers[q.id] ?? 3
    const score = answer - 3

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

// 选择题库版本
function SetSelector({ onSelect }: { onSelect: (id: QuestionSetId) => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-slate-950">选择测试版本</h1>
        <p className="mt-2 text-sm text-slate-500">题目越多结果越准确，但需要更多时间</p>
      </div>
      <div className="grid gap-3">
        {questionSets.map((set) => (
          <button
            key={set.id}
            onClick={() => onSelect(set.id)}
            className="mbti-card p-5 text-left hover:border-slate-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-950">{set.name}</span>
                  <span className="text-xs text-slate-400">{set.count}题 · {set.time}</span>
                  {set.id === '48' && (
                    <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">推荐</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">{set.desc}</p>
              </div>
              <span className="text-slate-300 group-hover:text-slate-500 transition-colors">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Test() {
  const navigate = useNavigate()
  const [selectedSet, setSelectedSet] = useState<QuestionSetId | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [isTransitioning, setIsTransitioning] = useState(false)
  const answersRef = useRef<Answers>({})

  // 加载题库
  useEffect(() => {
    if (!selectedSet) return
    setLoading(true)
    loadQuestions(selectedSet).then((qs) => {
      setQuestions(qs)
      setLoading(false)
    })
  }, [selectedSet])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0

  const handleAnswer = (value: number) => {
    if (isTransitioning || !currentQuestion) return

    answersRef.current = { ...answersRef.current, [currentQuestion.id]: value }
    setAnswers(answersRef.current)

    if (currentIndex < questions.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((i) => i + 1)
        setIsTransitioning(false)
      }, 120)
    } else {
      const result = calculateResult(answersRef.current, questions)
      localStorage.setItem('mbti_answers', JSON.stringify(answersRef.current))
      localStorage.setItem('mbti_result', result)
      localStorage.setItem('mbti_question_set', selectedSet || '48')
      navigate('/payment')
    }
  }

  const goBack = () => {
    if (isTransitioning) return
    setCurrentIndex((i) => Math.max(0, i - 1))
  }

  // 未选择版本时显示选择器
  if (!selectedSet) {
    return <SetSelector onSelect={setSelectedSet} />
  }

  // 加载中
  if (loading || !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 mx-auto" />
          <p className="mt-3 text-sm text-slate-500">加载题目中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-4">
      {/* 进度条 */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white/70 backdrop-blur px-4 py-3">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>第 {currentIndex + 1} / {questions.length} 题</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 题目卡片 */}
      <div className="mbti-card p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 leading-relaxed">
          {currentQuestion.text}
        </h2>

        {/* 选项 */}
        <div className="mt-5 grid gap-2">
          {options.map((option) => {
            const selected = answers[currentQuestion.id] === option.value
            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                disabled={isTransitioning}
                className={[
                  'w-full rounded-xl border px-4 py-3 text-left transition-all duration-150',
                  selected
                    ? 'border-slate-800 bg-slate-800 text-white'
                    : 'border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className={`text-xs w-5 h-5 rounded-md flex items-center justify-center ${selected ? 'bg-white/20' : 'bg-slate-100'}`}>
                    {option.value}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* 生活化提示 - 固定高度 */}
        <div className="mt-4 min-h-[60px] flex items-start">
          <p className="text-xs text-slate-400 leading-relaxed">
            💡 {currentQuestion.example}
          </p>
        </div>

        {/* 底部操作 */}
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={goBack}
            className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-30"
            disabled={currentIndex === 0 || isTransitioning}
          >
            ← 上一题
          </button>
          <button
            className="text-xs text-slate-400 hover:text-slate-600"
            onClick={() => navigate('/')}
          >
            退出
          </button>
        </div>
      </div>
    </div>
  )
}
