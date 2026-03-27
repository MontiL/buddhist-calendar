import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '過午時間演算法說明 — 佛教齋戒行事曆',
  description:
    '說明過午時間如何以 suncalc 天文演算法計算，並以中央氣象署（CWA）官方值校正的詳細方法。',
}

const CWA_YEARS = [2022, 2023, 2024, 2025, 2026]

const CITIES = [
  { zh: '臺北', lat: 25.033, lng: 121.565, correction: +20 },
  { zh: '新竹', lat: 24.802, lng: 120.972, correction: -2 },
  { zh: '臺中', lat: 24.148, lng: 120.674, correction: +4 },
  { zh: '花蓮', lat: 23.987, lng: 121.602, correction: +5 },
  { zh: '南投', lat: 23.904, lng: 120.686, correction: -46 },
  { zh: '澎湖', lat: 23.571, lng: 119.579, correction: +5 },
  { zh: '嘉義', lat: 23.480, lng: 120.449, correction: 0 },
  { zh: '臺南', lat: 22.991, lng: 120.213, correction: +8 },
  { zh: '臺東', lat: 22.758, lng: 121.144, correction: -3 },
  { zh: '高雄', lat: 22.627, lng: 120.301, correction: +5 },
  { zh: '恆春', lat: 22.002, lng: 120.744, correction: +12 },
]

function formatCorrection(sec: number): string {
  if (sec === 0) return '0 秒（基準城市）'
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
          計算方式與 CWA 校正方法的詳細說明
        </p>

        {/* 演算法原理 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 pb-1 border-b">
            演算法原理 — suncalc
          </h2>
          <div className="text-sm space-y-2 text-foreground/90">
            <p>
              本站使用{' '}
              <a
                href="https://github.com/mourner/suncalc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                suncalc
              </a>{' '}
              開源函式庫進行天文計算。suncalc 由{' '}
              <a
                href="https://agafonkin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Vladimir Agafonkin
              </a>（Leaflet.js 作者、Mapbox 工程師）開發與維護，
              在 GitHub 上有 3,353 顆星、npm 每週下載量逾 13 萬次，
              被以下知名開源專案採用：
            </p>
            <ul className="space-y-1 pl-2">
              <li>
                <a
                  href="https://github.com/MagicMirrorOrg/MagicMirror"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  MagicMirror²
                </a>{' '}
                — 智慧魔鏡平台（23,000+ stars），內建時鐘模組以 suncalc 計算日出日沒
              </li>
              <li>
                <a
                  href="https://github.com/betaflight/betaflight-configurator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Betaflight Configurator
                </a>{' '}
                — 全球最廣泛使用的 FPV 無人機韌體設定工具（3,100+ stars）
              </li>
              <li>
                <a
                  href="https://flows.nodered.org/node/node-red-node-suncalc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  node-red-node-suncalc
                </a>{' '}
                — Node-RED 官方節點，用於智慧家庭自動化的日照觸發
              </li>
              <li>
                <a
                  href="https://github.com/Smithsonian/dpo-voyager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Smithsonian dpo-voyager
                </a>{' '}
                — 史密森尼學會的 3D 文物數位典藏展示平台
              </li>
              <li>
                <a
                  href="https://suncalc.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  suncalc.net
                </a>{' '}
                — 作者本人建立的互動式太陽位置地圖，也是此函式庫的原始應用
              </li>
            </ul>
            <p>
              其計算公式源自天文學標準著作
              Jean Meeus《Astronomical Algorithms》（第二版），
              該書是天文程式設計的主要參考文獻，公式經學術界長期驗證。
              suncalc 利用儒略日（Julian Day）與太陽時角（hour angle）公式，
              計算指定日期、地理座標下的太陽正中時刻（solar noon）。
            </p>
            <p>
              計算流程：
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>將輸入日期轉換為儒略日</li>
              <li>計算太陽平均黃道經度與地球軌道修正量（equation of time）</li>
              <li>依給定緯度、經度求太陽通過子午線的時刻</li>
              <li>輸出 UTC 時間戳，再轉為臺灣時間（UTC+8）</li>
            </ol>
          </div>
        </section>

        {/* CWA 校正方法 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 pb-1 border-b">
            CWA 校正方法
          </h2>
          <div className="text-sm space-y-2 text-foreground/90">
            <p>
              中央氣象署（CWA）每年發布《臺灣地區日出日沒時刻表》，包含全臺各城市每日的日出、
              日沒及正午時刻（精度至分鐘）。以此為標準對 suncalc 結果進行比對校正。
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
              比對 2022–2026 五年資料後發現，suncalc 的計算值系統性地比 CWA
              官方值偏晚約 <strong>75 秒</strong>，因此套用基準校正 −75 秒。
              此後再針對各城市計算殘差，求出個別的城市修正量，使誤差降至 ±10 秒以內。
            </p>
            <div className="bg-muted rounded p-3 font-mono text-xs mt-2">
              校正後時間 = suncalc 原值 − 75 秒 + 城市修正量
            </div>
          </div>
        </section>

        {/* 各城市校正值 */}
        <section className="mb-8">
          <h2 className="text-base font-semibold mb-3 pb-1 border-b">
            各城市座標與校正值
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            按緯度由北到南排列。城市修正量為在基準校正（−75 秒）之外額外疊加的值。
          </p>
          <div className="overflow-x-auto">
            <table className="text-sm w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-1.5 pr-4 font-medium">城市</th>
                  <th className="py-1.5 pr-4 font-medium">緯度</th>
                  <th className="py-1.5 pr-4 font-medium">經度</th>
                  <th className="py-1.5 font-medium">城市修正量</th>
                </tr>
              </thead>
              <tbody>
                {CITIES.map(city => (
                  <tr key={city.zh} className="border-b border-border/50">
                    <td className="py-1.5 pr-4">{city.zh}</td>
                    <td className="py-1.5 pr-4 font-mono text-xs">{city.lat}</td>
                    <td className="py-1.5 pr-4 font-mono text-xs">{city.lng}</td>
                    <td className="py-1.5 font-mono text-xs">
                      {formatCorrection(city.correction)}
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
            誤差說明
          </h2>
          <div className="text-sm space-y-2 text-foreground/90">
            <p>
              校正後，大多數城市的誤差在 <strong>±10 秒以內</strong>。
            </p>
            <p>
              嘉義作為計算中的基準城市（城市修正量為 0），
              其殘差分布略大於其他城市，實際偏差偶爾會超過 10 秒。
              CWA 官方資料的精度為分鐘，因此無法完全消除秒級誤差。
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
{`// 基準校正：suncalc 比 CWA 官方值平均晚 75 秒
const CWA_BASE_CORRECTION_MS = -75 * 1000

// 城市層級校正值（秒）
const CITY_CORRECTION_SEC = {
  taipei: 20, hsinchu: -2, taichung: 4,
  hualien: 5, nantou: -46, penghu: 5,
  chiayi: 0,  tainan: 8,   taitung: -3,
  kaohsiung: 5, hengchun: 12,
}

function getSolarNoon(date, city) {
  const { lat, lng } = CITY_COORDINATES[city]
  const times = SunCalc.getTimes(date, lat, lng)
  const correctionMs =
    CWA_BASE_CORRECTION_MS +
    CITY_CORRECTION_SEC[city] * 1000
  const corrected = new Date(
    times.solarNoon.getTime() + correctionMs
  )
  return format(convertToTaiwanTime(corrected), 'HH:mm:ss')
}`}
          </pre>
        </section>
      </div>
    </main>
  )
}
