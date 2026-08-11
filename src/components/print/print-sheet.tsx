import type { CSSProperties } from 'react'

import { PrintMonthGrid } from './print-month-grid'
import { CITY_NAMES_ZH, type CityName } from '@/lib/solar-noon'
import {
  paperDimensions,
  type MonthsPerPage,
  type Orientation,
  type PaperSize,
  type PrintContent,
  type PrintMonth,
} from '@/lib/print-calendar'

/** 每頁月數 × 紙張方向 → 月曆的欄列數 */
export const sheetGrid = (
  monthsPerPage: MonthsPerPage,
  orientation: Orientation,
): { cols: number; rows: number } => {
  const landscape = orientation === 'landscape'
  switch (monthsPerPage) {
    case 1:
      return { cols: 1, rows: 1 }
    case 2:
      return landscape ? { cols: 2, rows: 1 } : { cols: 1, rows: 2 }
    case 3:
      return landscape ? { cols: 3, rows: 1 } : { cols: 1, rows: 3 }
    case 4:
      return { cols: 2, rows: 2 }
  }
}

interface PrintSheetProps {
  months: PrintMonth[]
  show: PrintContent
  monthsPerPage: MonthsPerPage
  paper: PaperSize
  orientation: Orientation
  city: CityName
  previewScale: number
}

export function PrintSheet({
  months,
  show,
  monthsPerPage,
  paper,
  orientation,
  city,
  previewScale,
}: PrintSheetProps) {
  const { w, h } = paperDimensions(paper, orientation)
  const { cols, rows } = sheetGrid(monthsPerPage, orientation)

  const style = {
    '--sheet-w': `${w}mm`,
    '--sheet-h': `${h}mm`,
    '--preview-scale': previewScale,
  } as CSSProperties

  return (
    <div className="print-sheet-frame" style={style}>
      <div className="print-sheet" data-per={monthsPerPage}>
        <div
          className="print-months"
          style={{ '--cols': cols, '--rows': rows } as CSSProperties}
        >
          {months.map(month => (
            <PrintMonthGrid
              key={month.key}
              month={month}
              show={show}
              monthsPerPage={monthsPerPage}
            />
          ))}
        </div>

        <SheetLegend show={show} city={city} />
      </div>
    </div>
  )
}

function SheetLegend({ show, city }: { show: PrintContent; city: CityName }) {
  const items: string[] = []
  if (show.posadha) items.push('○ 白月布薩', '● 黑月布薩')
  if (show.fasting) items.push('齋 六齋日', '長 長齋月')
  if (show.solarNoon) items.push(`時間為過午時刻（${CITY_NAMES_ZH[city]}）`)

  if (items.length === 0) return null

  return (
    <div className="print-legend">
      <div className="print-legend-items">
        {items.map(item => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <span className="print-legend-source">佛教齋戒行事曆</span>
    </div>
  )
}
