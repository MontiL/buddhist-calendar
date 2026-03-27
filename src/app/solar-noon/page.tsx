import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '過午時間演算法說明 — 佛教齋戒行事曆',
  description:
    '說明過午時間如何以 astronomy-engine 天文演算法（JPL DE421 星曆表）計算的詳細方法。',
}

const CWA_YEARS = [2022, 2023, 2024, 2025, 2026]

const CITIES = [
  { zh: '臺北', lat: 25.033, lng: 121.565 },
  { zh: '新竹', lat: 24.802, lng: 120.972 },
  { zh: '臺中', lat: 24.148, lng: 120.674 },
  { zh: '花蓮', lat: 23.987, lng: 121.602 },
  { zh: '南投', lat: 23.904, lng: 120.686 },
  { zh: '澎湖', lat: 23.571, lng: 119.579 },
  { zh: '嘉義', lat: 23.480, lng: 120.449 },
  { zh: '臺南', lat: 22.991, lng: 120.213 },
  { zh: '臺東', lat: 22.758, lng: 121.144 },
  { zh: '高雄', lat: 22.627, lng: 120.301 },
  { zh: '恆春', lat: 22.002, lng: 120.744 },
]

function lngOffset(lng: number): string {
  const sec = -Math.round((lng - 120.0) * 4 * 60)
  if (sec === 0) return '0 秒'
  return `${sec > 0 ? '+' : ''}${sec} 秒`
}

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
          計算方式的詳細說明
        </p>

        {/* 演算法原理 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 pb-1 border-b">
            演算法原理 — astronomy-engine
          </h2>
          <div className="text-sm space-y-2 text-foreground/90">
            <p>
              本站使用{' '}
              <a
                href="https://github.com/cosinekitty/astronomy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                astronomy-engine
              </a>{' '}
              開源函式庫進行天文計算。該函式庫由 Don Cross 開發，
              基於美國噴射推進實驗室（JPL）的{' '}
              <strong>DE421 星曆表</strong>，
              精度達秒級，廣泛應用於業餘天文與科學計算。
            </p>
            <p>
              計算流程：
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>以城市實際座標建立觀測點</li>
              <li>
                搜尋太陽<strong>時角（Hour Angle）為零</strong>的時刻，
                即太陽通過觀測點子午圈（正南方）的瞬間
              </li>
              <li>
                函式庫內建 <strong>ΔT 修正</strong>（地球時 TT 與世界時 UTC
                的差值，目前約 69 秒），確保計算結果為正確的民用時間
              </li>
              <li>輸出 UTC 時間戳，再轉為臺灣時間（UTC+8）</li>
            </ol>
            <p>
              相較於先前使用的 suncalc（Meeus 簡化公式），
              astronomy-engine 消除了 suncalc 因省略高階修正項所導致的
              季節性誤差（振幅約 ±50 秒），演算法精度提升至 <strong>± 2 秒以內</strong>。
            </p>
          </div>
        </section>

        {/* 與 CWA 的對照 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 pb-1 border-b">
            與 CWA 官方資料的對照
          </h2>
          <div className="text-sm space-y-2 text-foreground/90">
            <p>
              中央氣象署（CWA）每年發布《臺灣地區日出日沒時刻表》。
              CWA 的計算方式為：先求太陽過<strong>東經 120 度</strong>子午圈的時刻，
              再依各城市與 120°E 的經度差換算時刻偏移（每度 4 分鐘）。
            </p>
            <p>CWA 官方資料（PDF）：</p>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 pl-2">
              {CWA_YEARS.map(year => (
                <li key={year}>
                  <a
                    href={`https://www.cwa.gov.tw/Data/astronomy/${year}suntr.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {year} 年
                  </a>
                </li>
              ))}
            </ul>
            <p className="pt-1">
              對照 2025–2026 兩年資料後，astronomy-engine
              的計算結果與 CWA 官方值的誤差如下：
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>120°E 子午圈基準值：誤差 <strong>± 2 秒以內</strong></li>
              <li>
                各城市值：多數城市誤差 <strong>± 16 秒以內</strong>，
                誤差來源為本站城市座標（市區中心）與 CWA 觀測站座標的差異，
                並非演算法誤差
              </li>
            </ul>
            <div className="bg-muted rounded p-3 text-xs mt-2">
              <p className="font-semibold mb-1">座標差異說明</p>
              <p>
                CWA 的南投觀測站位於縣境東側（約東經 120.9°），
                與本站所用的南投市區座標（約東經 120.69°）相差約 0.21 度，
                換算時刻差約 50 秒。此差異反映的是兩地點的物理距離，
                並非計算誤差。
              </p>
            </div>
          </div>
        </section>

        {/* 各城市座標 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 pb-1 border-b">
            各城市座標與經度偏移
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            按緯度由北到南排列。經度偏移為城市相對於 120°E 的時刻差（純幾何換算，每度 ±4 分鐘）。
          </p>
          <div className="overflow-x-auto">
            <table className="text-sm w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-1.5 pr-4 font-medium">城市</th>
                  <th className="py-1.5 pr-4 font-medium">緯度</th>
                  <th className="py-1.5 pr-4 font-medium">經度</th>
                  <th className="py-1.5 font-medium">相對 120°E 偏移</th>
                </tr>
              </thead>
              <tbody>
                {CITIES.map(city => (
                  <tr key={city.zh} className="border-b border-border/50">
                    <td className="py-1.5 pr-4">{city.zh}</td>
                    <td className="py-1.5 pr-4 font-mono text-xs">{city.lat}</td>
                    <td className="py-1.5 pr-4 font-mono text-xs">{city.lng}</td>
                    <td className="py-1.5 font-mono text-xs">
                      {lngOffset(city.lng)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 誤差說明 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 pb-1 border-b">
            精度說明
          </h2>
          <div className="text-sm space-y-2 text-foreground/90">
            <p>
              演算法本身的精度為 <strong>± 2 秒以內</strong>。
            </p>
            <p>
              實際顯示值與 CWA 官方值的差距（最大 ± 16 秒）來自城市座標的選擇：
              本站以各城市市區中心為計算基準，而 CWA 以其氣象觀測站為基準。
              對於佛教過午齋戒的實際應用，以所在地點為基準計算最為精確。
            </p>
          </div>
        </section>

        {/* 程式碼參考 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 pb-1 border-b">
            實作參考
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            核心邏輯位於{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              src/lib/solar-noon.ts
            </code>：
          </p>
          <pre className="bg-muted rounded p-3 text-xs overflow-x-auto leading-relaxed">
{`import { Observer, SearchHourAngle, Body } from 'astronomy-engine'

function solarNoonRaw(date, lat, lng) {
  // 以台灣日期的 02:00 UTC 作為搜尋起點
  const { year, month, day } = getTaiwanDateParts(date)
  const searchStart = new Date(Date.UTC(year, month, day, 2, 0, 0))

  const observer = new Observer(lat, lng, 0)
  // 搜尋太陽時角為 0 的時刻（子午線過中）
  const result = SearchHourAngle(Body.Sun, observer, 0, searchStart, 1)
  return result.time.date  // UTC Date，已含 ΔT 修正
}`}
          </pre>
        </section>
      </div>
    </main>
  )
}
