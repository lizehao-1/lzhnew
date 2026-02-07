import { useI18n } from '../i18n'
import { useNavigate } from 'react-router-dom'

type TestMeta = {
  key: string
  title: string
  desc: string
  detail: string
  action: () => void
}

export default function TestHub({
  titleKey,
  introKey,
  tests,
}: {
  titleKey: string
  introKey: string
  tests: TestMeta[]
}) {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 page-enter">
      <div className="mbti-card p-6 sm:p-8">
        <div className="text-xs font-semibold text-slate-500">{t('test_hub_badge')}</div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-950 font-display">
          {t(titleKey as never)}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          {t(introKey as never)}
        </p>
        <div className="mt-4">
          <button className="mbti-button-ghost text-sm" onClick={() => navigate('/')}>
            {t('back_home')}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {tests.map((item) => (
          <div key={item.key} className="mbti-card p-5 flex flex-col gap-3">
            <div className="text-lg font-bold text-slate-900">{item.title}</div>
            <div className="text-sm text-slate-600">{item.desc}</div>
            <div className="text-xs text-slate-500">{item.detail}</div>
            <div>
              <button className="mbti-button-primary text-sm" onClick={item.action}>
                {t('test_hub_cta')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
