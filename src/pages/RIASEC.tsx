import TestHub from './TestHub'
import { useI18n } from '../i18n'

export default function RIASEC() {
  const { t } = useI18n()
  return (
    <TestHub
      titleKey="riasec_title"
      introKey="riasec_intro"
      tests={[
        {
          key: 'riasec-quick',
          title: t('riasec_quick_title'),
          desc: t('riasec_quick_desc'),
          detail: t('riasec_quick_detail'),
          action: () => window.alert(t('home_coming_soon')),
        },
        {
          key: 'riasec-deep',
          title: t('riasec_deep_title'),
          desc: t('riasec_deep_desc'),
          detail: t('riasec_deep_detail'),
          action: () => window.alert(t('home_coming_soon')),
        },
      ]}
    />
  )
}
