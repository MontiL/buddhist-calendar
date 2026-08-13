import type { CSSProperties } from 'react'

import { PrintLegend } from './print-legend'
import { PrintMonthGrid } from './print-month-grid'
import type { CityName } from '@/lib/solar-noon'
import {
  FOLD_MODES,
  isFoldAllowed,
  paperDimensions,
  type FoldAxis,
  type FoldMode,
  type MonthsPerPage,
  type Orientation,
  type PaperSize,
  type PrintContent,
  type PrintMonth,
} from '@/lib/print-calendar'

/**
 * 每頁月數 → 月曆的欄列數。
 *
 * 每頁兩個月時由摺線軸主導：立牌的摺線軸是站法決定的物理事實，不能讓紙張
 * 方向反過來決定 —— 直立 V 的兩個面板必然左右並排，橫立 V 必然上下疊放。
 * 不摺（或收納對折）時才回到「橫向並排、直向疊放」的視覺慣例。
 */
export const sheetGrid = (
  monthsPerPage: MonthsPerPage,
  orientation: Orientation,
  foldMode: FoldMode = 'none',
): { cols: number; rows: number } => {
  const landscape = orientation === 'landscape'
  switch (monthsPerPage) {
    case 1:
      return { cols: 1, rows: 1 }
    case 2: {
      const axis = standAxis(foldMode, monthsPerPage)
      if (axis === 'v') return { cols: 2, rows: 1 }
      if (axis === 'h') return { cols: 1, rows: 2 }
      return landscape ? { cols: 2, rows: 1 } : { cols: 1, rows: 2 }
    }
    case 3:
      return landscape ? { cols: 3, rows: 1 } : { cols: 1, rows: 3 }
    case 4:
      return { cols: 2, rows: 2 }
  }
}

/** 立牌模式寫死的摺線軸；其餘模式回 null（交由紙張方向推導）。 */
const standAxis = (
  foldMode: FoldMode,
  monthsPerPage: MonthsPerPage,
): FoldAxis | null =>
  isFoldAllowed(foldMode, monthsPerPage) ? FOLD_MODES[foldMode].axis : null

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
  foldMode: FoldMode,
): { rowMm: number; colMm: number } => {
  const { w, h } = paperDimensions(paper, orientation)
  const { cols, rows } = sheetGrid(monthsPerPage, orientation, foldMode)
  const axis = foldAxis(foldMode, monthsPerPage, cols, rows)
  // 每頁四個月時只有摺線那一軸要撐開成 2 × margin，另一軸維持一般間距 ——
  // 兩軸一起撐開會白白吃掉 6.5mm 的面板寬度。
  const gutterX = axis === 'v' ? SHEET_MARGIN_MM * 2 : NORMAL_GUTTER_MM
  const gutterY = axis === 'h' ? SHEET_MARGIN_MM * 2 : NORMAL_GUTTER_MM
  const panelH = (h - SHEET_MARGIN_MM * 2 - (rows - 1) * gutterY) / rows
  const panelW = (w - SHEET_MARGIN_MM * 2 - (cols - 1) * gutterX) / cols
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

/**
 * 布薩圓點沉到儲存格右下角時要多佔一行高度。實測 32 種版面（紙張 × 方向 ×
 * 每頁月數，取全年最擠的月份）：每頁三／四個月，以及 B5 的所有版面，格子都
 * 矮到付不起這一行，紀念日名稱會被裁掉。這些版面改把圓點併入標記列右端 ——
 * 一樣靠右自成一欄，但不佔額外高度。
 */
const isCompactPosadha = (
  paper: PaperSize,
  monthsPerPage: MonthsPerPage,
): boolean => monthsPerPage > 2 || paper === 'B5'

/**
 * 摺線軸向。立牌模式的軸是站法決定的（standAxis），收納對折則沿用舊規則
 * 「哪一軸剛好分成兩軌就摺哪一軸」。
 *
 * 收納對折刻意只開放每頁兩個月：per=4 雖然兩軸都是 2 軌，但沒有人會把 A4
 * 對折兩次成 A6。立牌則不同 —— 它只摺一次，每一面放兩個月，所以開放 per=4。
 */
const foldAxis = (
  foldMode: FoldMode,
  monthsPerPage: MonthsPerPage,
  cols: number,
  rows: number,
): FoldAxis | null => {
  if (!isFoldAllowed(foldMode, monthsPerPage) || foldMode === 'none') return null
  const fixed = FOLD_MODES[foldMode].axis
  if (fixed) return fixed
  return rows === 2 ? 'h' : cols === 2 ? 'v' : null
}

/**
 * 排好版的一格。month 為 null 代表佔位空格 —— 月份數湊不滿整頁時，橫立 V
 * 仍必須把缺口留在正確的位置，否則後面的月份會滑進錯誤的那一半。
 */
type PlacedMonth = {
  month: PrintMonth | null
  rotated: boolean
  /**
   * 這一格要不要帶圖例。摺過的紙每一「面」都要能獨立看懂，所以圖例是屬於面板
   * 的，不是屬於月份的 —— 一面放兩個月時只印一份，印在該面視覺上的末端。
   */
  legend: boolean
  /** 螢幕預覽的正面／背面標籤，同樣每面只標一次（標在該面視覺上的起點）。 */
  face: 'front' | 'back' | null
}

/**
 * 把月份排進 grid 的放置順序（row-major），並標出要旋轉的格子。
 *
 * 只有橫立 V 需要重排：它的上半是摺後的背面，整塊會被轉 180°，而整塊旋轉
 * 會順帶把 grid 的左右對調 —— 所以放進去之前先反轉順序，兩次對調正好抵銷，
 * 摺完的背面才是由左至右的正常閱讀順序。不足的格子補在反轉後的最前面，
 * 摺完就落在背面的右側，缺口不會插進月份之間。
 *
 * 直立 V 的兩欄各是一個面板，兩面都正立，順序交給 CSS 的 grid-auto-flow:
 * column 處理（見 print.css）—— 這樣月份數湊不滿時也會自然地先填滿左欄。
 */
export const arrangeMonths = (
  months: PrintMonth[],
  foldMode: FoldMode,
  monthsPerPage: MonthsPerPage,
  cols: number,
  rows: number,
): PlacedMonth[] => {
  const axis = foldAxis(foldMode, monthsPerPage, cols, rows)
  const isStand = axis !== null && FOLD_MODES[foldMode].axis !== null

  if (!isStand) {
    // 收納對折同樣是摺過的紙，兩半各自帶一份圖例（每半只有一個月，規則相同）
    return months.map(month => ({
      month,
      rotated: false,
      legend: axis !== null,
      face: null,
    }))
  }

  if (axis === 'v') {
    // 左右兩欄各是一個面板，同一欄的月份上下疊放，圖例落在該欄最下面那個月
    const perPanel = rows
    return months.map((month, i) => ({
      month,
      rotated: false,
      legend: i % perPanel === perPanel - 1 || i === months.length - 1,
      face: null,
    }))
  }

  // 下半＝正面（正立），上半＝背面（旋轉）。grid 由上而下，故背面先放。
  // 背面旋轉後左右會顛倒：grid 的最後一格是視覺上的最左（標籤），第一格是
  // 視覺上的最右（圖例）。正面則照常，第一格最左、最後一格最右。
  const perPanel = cols
  const front = months.slice(0, perPanel)
  const back = months.slice(perPanel)
  const backSlots: (PrintMonth | null)[] = [
    ...Array<null>(perPanel - back.length).fill(null),
    ...[...back].reverse(),
  ]
  const backFirst = backSlots.findIndex(month => month !== null)

  return [
    ...backSlots.map((month, i) => ({
      month,
      rotated: true,
      legend: i === backFirst,
      face: (i === backSlots.length - 1 ? 'back' : null) as 'back' | null,
    })),
    ...front.map((month, i) => ({
      month,
      rotated: false,
      legend: i === front.length - 1,
      face: (i === 0 ? 'front' : null) as 'front' | null,
    })),
  ]
}

interface PrintSheetProps {
  months: PrintMonth[]
  show: PrintContent
  monthsPerPage: MonthsPerPage
  paper: PaperSize
  orientation: Orientation
  city: CityName
  foldMode: FoldMode
  previewScale: number
}

export function PrintSheet({
  months,
  show,
  monthsPerPage,
  paper,
  orientation,
  city,
  foldMode,
  previewScale,
}: PrintSheetProps) {
  const { w, h } = paperDimensions(paper, orientation)
  const { cols, rows } = sheetGrid(monthsPerPage, orientation, foldMode)
  const axis = foldAxis(foldMode, monthsPerPage, cols, rows)
  const placed = arrangeMonths(months, foldMode, monthsPerPage, cols, rows)

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
          {placed.map(({ month, rotated, legend, face }, index) =>
            month === null ? (
              // 湊不滿整頁時的佔位格：不畫任何東西，只是把缺口留在對的位置
              <div key={`gap-${index}`} className="print-month" aria-hidden />
            ) : (
              <PrintMonthGrid
                key={month.key}
                month={month}
                show={show}
                monthsPerPage={monthsPerPage}
                compactPosadha={isCompactPosadha(paper, monthsPerPage)}
                rotated={rotated}
                face={face}
                // 對折後每一面都要能獨立看懂，圖例改印在各自的面板末端
                legend={legend ? <PrintLegend show={show} city={city} /> : null}
              />
            ),
          )}
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
