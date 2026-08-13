import type { CSSProperties, ReactNode } from 'react'

import {
  WEEKDAY_LABELS,
  type MonthsPerPage,
  type PrintContent,
  type PrintDay,
  type PrintMonth,
} from '@/lib/print-calendar'

interface PrintMonthGridProps {
  month: PrintMonth
  show: PrintContent
  monthsPerPage: MonthsPerPage
  /**
   * 格子矮到放不下「布薩獨佔一行」時為 true，圓點改併入標記列右端。
   * 右下角比較顯眼，但要多佔一行高度；實測 32 種版面裡有 7 種付不起。
   */
  compactPosadha: boolean
  /**
   * 橫立 V 的背面（紙的上半）：繞水平軸對折會把「上」翻成「下」，所以要先在
   * 平張上轉 180°，摺完才是正立的。預覽裡看起來顛倒是正常的。
   */
  rotated?: boolean
  /**
   * 螢幕預覽的正面／背面標籤，每一面只標在視覺上的起點那一格；null 為不標。
   * 只有橫立 V 用得到（直立 V 兩面都正立，沒有正背之分）。
   */
  face?: 'front' | 'back' | null
  /** 對折時各面板自帶的圖例；不對折時整張紙共用一份，這裡傳 null。 */
  legend?: ReactNode
}

export function PrintMonthGrid({
  month,
  show,
  monthsPerPage,
  compactPosadha,
  rotated = false,
  face = null,
  legend = null,
}: PrintMonthGridProps) {
  // 只有整頁一個月才印「白月布薩」四字。每頁兩個月時欄寬只剩約 24mm，
  // 這四個字會把標記列擠到換行，連帶把整格內容頂出格外被裁掉；
  // 符號加上圖例已足以表達，多印四個字是純粹的風險。
  const verbosePosadha = monthsPerPage === 1

  // 標題下的副標，兩段合佔一行
  const notes: string[] = []
  if (show.lunar) notes.push(month.lunarSpan)
  if (show.fasting && month.hasLongFastMonth) notes.push('本月含長齋月')

  return (
    <div
      className="print-month"
      data-rotate={rotated ? '180' : undefined}
      data-face={face ?? undefined}
    >
      <h2 className="print-month-title">{month.title}</h2>
      {notes.length > 0 && (
        <p className="print-month-note">
          {notes.map(note => (
            <span key={note}>{note}</span>
          ))}
        </p>
      )}

      {/* 週標題必須是本格線的前 7 個子元素：print.css 的 :nth-child(7n)
          與 :nth-last-child(-n+7) 靠這個位置關係決定哪一格不畫框線。 */}
      <div
        className="print-grid"
        style={{ '--weeks': month.weeks.length } as CSSProperties}
      >
        {WEEKDAY_LABELS.map(label => (
          <div key={label} className="print-weekday">
            {label}
          </div>
        ))}

        {month.weeks.flat().map(day => (
          <DayCell
            key={day.date.getTime()}
            day={day}
            show={show}
            verbosePosadha={verbosePosadha}
            compactPosadha={compactPosadha}
          />
        ))}
      </div>

      {legend}
    </div>
  )
}

function DayCell({
  day,
  show,
  verbosePosadha,
  compactPosadha,
}: {
  day: PrintDay
  show: PrintContent
  verbosePosadha: boolean
  compactPosadha: boolean
}) {
  if (!day.inMonth) {
    return (
      <div className="print-cell is-out">
        <div className="print-cell-head">
          <span className="print-cell-day">{day.dayNumber}</span>
        </div>
      </div>
    )
  }

  const posadha = show.posadha && day.posadha
  const sixthDay = show.fasting && day.isSixthDay
  const longFast = show.fasting && day.isLongFastMonth
  const festival = show.festival ? day.festival : null
  // 布薩是最重要的日子，但每月只有兩天，值得自成一區而不是跟齋擠在同一列。
  // 格子夠高時沉到右下角（位置本身就是識別，整頁掃下來一眼就找得到）；
  // 太密的版面付不起這一行高度，就併入標記列右端，一樣靠右自成一欄。
  const posadhaMark = posadha ? (
    <span className={compactPosadha ? 'print-posadha is-inline' : 'print-posadha'}>
      {verbosePosadha && (
        <span className="print-mark-text">
          {posadha === 'WHITE' ? '白月布薩' : '黑月布薩'}
        </span>
      )}
      <span
        className="print-mark-moon"
        data-phase={posadha === 'WHITE' ? 'white' : 'black'}
      />
    </span>
  ) : null

  const hasMarks = Boolean(sixthDay || (compactPosadha && posadha))

  return (
    // 長齋月是橫跨整個農曆月的「期間」，不是每天各自發生的事，所以畫成儲存格
    // 左緣的實帶（連續日子會連成一道直帶），不再每天蓋一個「長」方框
    <div className="print-cell" data-long-fast={longFast ? '' : undefined}>
      <div className="print-cell-head">
        <span className="print-cell-day">{day.dayNumber}</span>
        {show.lunar && (
          <span className="print-cell-lunar">{day.lunarText}</span>
        )}
        {/* 靠右排在同一行。貼齊格底時視覺上會黏到下一週那列的日期。 */}
        {show.solarNoon && <span className="print-noon">{day.solarNoon}</span>}
      </div>

      {hasMarks && (
        <div className="print-marks">
          {sixthDay && <span className="print-mark-glyph">齋</span>}
          {compactPosadha && posadhaMark}
        </div>
      )}

      {festival && <div className="print-festival">{festival}</div>}

      {!compactPosadha && posadhaMark}
    </div>
  )
}
