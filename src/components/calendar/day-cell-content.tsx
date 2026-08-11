'use client'

import { Lunar } from 'lunar-typescript'

import { lunarCellText } from '@/lib/lunar-utils'

interface DayCellContentProps {
  date: Date
  dayNumber: string
}

export function DayCellContent({ date, dayNumber }: DayCellContentProps) {
  const lunarText = lunarCellText(date, Lunar.fromDate(date))

  return (
    <div className="flex flex-col items-center leading-tight w-full">
      <span className="text-sm font-medium">{dayNumber}</span>
      <span className="text-[10px] text-muted-foreground">{lunarText}</span>
    </div>
  )
}
