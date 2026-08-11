import type { CSSProperties } from 'react'

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
}

export function PrintMonthGrid({
  month,
  show,
  monthsPerPage,
}: PrintMonthGridProps) {
  // 版面愈密，布薩只留符號，不印「白月布薩」四字
  const verbosePosadha = monthsPerPage <= 2

  return (
    <div className="print-month">
      <h2 className="print-month-title">{month.title}</h2>
      {show.fasting && month.hasLongFastMonth && (
        <p className="print-month-note">本月含長齋月</p>
      )}

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
      </div>

      {hasMarks && (
        <div className="print-marks">
          {posadha && (
            <>
              <span className="print-mark-moon">
                {posadha === 'WHITE' ? '○' : '●'}
              </span>
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

      {show.solarNoon && <div className="print-noon">{day.solarNoon}</div>}
    </div>
  )
}
