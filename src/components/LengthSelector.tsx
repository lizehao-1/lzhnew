import { QuizLength } from '../tests/types'
import { useI18n } from '../i18n'

export type LengthOption = {
  id: QuizLength
  title: string
  desc: string
  meta: string
  recommended?: boolean
}

export default function LengthSelector({
  title,
  subtitle,
  options,
  onSelect,
}: {
  title: string
  subtitle: string
  options: LengthOption[]
  onSelect: (id: QuizLength) => void
}) {
  const { t } = useI18n()

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 page-enter">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-display">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="grid gap-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className="mbti-card p-5 text-left hover:border-slate-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-black text-slate-950">{opt.title}</span>
                  <span className="text-xs text-slate-400">{opt.meta}</span>
                  {opt.recommended && (
                    <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                      {t('test_recommended')}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">{opt.desc}</p>
              </div>
              <span className="text-slate-300 group-hover:text-slate-500 transition-colors">?</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
