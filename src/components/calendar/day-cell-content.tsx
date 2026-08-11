'use client'

import { Lunar } from 'lunar-typescript'

import { lunarCellText } from '@/lib/lunar-utils'

interface DayCellContentProps {
  date: Date
  dayNumber: string
  isToday: boolean
}

export function DayCellContent({ date, dayNumber, isToday }: DayCellContentProps) {
  const lunarText = lunarCellText(date, Lunar.fromDate(date))

  return (
    <div className="flex flex-col items-center leading-tight w-full">
      <span
        className="cal-day-num text-sm font-medium"
        data-today={isToday || undefined}
      >
        {dayNumber}
      </span>
      <span className="cal-lunar text-[11px]">{lunarText}</span>
    </div>
  )
}
