import { useState } from 'react'

type Props = {
  text: string
  label: string
  copiedLabel: string
}

export default function CopyButton({ text, label, copiedLabel }: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1200)
      } finally {
        document.body.removeChild(ta)
      }
    }
  }

  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 shadow-[0_10px_22px_rgba(2,6,23,0.08)] hover:-translate-y-[1px]"
      onClick={copy}
    >
      {copied ? copiedLabel : label}
    </button>
  )
}

