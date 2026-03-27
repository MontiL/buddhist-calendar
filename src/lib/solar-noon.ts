import SunCalc from 'suncalc'
import { format } from 'date-fns'
import { convertToTaiwanTime } from '@/lib/taiwan-time'

// 各城市實際座標（經緯度）
// 按緯度由北到南排列
export const CITY_COORDINATES = {
  taipei: { lat: 25.033, lng: 121.5654 },
  hsinchu: { lat: 24.8016, lng: 120.9716 },
  taichung: { lat: 24.1477, lng: 120.6736 },
  hualien: { lat: 23.9872, lng: 121.6018 },
  nantou: { lat: 23.9037, lng: 120.6858 },
  penghu: { lat: 23.5711, lng: 119.5793 },
  chiayi: { lat: 23.4801, lng: 120.4491 },
  tainan: { lat: 22.9908, lng: 120.2133 },
  taitung: { lat: 22.7583, lng: 121.1444 },
  kaohsiung: { lat: 22.6273, lng: 120.3014 },
  hengchun: { lat: 22.0022, lng: 120.7443 },
} as const

export type CityName = keyof typeof CITY_COORDINATES

// 城市中文名稱對照表（按緯度由北到南排列）
export const CITY_NAMES_ZH: Record<CityName, string> = {
  taipei: '臺北',
  hsinchu: '新竹',
  taichung: '臺中',
  hualien: '花蓮',
  nantou: '南投',
  penghu: '澎湖',
  chiayi: '嘉義',
  tainan: '臺南',
  taitung: '臺東',
  kaohsiung: '高雄',
  hengchun: '恆春',
} as const

// CWA 基準校正值：suncalc 計算值比 CWA 官方值平均晚約 75 秒
const CWA_BASE_CORRECTION_MS = -75 * 1000

// 城市層級校正值（秒），用於對齊 CWA 各城市官方值
// 基於 2022-2026 五年資料計算的最佳校正值，校正後誤差可降至 ±10秒 以內
const CITY_CORRECTION_SEC: Record<CityName, number> = {
  taipei: 20,
  hsinchu: -2,
  taichung: 4,
  nantou: -46,
  tainan: 8,
  kaohsiung: 5,
  hualien: 5,
  taitung: -3,
  hengchun: 12,
  penghu: 5,
  chiayi: 0,
}

function getTotalCorrectionMs(city: CityName): number {
  return CWA_BASE_CORRECTION_MS + CITY_CORRECTION_SEC[city] * 1000
}

/**
 * 計算指定日期和城市的太陽過中時間（HH:mm:ss）
 */
export function getSolarNoon(date: Date, city: CityName = 'taipei'): string {
  const { lat, lng } = CITY_COORDINATES[city]
  const times = SunCalc.getTimes(date, lat, lng)
  const corrected = new Date(
    times.solarNoon.getTime() + getTotalCorrectionMs(city),
  )
  return format(convertToTaiwanTime(corrected), 'HH:mm:ss')
}

/**
 * 計算指定日期和城市的太陽過中時間（HH:mm，無秒數）
 */
export function getSolarNoonShort(
  date: Date,
  city: CityName = 'taipei',
): string {
  const { lat, lng } = CITY_COORDINATES[city]
  const times = SunCalc.getTimes(date, lat, lng)
  const corrected = new Date(
    times.solarNoon.getTime() + getTotalCorrectionMs(city),
  )
  return format(convertToTaiwanTime(corrected), 'HH:mm')
}

/**
 * 取得太陽過中的 Date 物件（已校正至 CWA 官方值）
 */
export function getSolarNoonDate(date: Date, city: CityName = 'taipei'): Date {
  const { lat, lng } = CITY_COORDINATES[city]
  const times = SunCalc.getTimes(date, lat, lng)
  return new Date(times.solarNoon.getTime() + getTotalCorrectionMs(city))
}

/**
 * 找出距離給定座標最近的城市
 */
export function getNearestCity(lat: number, lng: number): CityName {
  let nearest: CityName = 'taipei'
  let minDist = Infinity

  for (const [city, coords] of Object.entries(CITY_COORDINATES) as [CityName, { lat: number; lng: number }][]) {
    const dist = Math.sqrt(
      Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2),
    )
    if (dist < minDist) {
      minDist = dist
      nearest = city
    }
  }

  return nearest
}
