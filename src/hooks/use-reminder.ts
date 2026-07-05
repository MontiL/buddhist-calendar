'use client'

import { useState, useEffect } from 'react'

/** 全天事件（齋日／布薩／紀念日）的提醒選項，value 對應 iCal API 的 ?alarm= 參數 */
export const ALL_DAY_ALARM_OPTIONS = [
  { value: 'off', label: '不提醒' },
  { value: '0700', label: '當天 07:00' },
  { value: '0800', label: '當天 08:00' },
  { value: '-2100', label: '前一天 21:00' },
] as const

/** 過午時間的提醒選項（日中前 N 分鐘） */
export const SOLAR_ALARM_OPTIONS = [
  { value: 'off', label: '不提醒' },
  { value: '15', label: '提前 15 分鐘' },
  { value: '30', label: '提前 30 分鐘' },
  { value: '60', label: '提前 60 分鐘' },
] as const

export type AllDayAlarm = (typeof ALL_DAY_ALARM_OPTIONS)[number]['value']
export type SolarAlarm = (typeof SOLAR_ALARM_OPTIONS)[number]['value']

const ALL_DAY_STORAGE_KEY = 'buddhist-calendar-alarm-allday'
const SOLAR_STORAGE_KEY = 'buddhist-calendar-alarm-solar'

export function useReminder() {
  const [allDayAlarm, setAllDayAlarm] = useState<AllDayAlarm>('off')
  const [solarAlarm, setSolarAlarm] = useState<SolarAlarm>('off')

  useEffect(() => {
    const storedAllDay = localStorage.getItem(ALL_DAY_STORAGE_KEY)
    if (ALL_DAY_ALARM_OPTIONS.some(o => o.value === storedAllDay)) {
      setAllDayAlarm(storedAllDay as AllDayAlarm)
    }
    const storedSolar = localStorage.getItem(SOLAR_STORAGE_KEY)
    if (SOLAR_ALARM_OPTIONS.some(o => o.value === storedSolar)) {
      setSolarAlarm(storedSolar as SolarAlarm)
    }
  }, [])

  const updateAllDayAlarm = (value: AllDayAlarm) => {
    setAllDayAlarm(value)
    localStorage.setItem(ALL_DAY_STORAGE_KEY, value)
  }

  const updateSolarAlarm = (value: SolarAlarm) => {
    setSolarAlarm(value)
    localStorage.setItem(SOLAR_STORAGE_KEY, value)
  }

  return { allDayAlarm, solarAlarm, updateAllDayAlarm, updateSolarAlarm }
}
