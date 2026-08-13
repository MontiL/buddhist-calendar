import { CITY_NAMES_ZH, type CityName } from '@/lib/solar-noon'
import type { PrintContent } from '@/lib/print-calendar'

/**
 * 符號說明。對折時由每個月份面板各印一份（摺完的每一半才能獨立看懂），
 * 未對折時整張紙共用一份，排在頁尾。
 *
 * 圖例裡的記號刻意複用 .print-mark-* 樣式，和格子裡畫的是同一個東西。
 */
export function PrintLegend({
  show,
  city,
}: {
  show: PrintContent
  city: CityName
}) {
  const hasAny =
    show.posadha || show.fasting || show.solarNoon

  if (!hasAny) return null

  return (
    <div className="print-legend">
      <div className="print-legend-items">
        {show.posadha && (
          <>
            <span className="print-legend-item">
              <span className="print-mark-moon" data-phase="white" />
              白月布薩
            </span>
            <span className="print-legend-item">
              <span className="print-mark-moon" data-phase="black" />
              黑月布薩
            </span>
          </>
        )}
        {show.fasting && (
          <>
            <span className="print-legend-item">
              <span className="print-mark-glyph">齋</span>
              六齋日
            </span>
            <span className="print-legend-item">
              <span className="print-legend-band" />
              長齋月
            </span>
          </>
        )}
        {show.solarNoon && (
          <span className="print-legend-item">
            時間為過午時刻（{CITY_NAMES_ZH[city]}）
          </span>
        )}
      </div>
      <span className="print-legend-source">佛教齋戒行事曆</span>
    </div>
  )
}
