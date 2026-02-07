import { createContext, useContext, useMemo, useState, ReactNode } from 'react'

type Locale = 'zh' | 'en'

type Messages = {
  [key: string]: { zh: string; en: string }
}

const MESSAGES: Messages = {
  brand_title: { zh: 'LZH 面试辅导', en: 'LZH Interview Coach' },
  brand_subtitle: { zh: '多维测评与表达训练', en: 'Multi-tests + Coaching' },
  nav_start: { zh: '开始测试', en: 'Start Test' },
  nav_home: { zh: '首页', en: 'Home' },
  nav_test: { zh: '测试', en: 'Test' },
  nav_login: { zh: '登录', en: 'Sign In' },
  nav_history: { zh: '历史记录', en: 'History' },
  nav_recharge: { zh: '积分充值', en: 'Recharge' },
  nav_logout: { zh: '退出登录', en: 'Sign Out' },
  footer_disclaimer: { zh: '免责声明：所有测评仅作参考，不代表能力高低；请理性看待结果。', en: 'Disclaimer: Tests are for reference only and not measures of ability.' },

  home_badge_1: { zh: '面试/行测辅助平台', en: 'Interview & Exam Helper' },
  home_badge_2: { zh: '人格 + 职业 + 认知', en: 'Personality + Career + Cognition' },
  home_badge_3: { zh: '持续更新题库', en: 'Continuously updated' },
  home_title: { zh: '把自己“讲清楚”的测评平台', en: 'A test platform that clarifies you' },
  home_subtitle: { zh: '先建立画像，再把优势变成面试表达', en: 'Build a profile, then turn it into answers' },
  home_intro: { zh: '从多个维度建立你的性格与职业画像，自动生成面试表达框架、岗位匹配点与改进建议。MBTI 已上线，其它测试陆续开放。', en: 'Build a multi-angle personality and career profile, then convert it into interview-ready stories, fit points, and improvement advice. MBTI is live; more tests are coming.' },
  home_cta_primary: { zh: '先测 MBTI', en: 'Start with MBTI' },
  home_cta_secondary: { zh: '查询历史', en: 'View History' },
  home_note: { zh: '先用 MBTI 建立画像，随后补充职业兴趣与情境判断测试', en: 'Start with MBTI, then add career interest and situational judgement tests.' },

  home_preview_label: { zh: '系统输出示例', en: 'Sample output' },
  home_preview_sample: { zh: '预览', en: 'Preview' },
  home_preview_title: { zh: '面试表达画像', en: 'Interview expression profile' },
  home_preview_subtitle: { zh: '强调你的匹配点与优势', en: 'Highlight your fit and strengths' },
  home_preview_metric_1: { zh: '匹配度', en: 'Fit' },
  home_preview_metric_2: { zh: '表达力', en: 'Clarity' },
  home_preview_metric_3: { zh: '稳定性', en: 'Consistency' },
  home_preview_focus: { zh: '强调点', en: 'Key points' },
  home_preview_focus_items: { zh: '逻辑清晰、执行力、抗压', en: 'Logic、Execution、Resilience' },
  home_preview_action: { zh: '下一步建议', en: 'Next steps' },
  home_preview_action_items: { zh: '补充案例、整理STAR、模拟答题', en: 'Add cases、STAR practice、Mock answers' },

  home_tests_title: { zh: '测试入口', en: 'Test catalog' },
  home_tests_sub: { zh: '组合多类测评，形成“可表达”的职业画像', en: 'Combine tests to form an interview-ready profile.' },
  home_tests_hint: { zh: '更多测试持续更新', en: 'More tests coming soon' },
  home_test_status_live: { zh: '已上线', en: 'Live' },
  home_test_status_soon: { zh: '内测中', en: 'Coming' },
  home_test_soon_cta: { zh: '即将开放', en: 'Coming soon' },
  home_coming_soon: { zh: '该测试即将开放', en: 'This test is coming soon' },

  home_test_mbti_title: { zh: 'MBTI 人格偏好', en: 'MBTI Preferences' },
  home_test_mbti_desc: { zh: '建立你的偏好画像，作为表达与岗位匹配的起点。', en: 'Build your preference profile as a foundation for interview narratives.' },
  home_test_mbti_tag: { zh: '基础画像', en: 'Core' },
  home_test_mbti_meta: { zh: '约 8-10 分钟 · ¥1 报告', en: '8–10 min · ¥1 report' },
  home_test_mbti_cta: { zh: '开始测试', en: 'Start' },

  home_test_big5_title: { zh: 'Big Five 性格维度', en: 'Big Five Traits' },
  home_test_big5_desc: { zh: '衡量稳定性、尽责性、外向性等五维度表现。', en: 'Measure OCEAN traits for a deeper profile.' },
  home_test_big5_tag: { zh: '进阶画像', en: 'Advanced' },
  home_test_big5_meta: { zh: '约 10-12 分钟', en: '10–12 min' },

  home_test_riasec_title: { zh: 'RIASEC 职业兴趣', en: 'RIASEC Interests' },
  home_test_riasec_desc: { zh: '找出与你最匹配的职业兴趣类型。', en: 'Identify career interest types that fit you.' },
  home_test_riasec_tag: { zh: '职业方向', en: 'Career fit' },
  home_test_riasec_meta: { zh: '约 8 分钟', en: 'About 8 min' },

  home_test_sjt_title: { zh: '情境判断 SJT', en: 'Situational Judgement' },
  home_test_sjt_desc: { zh: '用真实场景题预测你的处置方式与风险点。', en: 'Scenario-based questions to simulate decisions.' },
  home_test_sjt_tag: { zh: '面试模拟', en: 'Interview' },
  home_test_sjt_meta: { zh: '约 10 分钟', en: 'About 10 min' },

  home_test_visual_title: { zh: '视觉偏好选择', en: 'Visual Preference' },
  home_test_visual_desc: { zh: '图片选择题，探索偏好与情绪反应模式。', en: 'Image-based choices to explore preferences.' },
  home_test_visual_tag: { zh: '图片题', en: 'Visual' },
  home_test_visual_meta: { zh: '约 5-8 分钟', en: '5–8 min' },

  home_highlight_1_title: { zh: '把测评变成表达素材', en: 'Turn tests into answers' },
  home_highlight_1_desc: { zh: '每份测评输出面试可复用的描述与案例框架。', en: 'Each report outputs interview-ready narratives.' },
  home_highlight_2_title: { zh: '岗位匹配与风险提示', en: 'Fit & risk hints' },
  home_highlight_2_desc: { zh: '告诉你哪些能力点需要补证据或避坑。', en: 'Highlights gaps that need proof or mitigation.' },
  home_highlight_3_title: { zh: '逐步建立职业画像', en: 'Build a career profile' },
  home_highlight_3_desc: { zh: '从 MBTI 开始，逐步补齐兴趣、行为与情境决策。', en: 'Start with MBTI and add interests and judgement.' },

  home_steps_title: { zh: '如何使用', en: 'How it works' },
  home_steps_label: { zh: '步骤 {n}', en: 'Step {n}' },
  home_step_1_title: { zh: '完成测评', en: 'Complete tests' },
  home_step_1_desc: { zh: '先做 MBTI，再补职业兴趣与情境判断。', en: 'Start with MBTI, then add interests and SJT.' },
  home_step_2_title: { zh: '生成画像', en: 'Generate profile' },
  home_step_2_desc: { zh: '系统自动汇总成可用的面试表达框架。', en: 'We turn results into interview-ready narratives.' },
  home_step_3_title: { zh: '面试辅导', en: 'Coach & improve' },
  home_step_3_desc: { zh: '补案例、修表达、练高频问题与场景。', en: 'Refine stories and practice high-frequency prompts.' },

  home_section_cta: { zh: '先从 MBTI 开始', en: 'Start with MBTI' },
  home_section_cta_sub: { zh: '约 8-10 分钟，拿到第一份面试画像。', en: '8–10 minutes to get your first interview profile.' },

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
  test_finishing: { zh: '正在跳转到支付页面...', en: 'Redirecting to payment...' },

  opt_strong_agree: { zh: '非常同意', en: 'Strongly agree' },
  opt_agree: { zh: '比较同意', en: 'Agree' },
  opt_neutral: { zh: '中立', en: 'Neutral' },
  opt_disagree: { zh: '比较不同意', en: 'Disagree' },
  opt_strong_disagree: { zh: '非常不同意', en: 'Strongly disagree' },

  login_invalid_phone: { zh: '请输入正确的手机号', en: 'Invalid phone number' },
  login_invalid_pin: { zh: '请输入 4 位数字密码', en: 'PIN must be 4 digits' },
  login_wrong_pin: { zh: '密码错误', en: 'Incorrect PIN' },
  login_failed: { zh: '登录失败，请重试', en: 'Login failed. Please try again.' },
  login_not_found: { zh: '账号不存在，请先完成测试', en: 'Account not found. Please finish a test first.' },
  login_loading: { zh: '登录中...', en: 'Signing in...' },
  login_tip: { zh: '完成测试后自动创建账号', en: 'Account will be created after the test.' },

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
