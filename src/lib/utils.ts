import { type ClassValue, clsx } from 'clsx'
import dayjs from 'dayjs'
import { twMerge } from 'tailwind-merge'

import type { ColumnProps } from '@arco-design/web-react/es/Table'

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
    '十'
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

export function cleanObject<T extends Record<string, unknown>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)
  ) as Partial<T>
}

export function toSearchParams(obj: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams()
  for (const key in obj) {
    const value = obj[key]
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)))
    } else if (value !== undefined && value !== null) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      params.set(key, String(value))
    }
  }
  return params
}

export function defineTableColumns<T>(columns: ColumnProps<T>[]) {
  const totalWidth = columns.reduce(
    (total, column) => total + ((column.width as number | undefined) || 0),
    0
  )

  return { columns, totalWidth }
}

export function formatDateTime(timestamp: number | null | undefined) {
  if (!timestamp) return '-'
  return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

export async function urlToFile(url: string, filename: string): Promise<File> {
  const mimeType = getMimeTypeFromUrl(url)
  const response = await fetch(url)
  const blob = await response.blob()
  return new File([blob], filename, { type: mimeType })
}

export function getMimeTypeFromUrl(url: string): string {
  const extension = url
    .split('?')[0] // 去掉查询参数
    .split('#')[0] // 去掉 hash
    .trim()
    .toLowerCase()
    .split('.')
    .pop()

  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    ico: 'image/x-icon',

    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    mov: 'video/quicktime',

    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    flac: 'audio/flac',

    pdf: 'application/pdf',
    txt: 'text/plain',
    html: 'text/html',
    json: 'application/json',
    zip: 'application/zip'
  }

  return (extension && mimeTypes[extension]) || 'application/octet-stream'
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10)
}
