/**
 * MBTI 测试题库
 * 基于 Carl Jung 心理类型理论和 Myers-Briggs 四维度框架
 * 
 * 四个维度：
 * - E/I: 外向/内向 - 能量来源
 * - S/N: 感觉/直觉 - 信息获取方式  
 * - T/F: 思考/情感 - 决策方式
 * - J/P: 判断/知觉 - 生活方式
 */

export type Question = {
  id: number
  text: string
  example: string
  dimension: 'EI' | 'SN' | 'TF' | 'JP'
  direction: 'positive' | 'negative'
}

// 导出专业版 48 题作为默认题库
export { questions48Pro as questions } from './questions-48-pro'
