'use client'

import { PrinterIcon } from 'lucide-react'

import { MonthPicker } from './month-picker'
import { MIN_COL_MM, MIN_ROW_MM, cellSizeMm } from './print-sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { CityPicker } from '@/components/city-picker'
import type { CityName } from '@/lib/solar-noon'
import {
  PAPER_MM,
  PAPER_SIZES,
  type MonthKey,
  type MonthsPerPage,
  type Orientation,
  type PaperSize,
  type PrintContent,
} from '@/lib/print-calendar'

const MONTHS_PER_PAGE: MonthsPerPage[] = [1, 2, 3, 4]

const CONTENT_LABELS: { key: keyof PrintContent; label: string }[] = [
  { key: 'lunar', label: '農曆日期' },
  { key: 'festival', label: '佛菩薩紀念日' },
  { key: 'fasting', label: '齋日' },
  { key: 'posadha', label: '布薩日' },
  { key: 'solarNoon', label: '過午時間' },
]

interface PrintSettingsProps {
  months: Set<MonthKey>
  paper: PaperSize
  orientation: Orientation
  monthsPerPage: MonthsPerPage
  fold: boolean
  show: PrintContent
  city: CityName
  pageCount: number
  onMonthsChange: (next: Set<MonthKey>) => void
  onPaperChange: (paper: PaperSize) => void
  onOrientationChange: (orientation: Orientation) => void
  onMonthsPerPageChange: (value: MonthsPerPage) => void
  onFoldChange: (value: boolean) => void
  onShowChange: (key: keyof PrintContent, value: boolean) => void
  onCityChange: (city: CityName) => void
  onPrint: () => void
}

export function PrintSettings({
  months,
  paper,
  orientation,
  monthsPerPage,
  fold,
  show,
  city,
  pageCount,
  onMonthsChange,
  onPaperChange,
  onOrientationChange,
  onMonthsPerPageChange,
  onFoldChange,
  onShowChange,
  onCityChange,
  onPrint,
}: PrintSettingsProps) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="月份">
        <MonthPicker selected={months} onChange={onMonthsChange} />
      </Field>

      <Separator />

      <Field label="紙張大小">
        <div className="grid grid-cols-2 gap-1">
          {PAPER_SIZES.map(size => (
            <SegmentButton
              key={size}
              active={paper === size}
              onClick={() => onPaperChange(size)}
            >
              {size}
            </SegmentButton>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {PAPER_MM[paper].label}
        </p>
      </Field>

      <Field label="紙張方向">
        <div className="grid grid-cols-2 gap-1">
          <SegmentButton
            active={orientation === 'portrait'}
            onClick={() => onOrientationChange('portrait')}
          >
            直向
          </SegmentButton>
          <SegmentButton
            active={orientation === 'landscape'}
            onClick={() => onOrientationChange('landscape')}
          >
            橫向
          </SegmentButton>
        </div>
      </Field>

      <Field label="每頁月數">
        <div className="grid grid-cols-4 gap-1">
          {MONTHS_PER_PAGE.map(value => (
            <SegmentButton
              key={value}
              active={monthsPerPage === value}
              onClick={() => onMonthsPerPageChange(value)}
            >
              {value}
            </SegmentButton>
          ))}
        </div>
      </Field>

      {/* 對折只在「每頁兩個月」時成立：正好把紙折成兩個面板 */}
      {monthsPerPage === 2 && (
        <Field label="對折">
          <label className="flex cursor-pointer items-center justify-between text-sm select-none">
            <span>預留摺線留白</span>
            <Switch checked={fold} onCheckedChange={onFoldChange} />
          </label>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {fold
              ? '摺線兩側各留 10mm 空白，並在紙邊印出摺線記號。'
              : '版面較滿，但對折時摺痕可能壓到月份標題。'}
          </p>
        </Field>
      )}

      <DensityWarning
        paper={paper}
        orientation={orientation}
        monthsPerPage={monthsPerPage}
        fold={fold}
      />

      <Separator />

      <Field label="列印內容">
        <div className="flex flex-col gap-2">
          {CONTENT_LABELS.map(({ key, label }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between text-sm select-none"
            >
              <span>{label}</span>
              <Switch
                checked={show[key]}
                onCheckedChange={v => onShowChange(key, v)}
              />
            </label>
          ))}
        </div>
      </Field>

      {show.solarNoon && (
        <Field label="過午時間城市">
          <CityPicker city={city} onCityChange={onCityChange} />
        </Field>
      )}

      <Separator />

      <div className="flex flex-col gap-2">
        <Button onClick={onPrint} disabled={pageCount === 0}>
          <PrinterIcon className="size-4" />
          列印／另存 PDF
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {months.size === 0
            ? '尚未選擇月份'
            : `已選 ${months.size} 個月 · 共 ${pageCount} 頁`}
        </p>
      </div>

      <PrintTips fold={fold} monthsPerPage={monthsPerPage} />
    </div>
  )
}

/**
 * 版面過密的提醒。字級有 6.5pt 的下限（再小超商影印機印不出來），所以格子
 * 太矮時就是塞不下，只能請使用者換紙張或減少每頁月數。
 */
function DensityWarning({
  paper,
  orientation,
  monthsPerPage,
  fold,
}: {
  paper: PaperSize
  orientation: Orientation
  monthsPerPage: MonthsPerPage
  fold: boolean
}) {
  const { rowMm, colMm } = cellSizeMm(paper, orientation, monthsPerPage, fold)
  if (rowMm >= MIN_ROW_MM || colMm >= MIN_COL_MM) return null

  return (
    <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-900 dark:text-amber-200">
      {paper} {orientation === 'landscape' ? '橫向' : '直向'}放 {monthsPerPage}{' '}
      個月，每格只剩約 {colMm.toFixed(1)} × {rowMm.toFixed(1)}
      mm，六週的月份會被裁掉部分內容。建議改用較大的紙張或減少每頁月數。
    </p>
  )
}

/**
 * 瀏覽器的列印對話框與超商影印機的設定，CSS 一律管不到，只能用文案提醒。
 * 縮放與頁首頁尾會直接毀掉這裡所有的版面計算。
 */
function PrintTips({
  fold,
  monthsPerPage,
}: {
  fold: boolean
  monthsPerPage: MonthsPerPage
}) {
  const tips = [
    '縮放請選「100%／實際大小」，不要用「符合頁面」。',
    '關閉「頁首及頁尾」。',
    '用 Chrome「另存為 PDF」後再上傳超商，字型才會一起嵌入。',
  ]

  if (monthsPerPage === 2 && fold) {
    // 短邊翻頁會把背面整個轉 180°，摺線位置雖然仍對齊，但背面的月份會上下顛倒
    tips.push('雙面請選「長邊翻頁」，否則背面會上下顛倒。')
  }

  return (
    <div className="rounded-md border bg-muted/40 p-3">
      <p className="mb-1.5 text-xs font-medium">超商／影印機列印提示</p>
      <ul className="flex list-disc flex-col gap-1 pl-4 text-xs text-muted-foreground">
        {tips.map(tip => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border py-1.5 text-sm transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'hover:bg-accent'
      }`}
    >
      {children}
    </button>
  )
}
