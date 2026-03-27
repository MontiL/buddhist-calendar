/**
 * RFC 5545 iCal 格式生成工具
 */

export type ICalEvent = {
  uid: string
  summary: string
  dtstart: string  // YYYYMMDD（全天）或 YYYYMMDDTHHmmssZ（時間）
  dtend: string
  allDay: boolean
  description?: string
}

function escapeIcal(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function foldLine(line: string): string {
  // RFC 5545: fold lines longer than 75 octets
  const maxLen = 75
  if (line.length <= maxLen) return line
  const parts: string[] = []
  parts.push(line.slice(0, maxLen))
  let i = maxLen
  while (i < line.length) {
    parts.push(' ' + line.slice(i, i + maxLen - 1))
    i += maxLen - 1
  }
  return parts.join('\r\n')
}

export function generateICalString(
  calendarName: string,
  events: ICalEvent[],
  calendarDesc?: string,
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Buddhist Calendar//Buddhist Calendar//ZH',
    `X-WR-CALNAME:${escapeIcal(calendarName)}`,
    'X-WR-TIMEZONE:Asia/Taipei',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]
  if (calendarDesc) {
    lines.push(foldLine(`X-WR-CALDESC:${escapeIcal(calendarDesc)}`))
  }

  for (const event of events) {
    const valueDatePrefix = event.allDay ? ';VALUE=DATE' : ''
    lines.push('BEGIN:VEVENT')
    lines.push(foldLine(`UID:${event.uid}`))
    lines.push(foldLine(`SUMMARY:${escapeIcal(event.summary)}`))
    lines.push(foldLine(`DTSTART${valueDatePrefix}:${event.dtstart}`))
    lines.push(foldLine(`DTEND${valueDatePrefix}:${event.dtend}`))
    if (event.description) {
      lines.push(foldLine(`DESCRIPTION:${escapeIcal(event.description)}`))
    }
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n') + '\r\n'
}

/** 將 Date 格式化為 iCal 全天格式 YYYYMMDD（台灣時區） */
export function formatICalDate(date: Date): string {
  const tw = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  return tw.replace(/-/g, '')
}

/** 將 Date 格式化為 iCal UTC 時間 YYYYMMDDTHHmmssZ */
export function formatICalDateTime(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}
