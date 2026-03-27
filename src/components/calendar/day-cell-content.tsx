'use client'

import { Lunar } from 'lunar-typescript'

interface DayCellContentProps {
  date: Date
  dayNumber: string
}

export function DayCellContent({ date, dayNumber }: DayCellContentProps) {
  const lunar = Lunar.fromDate(date)
  const lunarText = `${lunar.getMonthInChinese().replace('腊', '臘')}月${lunar.getDayInChinese()}`

  return (
    <div className="flex flex-col items-center leading-tight w-full">
      <span className="text-sm font-medium">{dayNumber}</span>
      <span className="text-[10px] text-muted-foreground">{lunarText}</span>
    </div>
  )
}
