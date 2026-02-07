import TestHub from './TestHub'
import { useI18n } from '../i18n'

export default function SJT() {
  const { t } = useI18n()
  return (
    <TestHub
      titleKey="sjt_title"
      introKey="sjt_intro"
      tests={[
        {
          key: 'sjt-work',
          title: t('sjt_work_title'),
          desc: t('sjt_work_desc'),
          detail: t('sjt_work_detail'),
          action: () => window.alert(t('home_coming_soon')),
        },
        {
          key: 'sjt-case',
          title: t('sjt_case_title'),
          desc: t('sjt_case_desc'),
          detail: t('sjt_case_detail'),
          action: () => window.alert(t('home_coming_soon')),
        },
      ]}
    />
  )
}
