'use client'

import { useState, useEffect } from 'react'
import { CITY_COORDINATES, getNearestCity, type CityName } from '@/lib/solar-noon'

const STORAGE_KEY = 'buddhist-calendar-city'

export function useCity() {
  const [city, setCity] = useState<CityName>('taipei')
  const [gpsStatus, setGpsStatus] = useState<'pending' | 'granted' | 'denied' | 'unavailable'>('pending')

  useEffect(() => {
    // 先讀 localStorage
    const stored = localStorage.getItem(STORAGE_KEY) as CityName | null
    if (stored && stored in CITY_COORDINATES) {
      setCity(stored)
      setGpsStatus('granted')
      return
    }

    // 沒有儲存值才嘗試 GPS
    if (!navigator.geolocation) {
      setGpsStatus('unavailable')
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const nearest = getNearestCity(
          position.coords.latitude,
          position.coords.longitude,
        )
        setCity(nearest)
        setGpsStatus('granted')
        localStorage.setItem(STORAGE_KEY, nearest)
      },
      () => {
        // 拒絕或失敗 → 預設台北
        setGpsStatus('denied')
      },
      { timeout: 5000 },
    )
  }, [])

  const updateCity = (newCity: CityName) => {
    setCity(newCity)
    localStorage.setItem(STORAGE_KEY, newCity)
  }

  return { city, gpsStatus, updateCity }
}
