import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { personalities, Personality } from '../data/personalities'

// 根据结果类型计算各维度百分比（简化版，基于结果字母）
function getDimensionPercentagesFromResult(result: string) {
  // 默认百分比，根据结果字母设置主导方向
  const base = 65 // 主导方向的基础百分比
  
  return {
    E: result[0] === 'E' ? base : 100 - base,
    I: result[0] === 'I' ? base : 100 - base,
    S: result[1] === 'S' ? base : 100 - base,
    N: result[1] === 'N' ? base : 100 - base,
    T: result[2] === 'T' ? base : 100 - base,
    F: result[2] === 'F' ? base : 100 - base,
    J: result[3] === 'J' ? base : 100 - base,
    P: result[3] === 'P' ? base : 100 - base,
  }
}

function DimensionBar({ left, right, leftPercent, leftLabel, rightLabel, leftDesc, rightDesc }: {
  left: string
  right: string
  leftPercent: number
  leftLabel: string
  rightLabel: string
  leftDesc: string
  rightDesc: string
}) {
  const isLeftDominant = leftPercent >= 50
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/60 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-left">
          <div className={`text-lg font-black ${isLeftDominant ? 'text-sky-600' : 'text-slate-400'}`}>{left}</div>
          <div className="text-xs text-slate-500">{leftLabel}</div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-black ${!isLeftDominant ? 'text-orange-500' : 'text-slate-400'}`}>{right}</div>
          <div className="text-xs text-slate-500">{rightLabel}</div>
        </div>
      </div>
      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isLeftDominant ? 'bg-gradient-to-r from-sky-500 to-sky-400' : 'bg-gradient-to-r from-orange-400 to-orange-500'}`}
          style={{ width: `${isLeftDominant ? leftPercent : 100 - leftPercent}%`, marginLeft: isLeftDominant ? 0 : 'auto' }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <span>{leftPercent}%</span>
        <span>{100 - leftPercent}%</span>
      </div>
      <p className="mt-3 text-xs text-slate-600 leading-relaxed">
        {isLeftDominant ? leftDesc : rightDesc}
      </p>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <section className="mbti-card p-6 sm:p-7">
      <h3 className="flex items-center gap-2 text-base font-black tracking-tight text-slate-950">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function Result() {
  const navigate = useNavigate()
  const [personality, setPersonality] = useState<Personality | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const result = localStorage.getItem('mbti_result')
    const paid = localStorage.getItem('mbti_paid')

    if (!result) {
      navigate('/')
      return
    }

    if (!paid) {
      navigate('/payment')
      return
    }

    const p = personalities[result]
    if (p) setPersonality(p)
  }, [navigate])

  useEffect(() => {
    const pendingRaw = localStorage.getItem('mbti_pending_use_credit')
    if (!pendingRaw) return
    let cancelled = false
    let attempts = 0

    const tryConsume = async () => {
      if (cancelled) return
      attempts += 1
      try {
        const pending = JSON.parse(pendingRaw)
        if (!pending?.phone || !pending?.timestamp) {
          localStorage.removeItem('mbti_pending_use_credit')
          return
        }
        const resp = await fetch('/api/user/use-credit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: pending.phone, timestamp: pending.timestamp })
        })
        const data = await resp.json()
        if (data.success) {
          localStorage.removeItem('mbti_pending_use_credit')
          return
        }
      } catch {
        // ignore and retry
      }
      if (attempts >= 15) {
        localStorage.removeItem('mbti_pending_use_credit')
        return
      }
      setTimeout(tryConsume, 2000)
    }

    tryConsume()
    return () => {
      cancelled = true
    }
  }, [])

  // 直接根据结果类型计算百分比，不依赖答案
  const percentages = useMemo(() => {
    if (!personality) return { E: 50, I: 50, S: 50, N: 50, T: 50, F: 50, J: 50, P: 50 }
    return getDimensionPercentagesFromResult(personality.type)
  }, [personality])

  const restart = () => {
    localStorage.removeItem('mbti_answers')
    localStorage.removeItem('mbti_result')
    localStorage.removeItem('mbti_paid')
    navigate('/')
  }

  const shareText = useMemo(() => {
    if (!personality) return ''
    return `我的 MBTI 类型是 ${personality.type}（${personality.name}｜${personality.nickname}）\n\n${personality.description.slice(0, 80)}...\n\n🔗 测试地址：${window.location.origin}`
  }, [personality])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  if (!personality) return null

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 顶部主卡片 */}
      <div className="mbti-card p-6 sm:p-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700">
              ✨ 测试完成 · 完整人格解析报告
            </div>
            
            <div className="flex items-end gap-4 mb-4">
              <div className="text-6xl sm:text-7xl font-black tracking-tighter text-slate-950">
                {personality.type}
              </div>
              <div className="pb-2">
                <div className="text-2xl font-black text-slate-950">{personality.name}</div>
                <div className="text-base text-slate-600">{personality.nickname}</div>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-600 max-w-2xl">
              {personality.description}
            </p>
          </div>

          <div className="flex flex-col gap-2 lg:items-end">
            <button className="mbti-button-primary" onClick={copy}>
              {copied ? '✓ 已复制' : '📋 复制分享'}
            </button>
            <button className="mbti-button-ghost" onClick={restart}>
              🔄 重新测试
            </button>
          </div>
        </div>
      </div>

      {/* 四维度分析 */}
      <div className="mb-6">
        <h2 className="text-lg font-black text-slate-950 mb-4 flex items-center gap-2">
          📊 四维度偏好分析
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <DimensionBar
            left="E" right="I"
            leftPercent={percentages.E}
            leftLabel="外向" rightLabel="内向"
            leftDesc="你倾向于从外部世界获取能量，喜欢社交互动，在人群中感到充实。"
            rightDesc="你倾向于从内心世界获取能量，享受独处时光，深度思考让你充电。"
          />
          <DimensionBar
            left="S" right="N"
            leftPercent={percentages.S}
            leftLabel="感觉" rightLabel="直觉"
            leftDesc="你更关注具体事实和细节，相信实际经验，脚踏实地。"
            rightDesc="你更关注可能性和整体图景，喜欢抽象思考，富有想象力。"
          />
          <DimensionBar
            left="T" right="F"
            leftPercent={percentages.T}
            leftLabel="思考" rightLabel="情感"
            leftDesc="你做决定时更看重逻辑和客观分析，追求公平和效率。"
            rightDesc="你做决定时更考虑人的感受和价值观，追求和谐与认同。"
          />
          <DimensionBar
            left="J" right="P"
            leftPercent={percentages.J}
            leftLabel="判断" rightLabel="知觉"
            leftDesc="你喜欢有计划、有条理的生活，做事有始有终，追求确定性。"
            rightDesc="你喜欢灵活开放的生活方式，随机应变，享受过程中的可能性。"
          />
        </div>
      </div>

      {/* 核心特质 */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <Section title="核心优势" icon="💪">
          <div className="flex flex-wrap gap-2">
            {personality.strengths.map((s) => (
              <span key={s} className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                {s}
              </span>
            ))}
          </div>
          {personality.strengthDetails && (
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">{personality.strengthDetails}</p>
          )}
        </Section>

        <Section title="成长空间" icon="🌱">
          <div className="flex flex-wrap gap-2">
            {personality.weaknesses.map((w) => (
              <span key={w} className="inline-flex items-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                {w}
              </span>
            ))}
          </div>
          {personality.weaknessDetails && (
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">{personality.weaknessDetails}</p>
          )}
        </Section>
      </div>

      {/* 职业与环境 */}
      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2">
          <Section title="适合的职业方向" icon="💼">
            <div className="flex flex-wrap gap-2 mb-4">
              {personality.careers.map((c) => (
                <span key={c} className="inline-flex items-center rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
                  {c}
                </span>
              ))}
            </div>
            {personality.careerAdvice && (
              <p className="text-sm text-slate-600 leading-relaxed">{personality.careerAdvice}</p>
            )}
          </Section>
        </div>
        
        <Section title="同类型名人" icon="⭐">
          <div className="flex flex-wrap gap-2">
            {personality.famousPeople.map((p) => (
              <span key={p} className="inline-flex items-center rounded-xl border border-slate-200 bg-white/60 px-3 py-1.5 text-sm font-medium text-slate-700">
                {p}
              </span>
            ))}
          </div>
        </Section>
      </div>

      {/* 人际关系 */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <Section title="人际关系" icon="💬">
          <p className="text-sm leading-relaxed text-slate-600">{personality.relationships}</p>
          {personality.communicationTips && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-xs font-semibold text-slate-500 mb-2">沟通建议</div>
              <p className="text-sm text-slate-600 leading-relaxed">{personality.communicationTips}</p>
            </div>
          )}
        </Section>

        <Section title="最佳搭档类型" icon="🤝">
          {personality.compatibleTypes ? (
            <div className="space-y-3">
              {personality.compatibleTypes.map((ct) => (
                <div key={ct.type} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-lg font-black text-slate-950">{ct.type}</span>
                  <span className="text-sm text-slate-600">{ct.reason}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">暂无数据</p>
          )}
        </Section>
      </div>

      {/* 行动建议 */}
      {personality.actionTips && (
        <Section title="本周可执行的小行动" icon="🎯">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {personality.actionTips.map((tip, i) => (
              <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100">
                <div className="text-xs font-semibold text-slate-400 mb-1">行动 {i + 1}</div>
                <p className="text-sm text-slate-700">{tip}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 底部提示 */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400">
          MBTI 是一种性格偏好工具，帮助你更好地了解自己，而非定义你。人是复杂的，类型只是起点。
        </p>
      </div>
    </div>
  )
}
