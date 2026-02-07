import { createContext, useContext, useMemo, useState, ReactNode } from 'react'

type Locale = 'zh' | 'en'

type Messages = {
  [key: string]: { zh: string; en: string }
}

const MESSAGES: Messages = {
  brand_title: { zh: 'MBTI 测试', en: 'MBTI Test' },
  brand_subtitle: { zh: '专业人格测试', en: 'Personality Insights' },
  nav_start: { zh: '开始测试', en: 'Start Test' },
  nav_home: { zh: '首页', en: 'Home' },
  nav_test: { zh: '测试', en: 'Test' },
  nav_login: { zh: '登录', en: 'Sign In' },
  nav_history: { zh: '历史记录', en: 'History' },
  nav_recharge: { zh: '积分充值', en: 'Recharge' },
  nav_logout: { zh: '退出登录', en: 'Sign Out' },
  footer_disclaimer: { zh: '免责声明：MBTI 为性格偏好参考工具，不代表能力高低；请理性看待测试结果。', en: 'Disclaimer: MBTI is a preference reference, not a measure of ability. Interpret results thoughtfully.' },

  home_badge_1: { zh: '48 道精选题目', en: '48 curated questions' },
  home_badge_2: { zh: '约 8-10 分钟', en: '8–10 minutes' },
  home_badge_3: { zh: '￥1 完整报告', en: '￥1 full report' },
  home_title: { zh: '把“我是谁”说清楚', en: 'Explain who you are, clearly' },
  home_subtitle: { zh: '从一份更像产品的 MBTI 测试开始', en: 'Start with an MBTI test that feels like a product' },
  home_intro: { zh: '不是鸡汤式的性格标签，而是一份结构化的偏好画像：你如何获取信息、如何做决定、如何补能量、如何安排生活。每道题都有生活化示例，帮你更准确地理解和作答。', en: 'Not feel-good labels, but a structured preference map: how you take in information, decide, recharge, and organize life. Each question includes grounded examples for clearer answers.' },
  home_cta_primary: { zh: '开始测试', en: 'Start Test' },
  home_cta_secondary: { zh: '查询历史', en: 'View History' },
  home_note: { zh: '完成测试后支付 ￥1 查看完整解析报告（含四维度分析、优势亮点、职业建议、人际关系提示、行动建议）', en: 'After the test, pay ￥1 to unlock the full report (dimensions, strengths, career tips, relationships, and actions).' },

  home_preview_label: { zh: '你的结果会长这样', en: 'Your result will look like this' },
  home_preview_sample: { zh: '示例', en: 'Sample' },
  home_preview_title: { zh: '建筑师', en: 'Architect' },
  home_preview_subtitle: { zh: '独立的战略家', en: 'Independent strategist' },
  home_strengths: { zh: '核心优势', en: 'Core strengths' },
  home_growth: { zh: '成长空间', en: 'Growth areas' },

  home_section_what: { zh: '什么是 MBTI？', en: 'What is MBTI?' },
  home_section_use: { zh: '适合你用在哪？', en: 'Where can you use it?' },
  home_section_cta: { zh: '准备好开始了吗？', en: 'Ready to begin?' },
  home_section_cta_sub: { zh: '48 道题，约 10 分钟，拿到你的四字母类型和完整解析。', en: '48 questions, about 10 minutes, get your type and full analysis.' },

  feature_1_title: { zh: '精准题目', en: 'Focused questions' },
  feature_1_desc: { zh: '每道题只问一个偏好，配有生活化示例，减少“看起来都对”的模糊感。', en: 'Each question targets one preference with real-life examples to reduce ambiguity.' },
  feature_2_title: { zh: '维度解析', en: 'Dimension insights' },
  feature_2_desc: { zh: 'E/I、S/N、T/F、J/P 四个维度分别解释你的选择，清晰可理解。', en: 'Clear explanations for E/I, S/N, T/F, J/P and what your choices mean.' },
  feature_3_title: { zh: '可行动建议', en: 'Actionable tips' },
  feature_3_desc: { zh: '不仅是标签，给你可执行建议：如何协作、如何沟通、如何选环境。', en: 'Beyond labels: practical guidance for collaboration, communication, and environments.' },

  dim_e: { zh: 'E 外向', en: 'E Extraversion' },
  dim_i: { zh: 'I 内向', en: 'I Introversion' },
  dim_s: { zh: 'S 感觉', en: 'S Sensing' },
  dim_n: { zh: 'N 直觉', en: 'N Intuition' },
  dim_t: { zh: 'T 思考', en: 'T Thinking' },
  dim_f: { zh: 'F 情感', en: 'F Feeling' },
  dim_j: { zh: 'J 判断', en: 'J Judging' },
  dim_p: { zh: 'P 知觉', en: 'P Perceiving' },
  dim_ei_desc: { zh: '能量来源：从外部世界还是内心世界获取能量', en: 'Energy source: outer world vs inner world' },
  dim_sn_desc: { zh: '信息获取：关注具体事实还是可能性与整体图景', en: 'Information: concrete facts vs possibilities and patterns' },
  dim_tf_desc: { zh: '决策方式：基于逻辑分析还是价值观与感受', en: 'Decisions: logic and analysis vs values and feelings' },
  dim_jp_desc: { zh: '生活方式：喜欢计划与确定性还是灵活与开放', en: 'Lifestyle: structured plans vs flexibility and openness' },

  usecase_1: { zh: '了解自己在压力/冲突下的默认反应', en: 'Understand default responses under stress or conflict' },
  usecase_2: { zh: '更清楚地表达你喜欢的合作方式', en: 'Explain your preferred way of working with others' },
  usecase_3: { zh: '找到更舒适的工作与关系节奏', en: 'Find a healthier pace for work and relationships' },
  usecase_4: { zh: '把优势变成可被看见的能力', en: 'Turn strengths into visible capabilities' },

  history_title: { zh: '查询历史记录', en: 'Check History' },
  history_sub: { zh: '输入手机号和密码查看之前的测试结果', en: 'Enter phone and PIN to view previous results' },
  history_phone_ph: { zh: '请输入手机号', en: 'Enter phone number' },
  history_pin_ph: { zh: '请输入 4 位数字密码', en: 'Enter 4-digit PIN' },
  history_btn: { zh: '查询', en: 'Search' },
  history_notfound_title: { zh: '未找到记录', en: 'No records found' },
  history_notfound_desc: { zh: '该手机号暂无测试记录', en: 'No test records for this phone' },
  history_remaining: { zh: '剩余查看次数', en: 'Remaining views' },
  history_found: { zh: '找到 {count} 条记录', en: '{count} record(s) found' },
  history_need_pay: { zh: '需支付', en: 'Payment required' },
  history_can_view: { zh: '可查看', en: 'Viewable' },
  history_viewed: { zh: '已查看', en: 'Viewed' },
  history_no_credit: { zh: '积分不足，无法查看完整报告', en: 'Insufficient credits to view full report' },
  history_go_recharge: { zh: '去充值 →', en: 'Recharge →' },
  back_home: { zh: '返回首页', en: 'Back to Home' },

  err_phone_required: { zh: '请输入手机号', en: 'Phone is required' },
  err_phone_invalid: { zh: '请输入正确的手机号', en: 'Invalid phone number' },
  err_pin_required: { zh: '请输入密码', en: 'PIN is required' },
  err_pin_invalid: { zh: '密码必须是 4 位数字', en: 'PIN must be 4 digits' },
  err_pin_wrong: { zh: 'PIN 错误', en: 'Incorrect PIN' },
  err_query_failed: { zh: '查询失败，请重试', en: 'Query failed. Please try again.' },
  err_action_failed: { zh: '操作失败，请重试', en: 'Action failed. Please try again.' },
  err_login_first: { zh: '请先登录', en: 'Please sign in first' },
  err_order_failed: { zh: '创建订单失败', en: 'Failed to create order' },
  loading: { zh: '查询中...', en: 'Loading...' },
  unknown_type: { zh: '未知类型', en: 'Unknown type' },
  set_quick: { zh: '快速版', en: 'Quick' },
  set_full: { zh: '完整版', en: 'Full' },
  set_standard: { zh: '标准版', en: 'Standard' },

  recharge_title: { zh: '积分充值', en: 'Recharge Credits' },
  recharge_sub: { zh: '购买查看次数，解锁完整人格报告', en: 'Purchase views to unlock the full report' },
  recharge_login_tip: { zh: '请先登录后再充值', en: 'Please sign in before recharging' },
  recharge_back_login: { zh: '返回首页登录 →', en: 'Back to Home →' },
  recharge_current: { zh: '当前剩余', en: 'Current balance' },
  recharge_pay: { zh: '支付', en: 'Pay' },
  recharge_open: { zh: '打开支付', en: 'Open payment' },
  recharge_paid: { zh: '我已支付', en: 'I have paid' },
  recharge_wait: { zh: '正在确认支付...', en: 'Confirming payment...' },
  recharge_timeout: { zh: '支付超时，请刷新页面重试或联系客服', en: 'Payment timeout. Please refresh and retry.' },
  recharge_success: { zh: '充值成功！获得 {credits} 次查看机会', en: 'Recharge success! Added {credits} views' },
  recharge_auto: { zh: '确认后自动跳转', en: 'Auto redirect after confirmation' },
  recharge_cancel_wait: { zh: '取消等待，返回支付', en: 'Cancel and go back' },

  pkg_single: { zh: '单次购买', en: 'Single purchase' },
  pkg_multi: { zh: '多次使用', en: 'Multi-use' },
  pkg_long: { zh: '长期使用', en: 'Long-term' },
  views_label: { zh: '次查看机会', en: 'views' },
  recommended: { zh: '推荐', en: 'Recommended' },
  creating_order: { zh: '创建订单中...', en: 'Creating order...' },
  scan_pay: { zh: '扫码支付', en: 'Scan to pay' },
  click_to_pay: { zh: '点击下方按钮打开支付', en: 'Click below to pay' },
  recharge_view_times: { zh: '充值 {credits} 次查看机会', en: 'Recharge {credits} views' },
  order_no: { zh: '订单号', en: 'Order' },

  payment_title: { zh: '支付解锁', en: 'Unlock Report' },
  payment_sub: { zh: '支付后可随时查看历史记录', en: 'After payment, you can view history anytime' },
  payment_start: { zh: '创建订单', en: 'Create order' },
  payment_cancel: { zh: '暂不支付，返回首页', en: 'Not now, back to Home' },

  admin_title: { zh: 'Admin - 用户', en: 'Admin - Users' },
  admin_sub: { zh: '查询用户并查看积分', en: 'Search users and check credits' },
  admin_key_ph: { zh: 'Admin key', en: 'Admin key' },
  admin_phone_ph: { zh: '手机号（可选）', en: 'Phone (optional)' },
  admin_query: { zh: '查询', en: 'Query' },
  admin_no_results: { zh: '无结果', en: 'No results' },
  admin_pin: { zh: 'PIN', en: 'PIN' },
  admin_updated: { zh: '更新时间', en: 'Updated' },
  admin_created: { zh: '创建时间', en: 'Created' },
  admin_credits: { zh: '积分', en: 'Credits' },
  admin_last_result: { zh: '最近结果', en: 'Last result' },

  test_select_title: { zh: '选择测试版本', en: 'Choose test version' },
  test_select_sub: { zh: '题目越多结果越准确，但需要更多时间', en: 'More questions yield higher accuracy but take longer' },
  test_question_unit: { zh: '题', en: 'questions' },
  test_recommended: { zh: '推荐', en: 'Recommended' },
  test_loading: { zh: '加载题目中...', en: 'Loading questions...' },
  test_progress: { zh: '第 {current} / {total} 题', en: 'Question {current} / {total}' },
  test_example: { zh: '示例：', en: 'Example: ' },
  test_prev: { zh: '← 上一题', en: '← Previous' },
  test_exit: { zh: '退出', en: 'Exit' },
  opt_strong_agree: { zh: '非常同意', en: 'Strongly agree' },
  opt_agree: { zh: '比较同意', en: 'Agree' },
  opt_neutral: { zh: '中立', en: 'Neutral' },
  opt_disagree: { zh: '比较不同意', en: 'Disagree' },
  opt_strong_disagree: { zh: '非常不同意', en: 'Strongly disagree' },

  lang_label: { zh: '中文 / English', en: '中文 / English' }
}

type MessageKey = keyof typeof MESSAGES

type I18nValue = {
  locale: Locale
  setLocale: (next: Locale) => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue>({
  locale: 'zh',
  setLocale: () => {},
  t: () => ''
})

function format(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('mbti_locale')
    return saved === 'en' ? 'en' : 'zh'
  })

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    localStorage.setItem('mbti_locale', next)
    document.documentElement.lang = next === 'en' ? 'en' : 'zh-CN'
  }

  const value = useMemo(() => {
    const t = (key: MessageKey, vars?: Record<string, string | number>) => {
      const msg = MESSAGES[key]
      if (!msg) return String(key)
      const raw = msg[locale] || msg.zh
      return format(raw, vars)
    }
    return { locale, setLocale, t }
  }, [locale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
