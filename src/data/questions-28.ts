/**
 * MBTI 精简版题库 - 28题
 * 每个维度 7 题，快速测试
 */
import { Question } from './questions'

export const questions28: Question[] = [
  // E/I 维度 (7题)
  { id: 1, text: '参加聚会后，我感到精力充沛而非疲惫', example: '周末聚会后，你想继续下一场还是回家独处？', dimension: 'EI', direction: 'positive' },
  { id: 2, text: '我更喜欢一对一的深度交流', example: '你更享受单独喝咖啡聊天还是一群人聚餐？', dimension: 'EI', direction: 'negative' },
  { id: 3, text: '在团队中，我通常主动发言', example: '开会时你经常第一个分享想法吗？', dimension: 'EI', direction: 'positive' },
  { id: 4, text: '独处时我能获得最好的灵感', example: '好点子是讨论中产生还是独处时冒出来？', dimension: 'EI', direction: 'negative' },
  { id: 5, text: '我很容易和陌生人打开话题', example: '电梯里遇到邻居会主动聊几句吗？', dimension: 'EI', direction: 'positive' },
  { id: 6, text: '我需要安静环境才能集中注意力', example: '工作时喜欢戴耳机隔绝外界吗？', dimension: 'EI', direction: 'negative' },
  { id: 7, text: '我在人群中感到自在放松', example: '在热闹商场你感到兴奋还是想逃离？', dimension: 'EI', direction: 'positive' },

  // S/N 维度 (7题)
  { id: 8, text: '我更关注具体细节而非整体概念', example: '看画时先注意具体物体还是整体意境？', dimension: 'SN', direction: 'positive' },
  { id: 9, text: '我经常思考未来的可能性', example: '你更常想"现在做什么"还是"五年后在哪"？', dimension: 'SN', direction: 'negative' },
  { id: 10, text: '我相信眼见为实，实践出真知', example: '学新技能喜欢直接上手还是先理解原理？', dimension: 'SN', direction: 'positive' },
  { id: 11, text: '我喜欢探索抽象的理论和概念', example: '更喜欢讨论"如何做"还是"为什么做"？', dimension: 'SN', direction: 'negative' },
  { id: 12, text: '我倾向于按已验证的方法做事', example: '做菜时严格按菜谱还是随心创新？', dimension: 'SN', direction: 'positive' },
  { id: 13, text: '我常能看到别人忽略的隐藏联系', example: '看新闻只关注事件还是联想深层趋势？', dimension: 'SN', direction: 'negative' },
  { id: 14, text: '我更信任有数据支撑的结论', example: '做决定更看重统计数据还是直觉预感？', dimension: 'SN', direction: 'positive' },

  // T/F 维度 (7题)
  { id: 15, text: '做决定时，我更看重逻辑分析', example: '选工作更看重薪资前景还是团队氛围？', dimension: 'TF', direction: 'positive' },
  { id: 16, text: '我很容易感受到他人的情绪变化', example: '朋友心情不好你能很快察觉吗？', dimension: 'TF', direction: 'negative' },
  { id: 17, text: '我认为公平比和谐更重要', example: '分配任务更在意公平合理还是大家开心？', dimension: 'TF', direction: 'positive' },
  { id: 18, text: '我会优先考虑决定对他人感受的影响', example: '批评同事更关注准确还是不伤人？', dimension: 'TF', direction: 'negative' },
  { id: 19, text: '我能在情感上保持客观理性', example: '和朋友争执时能冷静分析对错吗？', dimension: 'TF', direction: 'positive' },
  { id: 20, text: '我重视和谐的人际关系', example: '你愿意为维护关系而妥协吗？', dimension: 'TF', direction: 'negative' },
  { id: 21, text: '我认为诚实比圆滑更重要', example: '朋友问新发型好看吗你会说真话吗？', dimension: 'TF', direction: 'positive' },

  // J/P 维度 (7题)
  { id: 22, text: '我喜欢提前计划，不喜欢临时变动', example: '周末出游会提前规划还是走到哪算哪？', dimension: 'JP', direction: 'positive' },
  { id: 23, text: '我喜欢保持选择的开放性', example: '买东西会快速决定还是多看多比较？', dimension: 'JP', direction: 'negative' },
  { id: 24, text: '我会按时完成任务，不喜欢拖延', example: '有任务会尽早完成还是拖到截止前？', dimension: 'JP', direction: 'positive' },
  { id: 25, text: '我在压力下反而更有效率', example: '你是提前准备考试还是考前突击更好？', dimension: 'JP', direction: 'negative' },
  { id: 26, text: '我的生活和工作空间井井有条', example: '你的桌面是整齐的还是"乱中有序"？', dimension: 'JP', direction: 'positive' },
  { id: 27, text: '我喜欢随性而为，讨厌被规则束缚', example: '你喜欢按日程表生活吗？', dimension: 'JP', direction: 'negative' },
  { id: 28, text: '我喜欢事情有明确的结论和结果', example: '讨论问题希望得出明确结论吗？', dimension: 'JP', direction: 'positive' },
]
