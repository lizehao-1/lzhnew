/**
 * MBTI 快速版题库 - 28题
 * 每个维度 7 题，精选最具区分度的题目
 */
import { Question } from './questions'

export const questions28: Question[] = [
  // ========== E/I 外向/内向 (7题) ==========
  { id: 1, text: '在社交聚会后，我通常感到精力充沛', example: '参加派对后，你想继续社交还是需要独处恢复？', dimension: 'EI', direction: 'positive' },
  { id: 2, text: '我更喜欢与少数亲密朋友深入交流', example: '比起大型聚会，你更享受和好友的深度对话吗？', dimension: 'EI', direction: 'negative' },
  { id: 3, text: '在小组讨论中，我经常是第一个发言的人', example: '开会时你习惯主动分享想法还是先听别人说？', dimension: 'EI', direction: 'positive' },
  { id: 4, text: '我需要独处的时间来整理思绪和恢复精力', example: '忙碌一天后，你更想和朋友出去还是一个人待着？', dimension: 'EI', direction: 'negative' },
  { id: 5, text: '我很容易与刚认识的人展开对话', example: '在新环境中，你会主动和陌生人聊天吗？', dimension: 'EI', direction: 'positive' },
  { id: 6, text: '我倾向于在说话之前先在心里组织好语言', example: '回答问题时，你是脱口而出还是先想好再说？', dimension: 'EI', direction: 'negative' },
  { id: 7, text: '我在热闹的环境中感到舒适和有活力', example: '在嘈杂的咖啡厅还是安静的图书馆更能集中注意力？', dimension: 'EI', direction: 'positive' },

  // ========== S/N 感觉/直觉 (7题) ==========
  { id: 8, text: '我更关注事物的具体细节和实际情况', example: '看报告时，你先看具体数据还是整体结论？', dimension: 'SN', direction: 'positive' },
  { id: 9, text: '我经常思考事物背后的深层含义和可能性', example: '看新闻时，你只关注事件还是会联想更深的意义？', dimension: 'SN', direction: 'negative' },
  { id: 10, text: '我相信实践经验比理论知识更可靠', example: '学新技能时，你喜欢直接动手还是先学理论？', dimension: 'SN', direction: 'positive' },
  { id: 11, text: '我喜欢探索抽象的概念和理论', example: '你更喜欢讨论具体问题还是抽象的哲学话题？', dimension: 'SN', direction: 'negative' },
  { id: 12, text: '我倾向于使用已经验证有效的方法', example: '做事时你喜欢用熟悉的方法还是尝试新方式？', dimension: 'SN', direction: 'positive' },
  { id: 13, text: '我经常有天马行空的想象和创意', example: '发呆时你的脑子是放空的还是在想各种可能性？', dimension: 'SN', direction: 'negative' },
  { id: 14, text: '我更信任有数据和事实支撑的结论', example: '做决定时你更看重数据分析还是直觉判断？', dimension: 'SN', direction: 'positive' },

  // ========== T/F 思考/情感 (7题) ==========
  { id: 15, text: '做决定时，我更看重逻辑和客观分析', example: '选择工作时，你更看重薪资待遇还是团队氛围？', dimension: 'TF', direction: 'positive' },
  { id: 16, text: '我很容易感受到他人的情绪变化', example: '朋友心情不好时，你能很快察觉到吗？', dimension: 'TF', direction: 'negative' },
  { id: 17, text: '我认为公平和一致性比照顾个人感受更重要', example: '制定规则时，你更看重公平统一还是灵活照顾？', dimension: 'TF', direction: 'positive' },
  { id: 18, text: '我会优先考虑决定对他人感受的影响', example: '提出批评时，你更关注准确性还是对方的感受？', dimension: 'TF', direction: 'negative' },
  { id: 19, text: '我能够在情感问题上保持客观和理性', example: '和朋友发生争执时，你能冷静分析对错吗？', dimension: 'TF', direction: 'positive' },
  { id: 20, text: '我重视和谐的人际关系，愿意为此妥协', example: '你愿意为了维护关系而放弃自己的立场吗？', dimension: 'TF', direction: 'negative' },
  { id: 21, text: '我认为诚实直接比委婉圆滑更重要', example: '朋友问你意见时，你会说真话还是说好听的？', dimension: 'TF', direction: 'positive' },

  // ========== J/P 判断/知觉 (7题) ==========
  { id: 22, text: '我喜欢提前计划，不喜欢临时变动', example: '周末出游你会提前规划行程还是走到哪算哪？', dimension: 'JP', direction: 'positive' },
  { id: 23, text: '我喜欢保持选择的开放性，不急于做决定', example: '买东西时你会快速决定还是多看看再说？', dimension: 'JP', direction: 'negative' },
  { id: 24, text: '我会按时完成任务，很少拖延', example: '有任务时你会尽早完成还是拖到截止日期前？', dimension: 'JP', direction: 'positive' },
  { id: 25, text: '我在压力和截止日期前反而更有效率', example: '你是提前准备考试还是考前突击效果更好？', dimension: 'JP', direction: 'negative' },
  { id: 26, text: '我的生活和工作空间通常井井有条', example: '你的桌面是整整齐齐还是看起来比较乱？', dimension: 'JP', direction: 'positive' },
  { id: 27, text: '我喜欢随性而为，不喜欢被规则和计划束缚', example: '你喜欢按日程表生活还是觉得那样太无聊？', dimension: 'JP', direction: 'negative' },
  { id: 28, text: '我喜欢事情有明确的结论和结果', example: '讨论问题时你希望得出明确结论还是开放讨论？', dimension: 'JP', direction: 'positive' },
]
