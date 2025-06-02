import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function completeDateFormat(dateStr: string) {
  // 匹配 YYYY-MM 或 YYYY 格式
  const yearMonthPattern = /^(\d{4})(?:-(\d{2}))?$/

  const match = yearMonthPattern.exec(dateStr)
  if (!match) return dateStr // 如果不匹配这两种格式，返回原字符串

  const year = match[1]
  const month = match[2] || '01' // 如果没有月份，使用 '01'

  return `${year}-${month}-01`
}

export function numberToChinese(num: number) {
  const chineseNumbers = [
    '零',
    '一',
    '二',
    '三',
    '四',
    '五',
    '六',
    '七',
    '八',
    '九',
    '十',
  ]
  if (num <= 10) {
    return chineseNumbers[num]
  } else if (num < 20) {
    return '十' + (num > 10 ? chineseNumbers[num - 10] : '')
  } else {
    const tens = Math.floor(num / 10)
    const ones = num % 10
    return chineseNumbers[tens] + '十' + (ones > 0 ? chineseNumbers[ones] : '')
  }
}
