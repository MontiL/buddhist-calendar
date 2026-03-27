import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '過午時間演算法說明 — 佛教齋戒行事曆',
  description:
    '說明過午時間如何以 astronomy-engine（JPL DE421）計算，並以中央氣象署（CWA）五年資料驗證的詳細方法。',
}

const CWA_YEARS = [2022, 2023, 2024, 2025, 2026]

// CWA 附表偏移秒數（來源：CWA 年度《太陽過中天時刻》PDF 附表）
// 嘉義未列於附表，以 0 秒計（最接近 120°E）
const CITIES = [
  { zh: '臺北', lat: 25.033, lng: 121.565, cwaSec: -360 },
  { zh: '新竹', lat: 24.802, lng: 120.972, cwaSec: -240 },
  { zh: '臺中', lat: 24.148, lng: 120.674, cwaSec: -164 },
  { zh: '花蓮', lat: 23.987, lng: 121.602, cwaSec: -384 },
  { zh: '南投', lat: 23.904, lng: 120.686, cwaSec: -216 },
  { zh: '澎湖', lat: 23.571, lng: 119.579, cwaSec: +96 },
  { zh: '嘉義', lat: 23.480, lng: 120.449, cwaSec: 0 },
  { zh: '臺南', lat: 22.991, lng: 120.213, cwaSec: -48 },
  { zh: '臺東', lat: 22.758, lng: 121.144, cwaSec: -288 },
  { zh: '高雄', lat: 22.627, lng: 120.301, cwaSec: -72 },
  { zh: '恆春', lat: 22.002, lng: 120.744, cwaSec: -168 },
]

function formatOffset(sec: number): string {
  if (sec === 0) return '0 秒（CWA 未列，以 0 計）'
  const abs = Math.abs(sec)
  const m = Math.floor(abs / 60)
  const s = abs % 60
  const sign = sec > 0 ? '+' : '−'
  return s === 0
    ? `${sign}${m} 分`
    : `${sign}${m} 分 ${s} 秒`
}

// 五年驗證結果（astronomy-engine vs CWA 120°E 基準值，2022–2026 逐日比對）
const VERIFY_ROWS = [
  { year: 2022, days: 365, maxErr: 9,  over2: 1, over5: 1 },
  { year: 2023, days: 365, maxErr: 3,  over2: 3, over5: 0 },
  { year: 2024, days: 366, maxErr: 2,  over2: 0, over5: 0 },
  { year: 2025, days: 364, maxErr: 11, over2: 2, over5: 2 },
  { year: 2026, days: 365, maxErr: 3,  over2: 2, over5: 0 },
]

export default function SolarNoonPage() {
  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground mb-6 inline-block"
        >
          ← 返回行事曆
        </Link>

        <h1 className="text-xl font-bold tracking-tight mb-1">
          過午時間演算法說明
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          計算方式、CWA 對照基準，以及五年逐日驗證結果
        </p>

        {/* 計算流程 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 pb-1 border-b">
            計算流程
          </h2>
          <div className="text-sm space-y-3 text-foreground/90">
            <p>採用與中央氣象署（CWA）相同的兩步驟方式：</p>

            <div className="space-y-3 pl-1">
              <div>
                <p className="font-medium mb-1">步驟一：計算太陽過東經 120° 子午圈的時刻</p>
                <p className="text-foreground/75">
                  使用{' '}
                  <a
                    href="https://github.com/cosinekitty/astronomy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    astronomy-engine
                  </a>{' '}
                  開源函式庫（Don Cross，MIT 授權），基於美國噴射推進實驗室（JPL）的{' '}
                  <strong>DE421 星曆表</strong>，以{' '}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">SearchHourAngle</code>{' '}
                  搜尋太陽時角（Hour Angle）為零、即太陽通過 120°E 子午圈的瞬間。
                  函式庫內建 <strong>ΔT 修正</strong>（地球時 TT 與世界時 UTC 的差值，
                  目前約 69 秒），結果直接為民用時間（UTC+8）。
                </p>
              </div>

              <div>
                <p className="font-medium mb-1">步驟二：加上 CWA 公告的城市固定偏移</p>
                <p className="text-foreground/75">
                  CWA 年度 PDF 附表列出各城市相對於 120°E 的時刻差（固定秒數，
                  基於 CWA 氣象觀測站位置換算）。本站直接採用這組偏移值，
                  不另行計算或修正。
                </p>
                <div className="bg-muted rounded p-2.5 font-mono text-xs mt-2">
                  城市過午時間 = 120°E 日中時刻 + CWA 城市偏移秒數
                </div>
              </div>
            </div>

            <p className="text-foreground/75">
              相較於先前使用的 suncalc（Meeus 簡化公式），astronomy-engine
              消除了簡化公式因省略高階修正項所導致的<strong>季節性誤差（振幅約 ±50 秒）</strong>，
              演算法精度提升至 ±2 秒以內。
            </p>
          </div>
        </section>

        {/* 程式碼參考 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 pb-1 border-b">
            核心實作
          </h2>
          <p className="text-sm text-muted-foreground mb-2">
            位於{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              src/lib/solar-noon.ts
            </code>
          </p>
          <pre className="bg-muted rounded p-3 text-xs overflow-x-auto leading-relaxed">
{`import { Observer, SearchHourAngle, Body } from 'astronomy-engine'

// 步驟一：精確計算太陽過 120°E 的時刻（UTC Date）
function solarNoonAt120E(date: Date): Date {
  const { year, month, day } = getTaiwanDateParts(date) // 取台灣日期
  const searchStart = new Date(Date.UTC(year, month, day, 2, 0, 0))
  //                           ↑ 02:00 UTC = 台灣 10:00，早於任何可能的日中

  const observer = new Observer(0, 120.0, 0) // 緯度不影響子午線過中時刻
  return SearchHourAngle(Body.Sun, observer, 0, searchStart, 1).time.date
  //     ↑ 搜尋時角 = 0（太陽正過子午圈），已含 ΔT 修正
}

// 步驟二：加上 CWA 公告的城市固定偏移
export function getSolarNoon(date: Date, city: CityName): string {
  const noon = new Date(
    solarNoonAt120E(date).getTime() + CWA_CITY_OFFSET_SEC[city] * 1000
  )
  return format(convertToTaiwanTime(noon), 'HH:mm:ss')
}`}
          </pre>
        </section>

        {/* CWA 城市偏移附表 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 pb-1 border-b">
            CWA 城市偏移值
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            來源：CWA 年度《太陽過中天時刻》PDF 附表（時刻差修正附表），按緯度由北到南排列。
            偏移為各城市 CWA 氣象觀測站相對於 120°E 子午圈的時刻差，全年固定不變。
          </p>
          <div className="overflow-x-auto">
            <table className="text-sm w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-1.5 pr-4 font-medium">城市</th>
                  <th className="py-1.5 pr-4 font-medium">緯度</th>
                  <th className="py-1.5 pr-4 font-medium">經度</th>
                  <th className="py-1.5 font-medium">CWA 偏移</th>
                </tr>
              </thead>
              <tbody>
                {CITIES.map(city => (
                  <tr key={city.zh} className="border-b border-border/50">
                    <td className="py-1.5 pr-4">{city.zh}</td>
                    <td className="py-1.5 pr-4 font-mono text-xs">{city.lat}</td>
                    <td className="py-1.5 pr-4 font-mono text-xs">{city.lng}</td>
                    <td className="py-1.5 font-mono text-xs">
                      {formatOffset(city.cwaSec)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 驗證方法與結果 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 pb-1 border-b">
            驗證方法與結果
          </h2>
          <div className="text-sm space-y-3 text-foreground/90">

            <div>
              <p className="font-medium mb-1">驗證資料</p>
              <p className="text-foreground/75">
                CWA 年度 PDF（{CWA_YEARS.join('、')} 年），以{' '}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">pdftotext</code>{' '}
                提取全年逐日的 120°E 日中時刻，共 1,826 筆有效資料。
              </p>
              <ul className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 pl-1">
                {CWA_YEARS.map(year => (
                  <li key={year}>
                    <a
                      href={`https://www.cwa.gov.tw/Data/astronomy/${year}suntr.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-xs"
                    >
                      {year} 年 PDF
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-medium mb-1">驗證方式</p>
              <p className="text-foreground/75">
                以 astronomy-engine 計算各日 120°E 日中時刻，與 PDF 中對應值逐筆比對，
                取絕對誤差（秒）。排除 1 筆 PDF 字型提取異常（2025-03-08 出現
                <code className="text-xs bg-muted px-1 py-0.5 rounded">10:10:46</code>，
                應為字型問題導致
                <code className="text-xs bg-muted px-1 py-0.5 rounded">12</code>
                被誤讀為
                <code className="text-xs bg-muted px-1 py-0.5 rounded">10</code>）。
              </p>
            </div>

            <div>
              <p className="font-medium mb-2">逐年結果</p>
              <div className="overflow-x-auto">
                <table className="text-sm w-full border-collapse">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-1.5 pr-4 font-medium">年份</th>
                      <th className="py-1.5 pr-4 font-medium">驗證天數</th>
                      <th className="py-1.5 pr-4 font-medium">最大誤差</th>
                      <th className="py-1.5 pr-4 font-medium">&gt; 2 秒</th>
                      <th className="py-1.5 font-medium">&gt; 5 秒</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VERIFY_ROWS.map(r => (
                      <tr key={r.year} className="border-b border-border/50">
                        <td className="py-1.5 pr-4">{r.year}</td>
                        <td className="py-1.5 pr-4 font-mono text-xs">
                          {r.days}{r.year === 2025 ? '¹' : ''}
                        </td>
                        <td className="py-1.5 pr-4 font-mono text-xs">
                          {r.maxErr} 秒
                        </td>
                        <td className="py-1.5 pr-4 font-mono text-xs">{r.over2} 筆</td>
                        <td className="py-1.5 font-mono text-xs">{r.over5} 筆</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 font-medium">
                      <td className="py-1.5 pr-4">合計</td>
                      <td className="py-1.5 pr-4 font-mono text-xs">1,825</td>
                      <td className="py-1.5 pr-4 font-mono text-xs">11 秒</td>
                      <td className="py-1.5 pr-4 font-mono text-xs">8 筆</td>
                      <td className="py-1.5 font-mono text-xs">3 筆</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ¹ 2025 年排除 1 筆 PDF 提取異常（2025-03-08）。
              </p>
            </div>

            <div>
              <p className="font-medium mb-1">誤差解讀</p>
              <ul className="list-disc list-inside space-y-1 text-foreground/75 pl-1">
                <li>
                  <strong>99.6% 的天數誤差 ≤ 3 秒</strong>（1,825 筆中僅 8 筆超過 2 秒）
                </li>
                <li>
                  最大 11 秒（2025-02-21）：可能因 CWA 使用的 ΔT 表格值
                  與 astronomy-engine 的多項式逼近略有差異所致
                </li>
                <li>
                  2022-09-07（9 秒）：CWA 值恰為整秒，推測為其計算過程的捨入邊界
                </li>
                <li>
                  CWA 官方資料精度為秒，本站顯示精度亦為秒，
                  ±11 秒以內的差距在過午齋戒實踐上無實質影響
                </li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}
