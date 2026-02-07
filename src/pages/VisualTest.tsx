import { useI18n } from '../i18n'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const OPTIONS = [
  { id: 'a', src: '/images/tests/visual.jpg' },
  { id: 'b', src: '/images/tests/riasec.jpg' },
  { id: 'c', src: '/images/tests/sjt.jpg' },
  { id: 'd', src: '/images/tests/big5.jpg' },
]

export default function VisualTest() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 page-enter">
      <div className="mbti-card p-6 sm:p-8">
        <div className="text-xs font-semibold text-slate-500">{t('visual_badge')}</div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-950 font-display">
          {t('visual_title')}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          {t('visual_intro')}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={`visual-card ${selected === opt.id ? 'visual-card--active' : ''}`}
          >
            <img src={opt.src} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button className="mbti-button-primary text-sm" onClick={() => window.alert(t('home_coming_soon'))}>
          {t('visual_cta')}
        </button>
        <button className="mbti-button-ghost text-sm" onClick={() => navigate('/')}>
          {t('back_home')}
        </button>
        {selected && <span className="text-xs text-slate-500">{t('visual_selected')}</span>}
      </div>
    </div>
  )
}
