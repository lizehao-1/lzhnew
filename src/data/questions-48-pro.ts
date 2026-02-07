/**
 * MBTI 标准版题库 - 48题（专业优化版）
 * 基于 Jung 理论和 Myers-Briggs 四维度框架
 * 每个维度 12 题，题目风格参考国际专业测试
 */
import { Question } from './questions'

export const questions48Pro: Question[] = [
  // ========== E/I 外向/内向 维度 (12题) ==========
  // 测量能量来源：从外部世界还是内心世界获取能量
  { id: 1, text: '在社交聚会后，我通常感到精力充沛', example: '参加派对或聚餐后，你是想继续社交还是需要独处恢复？', dimension: 'EI', direction: 'positive' },
  { id: 2, text: '我更喜欢与少数亲密朋友深入交流', example: '比起大型聚会，你更享受和一两个好友的深度对话吗？', dimension: 'EI', direction: 'negative' },
  { id: 3, text: '在小组讨论中，我经常是第一个发言的人', example: '开会或讨论时，你习惯主动分享想法还是先听别人说？', dimension: 'EI', direction: 'positive' },
  { id: 4, text: '我需要独处的时间来整理思绪和恢复精力', example: '忙碌一天后，你更想和朋友出去还是一个人待着？', dimension: 'EI', direction: 'negative' },
  { id: 5, text: '我很容易与刚认识的人展开对话', example: '在新环境中，你会主动和陌生人聊天吗？', dimension: 'EI', direction: 'positive' },
  { id: 6, text: '我倾向于在说话之前先在心里组织好语言', example: '回答问题时，你是脱口而出还是先想好再说？', dimension: 'EI', direction: 'negative' },
  { id: 7, text: '我喜欢成为众人关注的焦点', example: '在聚会上被大家注意，你感到开心还是不自在？', dimension: 'EI', direction: 'positive' },
  { id: 8, text: '我更喜欢通过文字而非电话来沟通', example: '有事要说时，你倾向发消息还是直接打电话？', dimension: 'EI', direction: 'negative' },
  { id: 9, text: '我在热闹的环境中感到舒适和有活力', example: '在嘈杂的咖啡厅或安静的图书馆，你更能集中注意力？', dimension: 'EI', direction: 'positive' },
  { id: 10, text: '我的朋友圈子小但关系深厚', example: '你是有很多朋友但关系一般，还是少数几个知心好友？', dimension: 'EI', direction: 'negative' },
  { id: 11, text: '我喜欢参加各种社交活动和聚会', example: '周末你更想出去参加活动还是在家休息？', dimension: 'EI', direction: 'positive' },
  { id: 12, text: '我在独处时能产生最好的想法', example: '你的创意灵感是在讨论中还是独自思考时产生的？', dimension: 'EI', direction: 'negative' },

  // ========== S/N 感觉/直觉 维度 (12题) ==========
  // 测量信息获取方式：关注具体事实还是抽象可能性
  { id: 13, text: '我更关注事物的具体细节和实际情况', example: '看报告时，你先看具体数据还是整体结论？', dimension: 'SN', direction: 'positive' },
  { id: 14, text: '我经常思考事物背后的深层含义和可能性', example: '看新闻时，你只关注事件本身还是会联想更深的意义？', dimension: 'SN', direction: 'negative' },
  { id: 15, text: '我相信实践经验比理论知识更可靠', example: '学新技能时，你喜欢直接动手还是先学理论？', dimension: 'SN', direction: 'positive' },
  { id: 16, text: '我喜欢探索抽象的概念和理论', example: '你更喜欢讨论具体问题还是抽象的哲学话题？', dimension: 'SN', direction: 'negative' },
  { id: 17, text: '我倾向于使用已经验证有效的方法', example: '做事时你喜欢用熟悉的方法还是尝试新方式？', dimension: 'SN', direction: 'positive' },
  { id: 18, text: '我常常能看到别人忽略的模式和联系', example: '你经常发现看似无关的事物之间的联系吗？', dimension: 'SN', direction: 'negative' },
  { id: 19, text: '我更擅长处理具体、实际的问题', example: '你更擅长解决眼前的具体问题还是规划长远战略？', dimension: 'SN', direction: 'positive' },
  { id: 20, text: '我经常有天马行空的想象和创意', example: '发呆时你的脑子是放空的还是在想各种可能性？', dimension: 'SN', direction: 'negative' },
  { id: 21, text: '我注重当下的体验和感受', example: '旅行时你更享受当下风景还是思考这次经历的意义？', dimension: 'SN', direction: 'positive' },
  { id: 22, text: '我喜欢用比喻和象征来表达想法', example: '解释事情时你喜欢打比方还是直接陈述事实？', dimension: 'SN', direction: 'negative' },
  { id: 23, text: '我更信任有数据和事实支撑的结论', example: '做决定时你更看重数据分析还是直觉判断？', dimension: 'SN', direction: 'positive' },
  { id: 24, text: '我对新奇的想法和未来的可能性感到兴奋', example: '听到一个大胆的新想法，你第一反应是兴奋还是质疑？', dimension: 'SN', direction: 'negative' },

  // ========== T/F 思考/情感 维度 (12题) ==========
  // 测量决策方式：基于逻辑分析还是价值观和感受
  { id: 25, text: '做决定时，我更看重逻辑和客观分析', example: '选择工作时，你更看重薪资待遇还是团队氛围？', dimension: 'TF', direction: 'positive' },
  { id: 26, text: '我很容易感受到他人的情绪变化', example: '朋友心情不好时，你能很快察觉到吗？', dimension: 'TF', direction: 'negative' },
  { id: 27, text: '我认为公平和一致性比照顾个人感受更重要', example: '制定规则时，你更看重公平统一还是灵活照顾？', dimension: 'TF', direction: 'positive' },
  { id: 28, text: '我会优先考虑决定对他人感受的影响', example: '提出批评时，你更关注准确性还是对方的感受？', dimension: 'TF', direction: 'negative' },
  { id: 29, text: '我能够在情感问题上保持客观和理性', example: '和朋友发生争执时，你能冷静分析对错吗？', dimension: 'TF', direction: 'positive' },
  { id: 30, text: '我重视和谐的人际关系，愿意为此妥协', example: '你愿意为了维护关系而放弃自己的立场吗？', dimension: 'TF', direction: 'negative' },
  { id: 31, text: '我更擅长分析问题而非安慰他人', example: '朋友向你倾诉烦恼，你会分析问题还是先安慰？', dimension: 'TF', direction: 'positive' },
  { id: 32, text: '做决定时我会考虑每个相关人的感受', example: '选择聚餐地点时，你会照顾每个人的偏好吗？', dimension: 'TF', direction: 'negative' },
  { id: 33, text: '我认为诚实直接比委婉圆滑更重要', example: '朋友问你意见时，你会说真话还是说好听的？', dimension: 'TF', direction: 'positive' },
  { id: 34, text: '我很难拒绝别人的请求，即使不方便', example: '同事请你帮忙但你很忙，你会直接拒绝吗？', dimension: 'TF', direction: 'negative' },
  { id: 35, text: '我更关注事情的对错而非人们的感受', example: '讨论问题时，你更关注逻辑正确还是大家舒服？', dimension: 'TF', direction: 'positive' },
  { id: 36, text: '我善于调解冲突，让各方都感到满意', example: '两个朋友吵架，你会帮忙分析对错还是调解和好？', dimension: 'TF', direction: 'negative' },

  // ========== J/P 判断/知觉 维度 (12题) ==========
  // 测量生活方式：喜欢计划和确定性还是灵活和开放
  { id: 37, text: '我喜欢提前计划，不喜欢临时变动', example: '周末出游你会提前规划行程还是走到哪算哪？', dimension: 'JP', direction: 'positive' },
  { id: 38, text: '我喜欢保持选择的开放性，不急于做决定', example: '买东西时你会快速决定还是多看看再说？', dimension: 'JP', direction: 'negative' },
  { id: 39, text: '我会按时完成任务，很少拖延', example: '有任务时你会尽早完成还是拖到截止日期前？', dimension: 'JP', direction: 'positive' },
  { id: 40, text: '我在压力和截止日期前反而更有效率', example: '你是提前准备考试还是考前突击效果更好？', dimension: 'JP', direction: 'negative' },
  { id: 41, text: '我的生活和工作空间通常井井有条', example: '你的桌面是整整齐齐还是看起来比较乱？', dimension: 'JP', direction: 'positive' },
  { id: 42, text: '我喜欢随性而为，不喜欢被规则和计划束缚', example: '你喜欢按日程表生活还是觉得那样太无聊？', dimension: 'JP', direction: 'negative' },
  { id: 43, text: '做完决定后，我很少再改变主意', example: '点完餐后你会安心等待还是看到别人的又想换？', dimension: 'JP', direction: 'positive' },
  { id: 44, text: '我喜欢探索各种可能性而非执行既定计划', example: '你更享受制定计划的过程还是按计划执行？', dimension: 'JP', direction: 'negative' },
  { id: 45, text: '我喜欢事情有明确的结论和结果', example: '讨论问题时你希望得出明确结论还是开放讨论？', dimension: 'JP', direction: 'positive' },
  { id: 46, text: '我经常同时进行多个项目或任务', example: '你喜欢专注做完一件事还是同时推进好几件？', dimension: 'JP', direction: 'negative' },
  { id: 47, text: '我喜欢有规律的日常作息和生活节奏', example: '你每天的起床、吃饭时间比较固定吗？', dimension: 'JP', direction: 'positive' },
  { id: 48, text: '我觉得计划赶不上变化，保持灵活更重要', example: '旅行计划被打乱，你会焦虑还是觉得也是一种体验？', dimension: 'JP', direction: 'negative' },
]
