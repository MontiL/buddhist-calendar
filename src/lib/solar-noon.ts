import { Observer, SearchHourAngle, Body } from 'astronomy-engine'
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

// CWA 附表城市偏移秒數（來源：中央氣象署年度《太陽過中天時刻》PDF）
// 代表各城市相對於東經 120° 子午圈的時刻差，為 CWA 觀測站基準的固定值。
// 嘉義未列於 CWA 附表，以 0（120°E 基準）計。
const CWA_CITY_OFFSET_SEC: Record<CityName, number> = {
  taipei:    -360,
  hsinchu:   -240,
  taichung:  -164,
  hualien:   -384,
  nantou:    -216,
  penghu:     +96,
  chiayi:       0,
  tainan:     -48,
  taitung:   -288,
  kaohsiung:  -72,
  hengchun:  -168,
}

/**
 * 從任意 Date 提取台灣時區的日期元件（年、月、日）。
 * 無論執行環境的系統時區為何，均以 Asia/Taipei 為準。
 */
function getTaiwanDateParts(date: Date): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const [y, m, d] = formatter.format(date).split('-').map(Number)
  return { year: y, month: m - 1, day: d } // month 為 0-indexed，供 Date.UTC 使用
}

/**
 * 計算指定日期太陽過東經 120° 子午圈的時刻（UTC Date）。
 *
 * 演算法：使用 astronomy-engine（基於 JPL DE421 星曆表），
 * 內建 ΔT 修正，與 CWA 官方值誤差 ± 2 秒以內。
 */
function solarNoonAt120E(date: Date): Date {
  // 以台灣日期的 02:00 UTC（= 台灣時間 10:00）作為搜尋起點，
  // 確保搜尋起點早於台灣最早的日中時刻（約 11:43 台灣時間）。
  const { year, month, day } = getTaiwanDateParts(date)
  const searchStart = new Date(Date.UTC(year, month, day, 2, 0, 0))

  // 緯度不影響子午線過中時刻，以 0° 計算即可
  const observer = new Observer(0, 120.0, 0)
  return SearchHourAngle(Body.Sun, observer, 0, searchStart, 1).time.date
}

/**
 * 計算指定日期和城市的太陽過中時間（HH:mm:ss）
 */
export function getSolarNoon(date: Date, city: CityName = 'taipei'): string {
  const noon = new Date(solarNoonAt120E(date).getTime() + CWA_CITY_OFFSET_SEC[city] * 1000)
  return format(convertToTaiwanTime(noon), 'HH:mm:ss')
}

/**
 * 計算指定日期和城市的太陽過中時間（HH:mm，無秒數）
 */
export function getSolarNoonShort(date: Date, city: CityName = 'taipei'): string {
  const noon = new Date(solarNoonAt120E(date).getTime() + CWA_CITY_OFFSET_SEC[city] * 1000)
  return format(convertToTaiwanTime(noon), 'HH:mm')
}

/**
 * 取得太陽過中的 Date 物件（UTC）
 */
export function getSolarNoonDate(date: Date, city: CityName = 'taipei'): Date {
  return new Date(solarNoonAt120E(date).getTime() + CWA_CITY_OFFSET_SEC[city] * 1000)
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
