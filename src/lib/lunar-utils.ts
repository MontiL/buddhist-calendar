import { eachDayOfInterval } from 'date-fns'
import { Lunar, LunarMonth } from 'lunar-typescript'
import { CITY_NAMES_ZH, getSolarNoonShort, type CityName } from '@/lib/solar-noon'

// 佛菩薩紀念日定義（農曆）
export const BUDDHIST_FESTIVALS = [
  { month: 1, day: 1, name: '彌勒菩薩聖誕' },
  { month: 2, day: 8, name: '釋迦牟尼佛出家日' },
  { month: 2, day: 15, name: '釋迦牟尼佛涅槃日' },
  { month: 2, day: 19, name: '觀世音菩薩聖誕' },
  { month: 2, day: 21, name: '普賢菩薩聖誕' },
  { month: 4, day: 4, name: '文殊菩薩聖誕' },
  { month: 4, day: 8, name: '佛誕日' },
  { month: 6, day: 19, name: '觀世音菩薩成道日' },
  { month: 7, day: 13, name: '大勢至菩薩聖誕' },
  { month: 7, day: 30, name: '地藏菩薩聖誕' },
  { month: 9, day: 19, name: '觀世音菩薩出家日' },
  { month: 11, day: 17, name: '阿彌陀佛聖誕' },
  { month: 12, day: 8, name: '釋迦牟尼佛成道日' },
] as const

// 檢查是否為小月
const isSmallMonth = (lunar: Lunar): boolean => {
  const month = LunarMonth.fromYm(lunar.getYear(), Math.abs(lunar.getMonth()))
  if (!month) return false
  return month.getDayCount() === 29
}

// 六齋日：初八、十四、十五、廿三，以及月末（大月廿九、三十；小月廿八、廿九）
export const isSixthDay = (lunar: Lunar): boolean => {
  const day = lunar.getDay()
  if (day === 8 || day === 14 || day === 15 || day === 23) return true
  if (isSmallMonth(lunar)) return day === 28 || day === 29
  return day === 29 || day === 30
}

// 長齋月：農曆一月、五月、九月
export const isLongFastMonth = (lunar: Lunar): boolean => {
  const month = lunar.getMonth()
  return month === 1 || month === 5 || month === 9
}

// 布薩日：白月（農曆十五）或黑月（月末）
export const isPosadhaDay = (lunar: Lunar): 'WHITE' | 'BLACK' | false => {
  const day = lunar.getDay()
  if (day === 15) return 'WHITE'
  if (isSmallMonth(lunar)) {
    if (day === 29) return 'BLACK'
  } else {
    if (day === 30) return 'BLACK'
  }
  return false
}

export const getPosadhaText = (type: 'WHITE' | 'BLACK'): string =>
  type === 'WHITE' ? '白月布薩' : '黑月布薩'

export const getPosadhaHalfMonthDay = (lunar: Lunar): string => {
  const day = lunar.getDay()
  if (day === 15) return '白月十五'
  return isSmallMonth(lunar) ? '黑月十四' : '黑月十五'
}

// 佛菩薩紀念日
export const getBuddhistFestival = (lunar: Lunar): string | null => {
  const month = lunar.getMonth()
  const day = lunar.getDay()
  const festival = BUDDHIST_FESTIVALS.find(
    f => f.month === month && f.day === day,
  )
  return festival?.name ?? null
}

// 農曆月名（正、二…冬、臘；閏月冠「閏」）
export const lunarMonthText = (lunar: Lunar): string =>
  lunar.getMonthInChinese().replace('腊', '臘').replace('闰', '閏')

// 農曆日期全稱，例：六月十五
export const lunarDayText = (lunar: Lunar): string =>
  `${lunarMonthText(lunar)}月${lunar.getDayInChinese()}`

export type LunarDayInfo = {
  text: string
  isSpecialDay: boolean
  specialDayText: string
  lunar: Lunar
  posadha: 'WHITE' | 'BLACK' | false
  posadhaText: string
  buddhistFestival: string | null
}

// 取得單個日期的農曆資訊
export const getLunarInfo = (date: Date | null): LunarDayInfo | null => {
  if (!date) return null

  const lunar = Lunar.fromDate(date)
  const isSixthDayDate = isSixthDay(lunar)
  const isLongFastMonthDate = isLongFastMonth(lunar)
  const posadha = isPosadhaDay(lunar)
  const buddhistFestival = getBuddhistFestival(lunar)

  let specialDayText = ''
  if (isSixthDayDate) {
    specialDayText = '六齋日'
  } else if (isLongFastMonthDate) {
    specialDayText = '長齋月'
  }

  return {
    text: lunarDayText(lunar),
    isSpecialDay: isSixthDayDate || isLongFastMonthDate,
    specialDayText,
    lunar,
    posadha,
    posadhaText: posadha ? getPosadhaText(posadha) : '',
    buddhistFestival,
  }
}

// FullCalendar 事件類型
export type BuddhistCalendarEvent = {
  id: string
  date?: Date       // 單日事件
  start?: Date      // 橫跨事件
  end?: Date        // 橫跨事件（FullCalendar exclusive end）
  title: string
  type: 'posadha' | 'festival' | 'sixthDay' | 'longFastMonth' | 'solarNoon'
  subType?: 'WHITE' | 'BLACK'
  backgroundColor: string
  borderColor: string
  textColor: string
  solarNoon?: string
  isFastingDay?: boolean
}

/**
 * 產生指定日期範圍內的佛教行事曆事件（不含過午時間）。
 * 過午時間由 getSolarNoonEvents() 獨立產生。
 */
export const getBuddhistCalendarEvents = (
  startDate: Date,
  endDate: Date,
): BuddhistCalendarEvent[] => {
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const events: BuddhistCalendarEvent[] = []

  // 追蹤長齋月橫跨期間
  const longFastMonthPeriods: Map<string, { start: Date; end: Date }> = new Map()

  days.forEach(day => {
    const lunar = Lunar.fromDate(day)
    const dateStr = day.toISOString().split('T')[0]
    const isInLongFastMonth = isLongFastMonth(lunar)

    // 布薩日
    const posadha = isPosadhaDay(lunar)
    if (posadha) {
      events.push({
        id: `posadha-${dateStr}`,
        date: day,
        title: posadha === 'WHITE' ? '白月布薩' : '黑月布薩',
        type: 'posadha',
        subType: posadha,
        backgroundColor: '#c4b5fd',
        borderColor: '#a78bfa',
        textColor: '#5b21b6',
      })
    }

    // 佛菩薩紀念日
    const festival = getBuddhistFestival(lunar)
    if (festival) {
      events.push({
        id: `festival-${dateStr}`,
        date: day,
        title: festival,
        type: 'festival',
        backgroundColor: '#fbcfe8',
        borderColor: '#f472b6',
        textColor: '#9d174d',
      })
    }

    // 長齋月橫跨期間追蹤
    if (isInLongFastMonth) {
      const lunarYear = lunar.getYear()
      const lunarMonth = lunar.getMonth()
      const periodKey = `${lunarYear}-${lunarMonth}`
      const existing = longFastMonthPeriods.get(periodKey)
      if (existing) {
        existing.end = day
      } else {
        longFastMonthPeriods.set(periodKey, { start: day, end: day })
      }
    }

    // 六齋日（純標示，不含過午時間）
    if (isSixthDay(lunar)) {
      events.push({
        id: `sixthDay-${dateStr}`,
        date: day,
        title: '六齋日',
        type: 'sixthDay',
        backgroundColor: '#fef08a',
        borderColor: '#facc15',
        textColor: '#854d0e',
        isFastingDay: true,
      })
    }
  })

  // 長齋月橫跨事件
  longFastMonthPeriods.forEach((period, key) => {
    const exclusiveEnd = new Date(period.end)
    exclusiveEnd.setDate(exclusiveEnd.getDate() + 1)
    events.push({
      id: `longFastMonth-${key}`,
      start: period.start,
      end: exclusiveEnd,
      title: '長齋月',
      type: 'longFastMonth',
      backgroundColor: '#bbf7d0',
      borderColor: '#4ade80',
      textColor: '#166534',
    })
  })

  return events
}

/**
 * 產生指定日期範圍內的每日過午時間事件。
 * 每天一條，依城市計算，與其他事件完全獨立。
 */
export const getSolarNoonEvents = (
  startDate: Date,
  endDate: Date,
  city: CityName = 'taipei',
): BuddhistCalendarEvent[] => {
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  return days.map(day => {
    const solarNoon = getSolarNoonShort(day, city)
    return {
      id: `solarNoon-${day.toISOString().split('T')[0]}`,
      date: day,
      title: `⏰ ${solarNoon}（${CITY_NAMES_ZH[city]}）`,
      type: 'solarNoon' as const,
      backgroundColor: '#bae6fd',
      borderColor: '#38bdf8',
      textColor: '#0c4a6e',
      solarNoon,
    }
  })
}
