/**
 * 將 Date 轉換為「台灣面值」的 Date 物件。
 *
 * ⚠️ 注意：回傳的 Date 的 UTC timestamp 等於台灣 wall clock time，
 * 不是真正的 UTC。只能用於 server 端搭配 format() 顯示台灣時間。
 *
 * ❌ 禁止用於時間比較/運算
 * ✅ 可用於 format(convertToTaiwanTime(date), 'HH:mm') 在 UTC server 上顯示台灣時間
 */
export function convertToTaiwanTime(date: Date): Date {
  const taiwanTimeString = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)

  const cleanTimeString = taiwanTimeString.replace(',', '')
  return new Date(cleanTimeString)
}
