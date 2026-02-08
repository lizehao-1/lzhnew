import { ReactNode, useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import CopyButton from './CopyButton'

type Tone = 'neutral' | 'good' | 'warn'

type Props = {
  title: string
  subtitle?: string
  tone?: Tone
  defaultOpen?: boolean
  right?: ReactNode
  children: ReactNode
}

function toneStyles(tone: Tone) {
  if (tone === 'good') {
    return {
      border: 'border-emerald-200/60',
      bg: 'bg-emerald-50/40',
      title: 'text-emerald-900',
      sub: 'text-emerald-700',
    }
  }
  if (tone === 'warn') {
    return {
      border: 'border-amber-200/60',
      bg: 'bg-amber-50/40',
      title: 'text-amber-900',
      sub: 'text-amber-700',
    }
  }
  return {
    border: 'border-slate-200/60',
    bg: 'bg-white/70',
    title: 'text-slate-900',
    sub: 'text-slate-600',
  }
}

export function ReportSection({ title, subtitle, tone = 'neutral', defaultOpen = true, right, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const s = useMemo(() => toneStyles(tone), [tone])
  const { t } = useI18n()

  return (
    <section className={`rounded-3xl border ${s.border} ${s.bg} p-5 sm:p-6`}>
      <header className="flex items-start justify-between gap-4">
        <button type="button" className="text-left" onClick={() => setOpen((v) => !v)}>
          <div className={`text-sm sm:text-base font-black tracking-tight ${s.title}`}>{title}</div>
          {subtitle ? <div className={`mt-1 text-xs sm:text-sm ${s.sub}`}>{subtitle}</div> : null}
        </button>
        <div className="flex items-center gap-2">
          {right}
          <button
            type="button"
            className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_10px_22px_rgba(2,6,23,0.08)] hover:-translate-y-[1px]"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? t('hide') : t('show')}
          </button>
        </div>
      </header>
      <div
        className={`transition-all duration-300 ${open ? 'mt-4 opacity-100' : 'mt-0 opacity-0 pointer-events-none'}`}
        style={{ maxHeight: open ? 2000 : 0, overflow: 'hidden' }}
      >
        {children}
      </div>
    </section>
  )
}

type TemplateCardProps = {
  title: string
  body: string
}

export function TemplateCard({ title, body }: TemplateCardProps) {
  const { t } = useI18n()

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-semibold text-slate-600">{title}</div>
        <CopyButton text={body} label={t('copy')} copiedLabel={t('copied')} />
      </div>
      <pre className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{body}</pre>
    </div>
  )
}

