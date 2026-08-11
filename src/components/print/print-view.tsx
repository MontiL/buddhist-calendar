'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeftIcon } from 'lucide-react'

import './print.css'
import { PrintSettings } from './print-settings'
import { PrintSheet } from './print-sheet'
import { useCity } from '@/hooks/use-city'
import {
  PAPER_MM,
  buildPrintMonth,
  monthKey,
  paperDimensions,
  parseMonthKey,
  sortMonthKeys,
  type MonthKey,
  type MonthsPerPage,
  type Orientation,
  type PaperSize,
  type PrintContent,
  type PrintMonth,
} from '@/lib/print-calendar'

const MM_TO_PX = 96 / 25.4
/** 預覽區左右內距 + 捲軸的寬度預留 */
const PREVIEW_GUTTER_PX = 48

const DEFAULT_SHOW: PrintContent = {
  lunar: true,
  festival: true,
  fasting: true,
  posadha: true,
  solarNoon: true,
}

const isPaperSize = (v: string | null): v is PaperSize =>
  v !== null && v in PAPER_MM

export function PrintView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { city, updateCity } = useCity()

  // URL 參數僅在掛載時讀取一次，之後由本地 state 主導並回寫網址
  const [months, setMonths] = useState<Set<MonthKey>>(() => {
    const raw = searchParams.get('months')
    if (raw) {
      const keys = raw.split(',').filter(k => /^\d{4}-\d{2}$/.test(k))
      if (keys.length > 0) return new Set(keys)
    }
    const now = new Date()
    return new Set([monthKey(now.getFullYear(), now.getMonth() + 1)])
  })

  const [paper, setPaper] = useState<PaperSize>(() => {
    const raw = searchParams.get('paper')
    return isPaperSize(raw) ? raw : 'A4'
  })

  const [orientation, setOrientation] = useState<Orientation>(() =>
    searchParams.get('orient') === 'landscape' ? 'landscape' : 'portrait',
  )

  const [monthsPerPage, setMonthsPerPage] = useState<MonthsPerPage>(() => {
    const raw = Number(searchParams.get('per'))
    return raw === 2 || raw === 3 || raw === 4 ? raw : 1
  })

  const [show, setShow] = useState<PrintContent>(() => {
    const raw = searchParams.get('show')
    if (raw === null) return DEFAULT_SHOW
    const enabled = new Set(raw.split(',').filter(Boolean))
    return {
      lunar: enabled.has('lunar'),
      festival: enabled.has('festival'),
      fasting: enabled.has('fasting'),
      posadha: enabled.has('posadha'),
      solarNoon: enabled.has('solarNoon'),
    }
  })

  // 設定回寫網址，讓列印設定可書籤、可分享
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('months', sortMonthKeys(months).join(','))
    params.set('paper', paper)
    params.set('orient', orientation)
    params.set('per', String(monthsPerPage))
    params.set(
      'show',
      (Object.keys(show) as (keyof PrintContent)[])
        .filter(key => show[key])
        .join(','),
    )
    router.replace(`/print?${params.toString()}`, { scroll: false })
  }, [months, paper, orientation, monthsPerPage, show, router])

  // 農曆與天文計算只跟月份、城市有關；改紙張或版面不重算
  const printMonths = useMemo<PrintMonth[]>(
    () =>
      sortMonthKeys(months).map(key => {
        const { year, month } = parseMonthKey(key)
        return buildPrintMonth(year, month, city)
      }),
    [months, city],
  )

  const pages = useMemo(() => {
    const chunks: PrintMonth[][] = []
    for (let i = 0; i < printMonths.length; i += monthsPerPage) {
      chunks.push(printMonths.slice(i, i + monthsPerPage))
    }
    return chunks
  }, [printMonths, monthsPerPage])

  const { w: sheetWidthMm, h: sheetHeightMm } = paperDimensions(paper, orientation)

  const previewRef = useRef<HTMLDivElement>(null)
  const [previewWidth, setPreviewWidth] = useState(0)

  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    const observer = new ResizeObserver(entries => {
      setPreviewWidth(entries[0].contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const previewScale = useMemo(() => {
    if (previewWidth === 0) return 1
    const available = previewWidth - PREVIEW_GUTTER_PX
    return Math.min(1, available / (sheetWidthMm * MM_TO_PX))
  }, [previewWidth, sheetWidthMm])

  const handleShowChange = useCallback(
    (key: keyof PrintContent, value: boolean) => {
      setShow(prev => ({ ...prev, [key]: value }))
    },
    [],
  )

  const handlePrint = useCallback(() => window.print(), [])

  return (
    <div className="print-layout flex min-h-screen flex-col md:flex-row">
      {/* 動態紙張尺寸：@page 的 size 無法透過 CSS 變數設定。
          尺寸來自 PAPER_MM 常數表的數字，不含任何使用者輸入。 */}
      <style>{`@page { size: ${sheetWidthMm}mm ${sheetHeightMm}mm; margin: 0 }`}</style>

      <aside className="no-print w-full shrink-0 border-b p-4 md:h-screen md:w-72 md:overflow-y-auto md:border-r md:border-b-0">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          返回行事曆
        </Link>

        <h1 className="mb-1 text-lg font-bold tracking-tight">列印月曆</h1>
        <p className="mb-4 text-xs text-muted-foreground">
          純墨線黑白版面，適合直接列印或另存 PDF。
        </p>

        <PrintSettings
          months={months}
          paper={paper}
          orientation={orientation}
          monthsPerPage={monthsPerPage}
          show={show}
          city={city}
          pageCount={pages.length}
          onMonthsChange={setMonths}
          onPaperChange={setPaper}
          onOrientationChange={setOrientation}
          onMonthsPerPageChange={setMonthsPerPage}
          onShowChange={handleShowChange}
          onCityChange={updateCity}
          onPrint={handlePrint}
        />
      </aside>

      <div
        ref={previewRef}
        className="print-preview-area flex-1 bg-muted/40 p-6 md:h-screen md:overflow-y-auto"
      >
        {pages.length === 0 ? (
          <p className="no-print py-20 text-center text-sm text-muted-foreground">
            請於左側選擇要列印的月份。
          </p>
        ) : (
          <div className="print-sheets flex flex-col items-center gap-6">
            {pages.map(pageMonths => (
              <PrintSheet
                key={pageMonths[0].key}
                months={pageMonths}
                show={show}
                monthsPerPage={monthsPerPage}
                paper={paper}
                orientation={orientation}
                city={city}
                previewScale={previewScale}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
