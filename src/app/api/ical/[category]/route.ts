import { NextRequest, NextResponse } from 'next/server'
import { addDays, subDays } from 'date-fns'
import {
  getBuddhistCalendarEvents,
  getSolarNoonEvents,
} from '@/lib/lunar-utils'
import { generateICalString, formatICalDate, type ICalEvent } from '@/lib/ical-utils'
import type { CityName } from '@/lib/solar-noon'
import { CITY_COORDINATES } from '@/lib/solar-noon'

const CALENDAR_NAMES: Record<string, string> = {
  festivals: '佛菩薩紀念日',
  fasting: '齋日',
  posadha: '布薩日',
  'solar-noon': '過午時間',
}

const VALID_CATEGORIES = Object.keys(CALENDAR_NAMES)

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
      })
    }
  } else if (category === 'solar-noon') {
    const rawCity = searchParams.get('city') ?? 'taipei'
    const city: CityName =
      rawCity in CITY_COORDINATES ? (rawCity as CityName) : 'taipei'

    const solarEvents = getSolarNoonEvents(start, end, city)
    for (const e of solarEvents) {
      if (!e.date || !e.solarNoon) continue
      const dtstart = formatICalDate(e.date)
      const dtend = formatICalDate(addDays(e.date, 1))
      const year = e.date.getFullYear()
      const cwaUrl = `https://www.cwa.gov.tw/Data/astronomy/${year}suntr.pdf`
      icalEvents.push({
        uid: `${e.id}-${city}@buddhist-calendar`,
        summary: e.title,
        dtstart,
        dtend,
        allDay: true,
        description: `過午時間：${e.solarNoon}\n過午時間由 suncalc 天文演算法計算，以CWA官方值校正（${cwaUrl}）；誤差 ±10 秒以內（嘉義較大）`,
      })
    }
  }

  const calendarName = CALENDAR_NAMES[category]
  const icalString = generateICalString(calendarName, icalEvents)

  return new NextResponse(icalString, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${category}.ics"`,
      'Cache-Control': 'max-age=60, public',
    },
  })
}
