import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

const features = [
  { icon: '🎯', title: '精准题目', desc: '每道题只问一个偏好，配有生活化示例，减少"看起来都对"的模糊感。' },
  { icon: '📊', title: '维度解析', desc: 'E/I、S/N、T/F、J/P 四个维度分别解释你在做什么选择，清晰可理解。' },
  { icon: '💡', title: '可行动建议', desc: '不只是标签，给你可执行的建议：如何协作、如何沟通、如何选环境。' },
]

const dimensions = [
  { left: 'E 外向', right: 'I 内向', desc: '能量来源：从外部世界还是内心世界获取能量' },
  { left: 'S 感觉', right: 'N 直觉', desc: '信息获取：关注具体事实还是可能性和整体图景' },
  { left: 'T 思考', right: 'F 情感', desc: '决策方式：基于逻辑分析还是价值观和感受' },
  { left: 'J 判断', right: 'P 知觉', desc: '生活方式：喜欢计划和确定性还是灵活和开放' },
]

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const [toast, setToast] = useState<string | null>(null)

  // 显示来自其他页面的消息（如充值成功）
  useEffect(() => {
    const state = location.state as { message?: string } | null
    if (state?.message) {
      setToast(state.message)
      // 清除 state 防止刷新后重复显示
      window.history.replaceState({}, document.title)
      // 3秒后自动消失
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16 page-enter">
      {/* Toast 提示 */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium">
            ✓ {toast}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="mbti-pill">📝 48 道精选题目</span>
            <span className="mbti-pill">⏱️ 约 8-10 分钟</span>
            <span className="mbti-pill">💰 ¥1 完整报告</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-display leading-[1.05]">
            把"我是谁"说清楚
          </h1>
          <p className="mt-2 text-xl text-slate-600 sm:text-2xl">
            从一次更像产品的 MBTI 测试开始
          </p>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
            不是鸡汤式的性格标签，而是一份结构化的偏好画像：你如何获取信息、如何做决定、如何补能量、如何安排生活。每道题都有生活化示例，帮你更准确地理解和作答。
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button className="mbti-button-primary text-base" onClick={() => navigate('/test')}>
              🚀 开始测试
            </button>
            <button className="mbti-button-ghost text-sm" onClick={() => navigate('/history')}>
              📋 查询历史
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            完成测试后支付 ¥1 查看完整解析报告（含四维度分析、优势盲点、职业建议、人际关系提示、行动建议）
          </p>
        </div>

        {/* Preview Card */}
        <div className="relative">
          <div className="mbti-card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="text-xs font-semibold text-slate-500">你的结果会长这样</div>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-4xl font-black tracking-tight text-slate-950">INTJ</span>
                  <div className="pb-1">
                    <div className="text-base font-bold text-slate-900">建筑师</div>
                    <div className="text-sm text-slate-500">独立的战略家</div>
                  </div>
                </div>
              </div>
              <span className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">示例</span>
            </div>

            {/* Mini dimension bars */}
            <div className="space-y-3 mb-5">
              {[
                { label: 'E/I', percent: 23, color: 'bg-sky-500' },
                { label: 'S/N', percent: 35, color: 'bg-emerald-500' },
                { label: 'T/F', percent: 78, color: 'bg-orange-500' },
                { label: 'J/P', percent: 65, color: 'bg-purple-500' },
              ].map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-semibold text-slate-500">{d.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.percent}%` }} />
                  </div>
                  <span className="w-8 text-xs text-slate-400">{d.percent}%</span>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                <div className="text-xs font-semibold text-emerald-600 mb-2">💪 核心优势</div>
                <div className="flex flex-wrap gap-1">
                  {['战略思维', '独立自主', '追求卓越'].map((s) => (
                    <span key={s} className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                <div className="text-xs font-semibold text-amber-600 mb-2">🌱 成长空间</div>
                <div className="flex flex-wrap gap-1">
                  {['情感表达', '灵活变通'].map((w) => (
                    <span key={w} className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{w}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="mbti-card p-5">
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="text-sm font-bold text-slate-900 mb-1">{f.title}</div>
            <div className="text-sm leading-relaxed text-slate-600">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* What is MBTI */}
      <section className="mt-12">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mb-4 font-display">什么是 MBTI？</h2>
        <div className="mbti-card p-6">
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            MBTI（Myers-Briggs Type Indicator）是一种性格类型指标，通过四个维度的偏好组合，形成 16 种人格类型。它不是给你贴标签，而是帮你理解自己的思维和行为偏好。
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {dimensions.map((d) => (
              <div key={d.left} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-sky-600">{d.left}</span>
                  <span className="text-slate-300">vs</span>
                  <span className="text-sm font-bold text-orange-500">{d.right}</span>
                </div>
                <p className="text-xs text-slate-500">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="mt-12">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mb-4 font-display">适合你用在哪？</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: '🧠', text: '了解自己在压力/冲突下的默认反应' },
            { icon: '🤝', text: '更高质量地描述"我喜欢怎样的协作方式"' },
            { icon: '⚖️', text: '找到更舒适的工作与关系节奏' },
            { icon: '✨', text: '把优势变成"可被看见的能力"' },
          ].map((item) => (
            <div key={item.text} className="mbti-card p-4 flex items-start gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm text-slate-600">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 mbti-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 font-display">准备好开始了吗？</div>
            <div className="mt-1 text-sm text-slate-600">48 道题，约 10 分钟，拿到你的四字母类型和完整解析。</div>
          </div>
          <button className="mbti-button-primary whitespace-nowrap" onClick={() => navigate('/test')}>
            立即开始 →
          </button>
        </div>
      </section>

      {/* Footer note */}
      <div className="mt-8 text-center text-xs text-slate-400">
        MBTI 是一种性格偏好工具，帮助你更好地了解自己，而非定义你。
      </div>
    </div>
  )
}
