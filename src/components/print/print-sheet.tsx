import type { CSSProperties } from 'react'

import { PrintLegend } from './print-legend'
import { PrintMonthGrid } from './print-month-grid'
import type { CityName } from '@/lib/solar-noon'
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

/** print.css 的 --sheet-margin，以及對折時的 --fold-gutter（= 2 × margin） */
const SHEET_MARGIN_MM = 10
const NORMAL_GUTTER_MM = 7

/** 標題 + 副標 + 週標題列 + 圖例大約吃掉的高度 */
const PANEL_CHROME_MM = 15

/**
 * 六週月份的儲存格尺寸（mm）。字級已經卡在 6.5pt 的下限不能再縮，所以格子
 * 太小時內容一定會被裁掉 —— 與其無聲印出殘缺的紙，不如先在設定面板講清楚。
 */
export const cellSizeMm = (
  paper: PaperSize,
  orientation: Orientation,
  monthsPerPage: MonthsPerPage,
  fold: boolean,
): { rowMm: number; colMm: number } => {
  const { w, h } = paperDimensions(paper, orientation)
  const { cols, rows } = sheetGrid(monthsPerPage, orientation)
  const gutter =
    fold && monthsPerPage === 2 ? SHEET_MARGIN_MM * 2 : NORMAL_GUTTER_MM
  const panelH = (h - SHEET_MARGIN_MM * 2 - (rows - 1) * gutter) / rows
  const panelW = (w - SHEET_MARGIN_MM * 2 - (cols - 1) * gutter) / cols
  return { rowMm: (panelH - PANEL_CHROME_MM) / 6, colMm: panelW / 7 }
}

/**
 * 會被裁到的條件是「列不夠高」與「欄不夠寬」同時成立：欄夠寬時內容折行少，
 * 矮列也塞得下（B5 直向三個月列高只有 9.5mm，但欄寬 22mm，仍然完整）。
 * 門檻取自實測：A4 橫向四個月（12.8mm × 19.3mm）完整，B5 橫向四個月
 * （9.9mm × 15.9mm）會被裁。
 */
export const MIN_ROW_MM = 11.5
export const MIN_COL_MM = 20

/** 對折軸向：'h' 橫向對折（上下兩半）、'v' 直向對折（左右兩半）、null 不對折。 */
type FoldAxis = 'h' | 'v' | null

/**
 * 只有「每頁兩個月」值得預留摺線：那正好把紙對折成兩個面板。
 * per=4 雖然兩軸都是 2 軌，但沒有人會把 A4 對折兩次成 A6，套用只會白白
 * 吃掉 6.5mm 的面板寬度。
 */
const foldAxis = (
  monthsPerPage: MonthsPerPage,
  cols: number,
  rows: number,
  fold: boolean,
): FoldAxis => {
  if (!fold || monthsPerPage !== 2) return null
  return rows === 2 ? 'h' : cols === 2 ? 'v' : null
}

interface PrintSheetProps {
  months: PrintMonth[]
  show: PrintContent
  monthsPerPage: MonthsPerPage
  paper: PaperSize
  orientation: Orientation
  city: CityName
  fold: boolean
  previewScale: number
}

export function PrintSheet({
  months,
  show,
  monthsPerPage,
  paper,
  orientation,
  city,
  fold,
  previewScale,
}: PrintSheetProps) {
  const { w, h } = paperDimensions(paper, orientation)
  const { cols, rows } = sheetGrid(monthsPerPage, orientation)
  const axis = foldAxis(monthsPerPage, cols, rows, fold)

  const style = {
    '--sheet-w': `${w}mm`,
    '--sheet-h': `${h}mm`,
    '--preview-scale': previewScale,
  } as CSSProperties

  return (
    <div className="print-sheet-frame" style={style}>
      <div
        className="print-sheet"
        data-per={monthsPerPage}
        data-cols={cols}
        data-paper={paper}
        data-fold={axis ?? 'none'}
      >
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
              // 對折後每一半都要能獨立看懂，圖例改印在各自的面板底部
              legend={axis ? <PrintLegend show={show} city={city} /> : null}
            />
          ))}
        </div>

        {axis === null && <PrintLegend show={show} city={city} />}

        {axis !== null && (
          <>
            <span className="print-fold-tick" data-edge="start" />
            <span className="print-fold-tick" data-edge="end" />
          </>
        )}
      </div>
    </div>
  )
}
