'use client'

import { PrinterIcon } from 'lucide-react'

import { MonthPicker } from './month-picker'
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
  show: PrintContent
  city: CityName
  pageCount: number
  onMonthsChange: (next: Set<MonthKey>) => void
  onPaperChange: (paper: PaperSize) => void
  onOrientationChange: (orientation: Orientation) => void
  onMonthsPerPageChange: (value: MonthsPerPage) => void
  onShowChange: (key: keyof PrintContent, value: boolean) => void
  onCityChange: (city: CityName) => void
  onPrint: () => void
}

export function PrintSettings({
  months,
  paper,
  orientation,
  monthsPerPage,
  show,
  city,
  pageCount,
  onMonthsChange,
  onPaperChange,
  onOrientationChange,
  onMonthsPerPageChange,
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
