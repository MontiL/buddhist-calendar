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
  /** 對折時各面板自帶的圖例；不對折時整張紙共用一份，這裡傳 null。 */
  legend?: ReactNode
}

export function PrintMonthGrid({
  month,
  show,
  monthsPerPage,
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
    <div className="print-month">
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
}: {
  day: PrintDay
  show: PrintContent
  verbosePosadha: boolean
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
  const hasMarks = Boolean(posadha || sixthDay || longFast)

  return (
    <div className="print-cell">
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
          {posadha && (
            <>
              <span
                className="print-mark-moon"
                data-phase={posadha === 'WHITE' ? 'white' : 'black'}
              />
              {verbosePosadha && (
                <span className="print-mark-text">
                  {posadha === 'WHITE' ? '白月布薩' : '黑月布薩'}
                </span>
              )}
            </>
          )}
          {sixthDay && <span className="print-mark-tag">齋</span>}
          {longFast && <span className="print-mark-tag">長</span>}
        </div>
      )}

      {festival && <div className="print-festival">{festival}</div>}
    </div>
  )
}
