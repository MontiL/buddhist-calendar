import { NextRequest, NextResponse } from 'next/server'
import { addDays, subDays } from 'date-fns'
import {
  getBuddhistCalendarEvents,
  getSolarNoonEvents,
} from '@/lib/lunar-utils'
import {
  generateICalString,
  formatICalDate,
  formatICalDateTime,
  type ICalEvent,
} from '@/lib/ical-utils'
import type { CityName } from '@/lib/solar-noon'
import { CITY_COORDINATES, CITY_NAMES_ZH, getSolarNoonDate } from '@/lib/solar-noon'

const CALENDAR_NAMES: Record<string, string> = {
  festivals: '佛菩薩紀念日',
  fasting: '齋日',
  posadha: '布薩日',
  'solar-noon': '過午時間',
}

const VALID_CATEGORIES = Object.keys(CALENDAR_NAMES)

const ALL_DAY_ALARM_RE = /^(-?)([01]\d|2[0-3])([0-5]\d)$/

/**
 * 全天事件的提醒參數：'HHMM' = 當天該時刻，'-HHMM' = 前一天該時刻。
 * 相對 TRIGGER 以 DTSTART（當地午夜）為基準，回傳 'PT<n>M' 或 '-PT<n>M'；無效輸入回傳 null。
 */
function parseAllDayAlarmTrigger(raw: string | null): string | null {
  if (!raw) return null
  const m = ALL_DAY_ALARM_RE.exec(raw)
  if (!m) return null
  const minutes = Number(m[2]) * 60 + Number(m[3])
  return m[1] === '-' ? `-PT${24 * 60 - minutes}M` : `PT${minutes}M`
}

/** 過午時間的提醒參數：日中前 N 分鐘（allowlist） */
const SOLAR_ALARM_MINUTES = new Set(['15', '30', '60'])

function parseSolarAlarmMinutes(raw: string | null): number | null {
  return raw !== null && SOLAR_ALARM_MINUTES.has(raw) ? Number(raw) : null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> },
) {
  const { category } = await params
  const { searchParams } = request.nextUrl

  if (!VALID_CATEGORIES.includes(category)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const today = new Date()
  const start = subDays(today, 30)
  const end = addDays(today, 365)

  const buddhistEvents = getBuddhistCalendarEvents(start, end)
  const icalEvents: ICalEvent[] = []
  const rawAlarm = searchParams.get('alarm')
  const alarmTrigger = parseAllDayAlarmTrigger(rawAlarm)

  if (category === 'festivals') {
    for (const e of buddhistEvents.filter(e => e.type === 'festival')) {
      if (!e.date) continue
      const dtstart = formatICalDate(e.date)
      const dtend = formatICalDate(addDays(e.date, 1))
      icalEvents.push({
        uid: `${e.id}@buddhist-calendar`,
        summary: e.title,
        dtstart,
        dtend,
        allDay: true,
        ...(alarmTrigger ? { alarm: { trigger: alarmTrigger, description: e.title } } : {}),
      })
    }
  } else if (category === 'fasting') {
    for (const e of buddhistEvents.filter(
      ev => ev.type === 'sixthDay' || ev.type === 'longFastMonth',
    )) {
      const description =
        e.type === 'sixthDay'
          ? '農曆六齋日（初一、初八、十四、十五、二十三、三十）'
          : '農曆長齋月（正月、五月、九月）'
      if (e.date) {
        const dtstart = formatICalDate(e.date)
        const dtend = formatICalDate(addDays(e.date, 1))
        icalEvents.push({
          uid: `${e.id}@buddhist-calendar`,
          summary: e.title,
          dtstart,
          dtend,
          allDay: true,
          description,
          ...(alarmTrigger ? { alarm: { trigger: alarmTrigger, description: e.title } } : {}),
        })
      } else if (e.start && e.end) {
        // longFastMonth spanning event
        const dtstart = formatICalDate(e.start)
        const dtend = formatICalDate(e.end) // already exclusive end
        icalEvents.push({
          uid: `${e.id}@buddhist-calendar`,
          summary: e.title,
          dtstart,
          dtend,
          allDay: true,
          description,
          // 跨月事件：提醒只在起始日觸發一次（提示齋月開始）
          ...(alarmTrigger ? { alarm: { trigger: alarmTrigger, description: e.title } } : {}),
        })
      }
    }
  } else if (category === 'posadha') {
    for (const e of buddhistEvents.filter(ev => ev.type === 'posadha')) {
      if (!e.date) continue
      const dtstart = formatICalDate(e.date)
      const dtend = formatICalDate(addDays(e.date, 1))
      icalEvents.push({
        uid: `${e.id}@buddhist-calendar`,
        summary: e.title,
        dtstart,
        dtend,
        allDay: true,
        ...(alarmTrigger ? { alarm: { trigger: alarmTrigger, description: e.title } } : {}),
      })
    }
  } else if (category === 'solar-noon') {
    const rawCity = searchParams.get('city') ?? 'taipei'
    const city: CityName =
      rawCity in CITY_COORDINATES ? (rawCity as CityName) : 'taipei'
    const alarmMinutes = parseSolarAlarmMinutes(rawAlarm)
    const cityZh = CITY_NAMES_ZH[city]

    const solarEvents = getSolarNoonEvents(start, end, city)
    for (const e of solarEvents) {
      if (!e.date || !e.solarNoon) continue
      const dtstart = formatICalDate(e.date)
      const dtend = formatICalDate(addDays(e.date, 1))
      // 事件維持全天顯示，提醒用絕對時間 TRIGGER 對準日中前 N 分鐘
      const alarm =
        alarmMinutes !== null
          ? {
              alarm: {
                trigger: formatICalDateTime(
                  new Date(getSolarNoonDate(e.date, city).getTime() - alarmMinutes * 60_000),
                ),
                absolute: true,
                description: `${cityZh}過午時間 ${e.solarNoon}（${alarmMinutes} 分鐘前提醒）`,
              },
            }
          : {}
      icalEvents.push({
        uid: `${e.id}-${city}@buddhist-calendar`,
        summary: e.title,
        dtstart,
        dtend,
        allDay: true,
        description: `${cityZh}過午時間：${e.solarNoon}\n採用 astronomy-engine（JPL DE421）計算，與中央氣象署官方值比對：99.6% 誤差 ≤3 秒，最大誤差 11 秒。\n詳細說明：https://buddhist-calendar.vercel.app/solar-noon`,
        ...alarm,
      })
    }
  }

  const cityName = category === 'solar-noon'
    ? CITY_NAMES_ZH[
        (searchParams.get('city') ?? 'taipei') in CITY_COORDINATES
          ? ((searchParams.get('city') ?? 'taipei') as CityName)
          : 'taipei'
      ]
    : undefined
  const calendarName = cityName
    ? `${CALENDAR_NAMES[category]}（${cityName}）`
    : CALENDAR_NAMES[category]
  const calendarDesc = category === 'solar-noon'
    ? `佛教齋戒行事曆 — ${cityName}過午時間。採用 astronomy-engine（JPL DE421）計算，與中央氣象署官方值比對：99.6% 誤差 ≤3 秒，最大誤差 11 秒。詳細說明：https://buddhist-calendar.vercel.app/solar-noon`
    : undefined
  const icalString = generateICalString(calendarName, icalEvents, calendarDesc)

  return new NextResponse(icalString, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${category}.ics"`,
      'Cache-Control': 'max-age=86400, public',
      'Cache-Tag': `ical-${category}`,
    },
  })
}
