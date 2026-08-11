'use client'

import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  monthKey,
  monthKeyRange,
  parseMonthKey,
  type MonthKey,
} from '@/lib/print-calendar'

interface MonthPickerProps {
  selected: Set<MonthKey>
  onChange: (next: Set<MonthKey>) => void
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

export function MonthPicker({ selected, onChange }: MonthPickerProps) {
  const today = new Date()
  const [year, setYear] = useState(() => today.getFullYear())
  // Shift + 點擊的區間錨點
  const [anchor, setAnchor] = useState<MonthKey | null>(null)
  const [from, setFrom] = useState<MonthKey>(() =>
    monthKey(today.getFullYear(), today.getMonth() + 1),
  )
  const [to, setTo] = useState<MonthKey>(() =>
    monthKey(today.getFullYear(), today.getMonth() + 1),
  )

  const setKeys = (keys: MonthKey[]) => onChange(new Set(keys))

  const handleMonthClick = (month: number, shiftKey: boolean) => {
    const key = monthKey(year, month)

    if (shiftKey && anchor) {
      const next = new Set(selected)
      for (const k of monthKeyRange(anchor, key)) next.add(k)
      onChange(next)
      return
    }

    const next = new Set(selected)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    setAnchor(key)
    onChange(next)
  }

  const applyRange = () => {
    const keys = monthKeyRange(from, to)
    setKeys(keys)
    setYear(parseMonthKey(keys[0]).year)
  }

  return (
    <div className="space-y-2">
      {/* 起訖區間 */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-4 shrink-0 text-muted-foreground">從</span>
          <MonthKeySelect
            value={from}
            onChange={setFrom}
            baseYear={today.getFullYear()}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 shrink-0 text-muted-foreground">到</span>
          <MonthKeySelect
            value={to}
            onChange={setTo}
            baseYear={today.getFullYear()}
          />
          <Button
            variant="outline"
            size="sm"
            className="ml-auto h-7 px-2 text-xs"
            onClick={applyRange}
          >
            套用區間
          </Button>
        </div>
      </div>

      {/* 年份切換 */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => setYear(y => y - 1)}
          aria-label="上一年"
        >
          <ChevronLeftIcon className="size-3.5" />
        </Button>
        <span className="flex-1 text-center text-sm font-medium tabular-nums">
          {year} 年
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => setYear(y => y + 1)}
          aria-label="下一年"
        >
          <ChevronRightIcon className="size-3.5" />
        </Button>
      </div>

      {/* 月份格狀選取 */}
      <div className="grid grid-cols-4 gap-1">
        {MONTHS.map(month => {
          const key = monthKey(year, month)
          const active = selected.has(key)
          return (
            <button
              key={month}
              type="button"
              onClick={e => handleMonthClick(month, e.shiftKey)}
              className={`rounded-md border py-1.5 text-sm tabular-nums transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-accent'
              }`}
            >
              {month} 月
            </button>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        點擊切換單月，按住 Shift 點擊可選連續區間。
      </p>

      {/* 快捷 */}
      <div className="flex flex-wrap gap-1">
        <QuickButton
          label="本月"
          onClick={() => {
            setYear(today.getFullYear())
            setKeys([monthKey(today.getFullYear(), today.getMonth() + 1)])
          }}
        />
        <QuickButton
          label={`${year} 全年`}
          onClick={() => setKeys(MONTHS.map(m => monthKey(year, m)))}
        />
        <QuickButton
          label="未來十二個月"
          onClick={() => {
            const start = monthKey(today.getFullYear(), today.getMonth() + 1)
            const { year: sy, month: sm } = parseMonthKey(start)
            const endYear = sm === 1 ? sy : sy + 1
            const endMonth = sm === 1 ? 12 : sm - 1
            setYear(sy)
            setKeys(monthKeyRange(start, monthKey(endYear, endMonth)))
          }}
        />
        <QuickButton label="清除" onClick={() => setKeys([])} />
      </div>
    </div>
  )
}

function MonthKeySelect({
  value,
  onChange,
  baseYear,
}: {
  value: MonthKey
  onChange: (key: MonthKey) => void
  baseYear: number
}) {
  const { year, month } = parseMonthKey(value)
  const years = [baseYear - 1, baseYear, baseYear + 1, baseYear + 2]

  return (
    <div className="flex items-center gap-1">
      <Select
        value={String(year)}
        onValueChange={v => onChange(monthKey(Number(v), month))}
      >
        <SelectTrigger size="sm" className="w-[4.75rem] text-xs">
          <SelectValue>{year}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {years.map(y => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(month)}
        onValueChange={v => onChange(monthKey(year, Number(v)))}
      >
        <SelectTrigger size="sm" className="w-[4.25rem] text-xs">
          <SelectValue>{month} 月</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map(m => (
            <SelectItem key={m} value={String(m)}>
              {m} 月
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function QuickButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={onClick}>
      {label}
    </Button>
  )
}
