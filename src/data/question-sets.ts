/**
 * 题库版本配置
 * 使用懒加载提升性能
 */
import { Question, questions as questions48 } from './questions'

export type QuestionSetId = '28' | '48' | '93'

export interface QuestionSet {
  id: QuestionSetId
  name: string
  count: number
  time: string
  desc: string
}

export const questionSets: QuestionSet[] = [
  { id: '28', name: '快速版', count: 28, time: '5分钟', desc: '快速了解，适合初次体验' },
  { id: '48', name: '标准版', count: 48, time: '10分钟', desc: '平衡准确性和时间，推荐' },
  { id: '93', name: '完整版', count: 93, time: '20分钟', desc: '最全面准确，深度了解自己' },
]

// 题库加载器（懒加载）
export async function loadQuestions(setId: QuestionSetId): Promise<Question[]> {
  switch (setId) {
    case '28':
      const { questions28 } = await import('./questions-28')
      return questions28
    case '48':
      return questions48
    case '93':
      const { questions93 } = await import('./questions-93')
      return questions93
    default:
      return questions48
  }
}
