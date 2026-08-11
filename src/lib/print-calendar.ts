import { addDays, startOfMonth } from 'date-fns'
import { Lunar } from 'lunar-typescript'

import {
  getBuddhistFestival,
  isLongFastMonth,
  isPosadhaDay,
  isSixthDay,
  lunarCellText,
  lunarMonthText,
} from '@/lib/lunar-utils'
import { getSolarNoonShort, type CityName } from '@/lib/solar-noon'

/* ------------------------------------------------------------------ */
/* 版面設定型別                                                         */
/* ------------------------------------------------------------------ */

export type PaperSize = 'A4' | 'A3' | 'B5' | 'Letter'
export type Orientation = 'portrait' | 'landscape'
export type MonthsPerPage = 1 | 2 | 3 | 4

/** 紙張尺寸（直向 mm）。橫向時交換寬高。 */
export const PAPER_MM: Record<PaperSize, { w: number; h: number; label: string }> = {
  A4: { w: 210, h: 297, label: 'A4（210 × 297 mm）' },
  A3: { w: 297, h: 420, label: 'A3（297 × 420 mm）' },
  B5: { w: 176, h: 250, label: 'B5（176 × 250 mm）' },
  Letter: { w: 216, h: 279, label: 'Letter（216 × 279 mm）' },
}

export const PAPER_SIZES = Object.keys(PAPER_MM) as PaperSize[]

/** 取得實際輸出尺寸（已套用紙張方向）。 */
export const paperDimensions = (
  paper: PaperSize,
  orientation: Orientation,
): { w: number; h: number } => {
  const { w, h } = PAPER_MM[paper]
  return orientation === 'landscape' ? { w: h, h: w } : { w, h }
}

/** 可列印的內容項目。 */
export type PrintContent = {
  lunar: boolean
  festival: boolean
  fasting: boolean
  posadha: boolean
  solarNoon: boolean
}

/* ------------------------------------------------------------------ */
/* 月份鍵值：'YYYY-MM'                                                  */
/* ------------------------------------------------------------------ */

export type MonthKey = string

export const monthKey = (year: number, month: number): MonthKey =>
  `${year}-${String(month).padStart(2, '0')}`

export const parseMonthKey = (key: MonthKey): { year: number; month: number } => {
  const [year, month] = key.split('-').map(Number)
  return { year, month }
}

/** 產生 from ~ to 之間（含頭尾）的所有月份鍵值；順序顛倒時自動交換。 */
export const monthKeyRange = (from: MonthKey, to: MonthKey): MonthKey[] => {
  const [lo, hi] = from <= to ? [from, to] : [to, from]
  const start = parseMonthKey(lo)
  const end = parseMonthKey(hi)

  const keys: MonthKey[] = []
  let { year, month } = start
  while (year < end.year || (year === end.year && month <= end.month)) {
    keys.push(monthKey(year, month))
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }
  return keys
}

/** 依年月排序（字串比較即可，因為月份已補零）。 */
export const sortMonthKeys = (keys: Iterable<MonthKey>): MonthKey[] =>
  [...keys].sort()

/* ------------------------------------------------------------------ */
/* 月曆資料                                                            */
/* ------------------------------------------------------------------ */

export type PrintDay = {
  date: Date
  dayNumber: number
  /** 是否屬於本月（false 為前後月補格） */
  inMonth: boolean
  /** 農曆日：初一與公曆 1 號顯示「六月初一」，其餘僅顯示「十五」 */
  lunarText: string
  festival: string | null
  posadha: 'WHITE' | 'BLACK' | false
  isSixthDay: boolean
  isLongFastMonth: boolean
  /** 過午時刻 HH:mm */
  solarNoon: string
}

export type PrintMonth = {
  key: MonthKey
  year: number
  /** 1-12 */
  month: number
  /** 「2026年 8月」 */
  title: string
  /** 本月橫跨的農曆月，例「農曆六月・七月」（一個公曆月最多橫跨兩個農曆月） */
  lunarSpan: string
  /** 本月是否含長齋月日子 */
  hasLongFastMonth: boolean
  /** 該月實際需要的週數 × 7 天（週日起，與站上 firstDay={0} 一致） */
  weeks: PrintDay[][]
}

export const printMonthTitle = (year: number, month: number): string =>
  `${year}年 ${month}月`

/**
 * 建構單一月份的列印資料。
 *
 * 只產生該月實際需要的週數（4～6 列），避免整列空白格佔掉版面；
 * 落在本月之外的格子仍會標記日期數字，但不帶任何佛曆內容。
 */
export const buildPrintMonth = (
  year: number,
  month: number,
  city: CityName,
): PrintMonth => {
  const first = startOfMonth(new Date(year, month - 1, 1))
  // 回推到該週的週日
  const gridStart = addDays(first, -first.getDay())
  const daysInMonth = new Date(year, month, 0).getDate()
  const weekCount = Math.ceil((first.getDay() + daysInMonth) / 7)

  let hasLongFastMonth = false
  // 本月出現過的農曆月名，依序去重（補格不計，故錨點必落在本月 1 號那格）
  const lunarMonths: string[] = []
  const weeks: PrintDay[][] = []

  for (let w = 0; w < weekCount; w++) {
    const week: PrintDay[] = []
    for (let d = 0; d < 7; d++) {
      const date = addDays(gridStart, w * 7 + d)
      const inMonth = date.getMonth() === month - 1 && date.getFullYear() === year

      if (!inMonth) {
        week.push({
          date,
          dayNumber: date.getDate(),
          inMonth: false,
          lunarText: '',
          festival: null,
          posadha: false,
          isSixthDay: false,
          isLongFastMonth: false,
          solarNoon: '',
        })
        continue
      }

      const lunar = Lunar.fromDate(date)
      const longFast = isLongFastMonth(lunar)
      if (longFast) hasLongFastMonth = true

      const monthName = lunarMonthText(lunar)
      if (!lunarMonths.includes(monthName)) lunarMonths.push(monthName)

      week.push({
        date,
        dayNumber: date.getDate(),
        inMonth: true,
        lunarText: lunarCellText(date, lunar),
        festival: getBuddhistFestival(lunar),
        posadha: isPosadhaDay(lunar),
        isSixthDay: isSixthDay(lunar),
        isLongFastMonth: longFast,
        solarNoon: getSolarNoonShort(date, city),
      })
    }
    weeks.push(week)
  }

  return {
    key: monthKey(year, month),
    year,
    month,
    title: printMonthTitle(year, month),
    lunarSpan: `農曆${lunarMonths.map(name => `${name}月`).join('・')}`,
    hasLongFastMonth,
    weeks,
  }
}

export const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'] as const
