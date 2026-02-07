import TestHub from './TestHub'
import { useI18n } from '../i18n'

export default function Big5() {
  const { t } = useI18n()
  return (
    <TestHub
      titleKey="big5_title"
      introKey="big5_intro"
      tests={[
        {
          key: 'big5-core',
          title: t('big5_core_title'),
          desc: t('big5_core_desc'),
          detail: t('big5_core_detail'),
          action: () => window.alert(t('home_coming_soon')),
        },
        {
          key: 'big5-work',
          title: t('big5_work_title'),
          desc: t('big5_work_desc'),
          detail: t('big5_work_detail'),
          action: () => window.alert(t('home_coming_soon')),
        },
      ]}
    />
  )
}
