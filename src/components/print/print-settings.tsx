'use client'

import { PrinterIcon } from 'lucide-react'

import { FoldDemo } from './fold-demo'
import { MonthPicker } from './month-picker'
import { MIN_COL_MM, MIN_ROW_MM, cellSizeMm } from './print-sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { CityPicker } from '@/components/city-picker'
import type { CityName } from '@/lib/solar-noon'
import {
  FOLD_MODES,
  PAPER_MM,
  PAPER_SIZES,
  isFoldAllowed,
  type FoldMode,
  type MonthKey,
  type MonthsPerPage,
  type Orientation,
  type PaperSize,
  type PrintContent,
} from '@/lib/print-calendar'

const MONTHS_PER_PAGE: MonthsPerPage[] = [1, 2, 3, 4]

/** 攤平的摺法（文字按鈕）與立牌（圖示卡片）分開排：兩者是不同種類的東西。 */
const FLAT_FOLDS: FoldMode[] = ['none', 'half']
const STAND_FOLDS: FoldMode[] = ['standTall', 'standWide']

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
  foldMode: FoldMode
  show: PrintContent
  city: CityName
  pageCount: number
  onMonthsChange: (next: Set<MonthKey>) => void
  onPaperChange: (paper: PaperSize) => void
  onOrientationChange: (orientation: Orientation) => void
  onMonthsPerPageChange: (value: MonthsPerPage) => void
  onFoldModeChange: (value: FoldMode) => void
  onShowChange: (key: keyof PrintContent, value: boolean) => void
  onCityChange: (city: CityName) => void
  onPrint: () => void
}

export function PrintSettings({
  months,
  paper,
  orientation,
  monthsPerPage,
  foldMode,
  show,
  city,
  pageCount,
  onMonthsChange,
  onPaperChange,
  onOrientationChange,
  onMonthsPerPageChange,
  onFoldModeChange,
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

      <FoldModePicker
        foldMode={foldMode}
        monthsPerPage={monthsPerPage}
        onChange={onFoldModeChange}
      />

      <DensityWarning
        paper={paper}
        orientation={orientation}
        monthsPerPage={monthsPerPage}
        foldMode={foldMode}
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

      <PrintTips foldMode={foldMode} />
    </div>
  )
}

/**
 * 對折方式。分成兩排：攤平的摺法用文字按鈕，立牌用附圖示的卡片。
 *
 * 圖示不是裝飾 ——「側邊開口站」與「開口處站」兩個詞光看文字很難分辨，
 * 一個站著的側視圖就能講完，這是整個功能最需要視覺說明的地方。
 */
function FoldModePicker({
  foldMode,
  monthsPerPage,
  onChange,
}: {
  foldMode: FoldMode
  monthsPerPage: MonthsPerPage
  onChange: (value: FoldMode) => void
}) {
  const flat = FLAT_FOLDS.filter(mode => isFoldAllowed(mode, monthsPerPage))
  const stands = STAND_FOLDS.filter(mode => isFoldAllowed(mode, monthsPerPage))

  // 只剩「不對折」一個選項時（每頁 1 或 3 個月）沒有東西好選，整區收掉
  if (stands.length === 0 && flat.length < 2) return null

  return (
    <Field label="對折方式">
      <div className="flex flex-col gap-1.5">
        <div className={`grid gap-1 ${flat.length > 1 ? 'grid-cols-2' : ''}`}>
          {flat.map(mode => (
            <SegmentButton
              key={mode}
              active={foldMode === mode}
              onClick={() => onChange(mode)}
            >
              {FOLD_MODES[mode].label}
            </SegmentButton>
          ))}
        </div>

        {stands.length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            {stands.map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => onChange(mode)}
                className={`flex flex-col items-center gap-1 rounded-md border px-1 py-2 transition-colors ${
                  foldMode === mode
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <FoldIcon mode={mode} />
                <span className="text-sm leading-tight">
                  {FOLD_MODES[mode].label}
                </span>
                <span
                  className={`text-[10px] leading-tight ${
                    foldMode === mode
                      ? 'text-primary-foreground/75'
                      : 'text-muted-foreground'
                  }`}
                >
                  {FOLD_MODES[mode].hint}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-1.5 text-xs text-muted-foreground">
        {FOLD_MODES[foldMode].description}
      </p>

      {/* 只有立牌需要示意圖：不對折與對折收納沒有「摺完會變成什麼」的疑問 */}
      {(foldMode === 'standTall' || foldMode === 'standWide') && (
        <FoldDemo mode={foldMode} />
      )}
    </Field>
  )
}

/**
 * 立牌的示意圖，都畫成「站在桌面上」的視角，地面線是共同的基準。
 *
 * standTall：正面板 + 往右後方收的側板，摺線是兩者相接的那條直線 ——
 *   從上方看就是個 V，左右兩側的自由邊即「側邊開口」。
 * standWide：側視的 Λ，頂點就是摺線，兩個自由邊直接站在地面上。
 */
function FoldIcon({ mode }: { mode: FoldMode }) {
  const common = {
    width: 40,
    height: 30,
    viewBox: '0 0 40 30',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (mode === 'standTall') {
    return (
      <svg {...common}>
        <line x1="3" y1="26" x2="37" y2="26" opacity="0.35" />
        {/* 正面板 */}
        <path d="M9 6h13v20H9z" />
        {/* 往後收的側板（透視） */}
        <path d="M22 6l9 3v14l-9 3" />
        {/* 摺線：兩板相接處 */}
        <line x1="22" y1="6" x2="22" y2="26" strokeWidth="2" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <line x1="3" y1="26" x2="37" y2="26" opacity="0.35" />
      {/* 側視的 Λ：兩個自由邊站在地面，頂點是摺線 */}
      <path d="M8 26L20 8l12 18" />
      {/* 摺線記號 */}
      <circle cx="20" cy="8" r="1.6" fill="currentColor" stroke="none" />
    </svg>
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
  foldMode,
}: {
  paper: PaperSize
  orientation: Orientation
  monthsPerPage: MonthsPerPage
  foldMode: FoldMode
}) {
  const { rowMm, colMm } = cellSizeMm(
    paper,
    orientation,
    monthsPerPage,
    foldMode,
  )
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
function PrintTips({ foldMode }: { foldMode: FoldMode }) {
  const tips = [
    '縮放請選「100%／實際大小」，不要用「符合頁面」。',
    '關閉「頁首及頁尾」。',
    '用 Chrome「另存為 PDF」後再上傳超商，字型才會一起嵌入。',
  ]

  if (foldMode === 'half') {
    // 短邊翻頁會把背面整個轉 180°，摺線位置雖然仍對齊，但背面的月份會上下顛倒
    tips.push('雙面請選「長邊翻頁」，否則背面會上下顛倒。')
  }

  if (foldMode === 'standTall' || foldMode === 'standWide') {
    // 立牌是單面印、印刷面朝外對折，正反兩面的內容都已經排在同一面紙上
    tips.push('立牌請印單面，沿紙邊記號對折、印刷面朝外。')
    tips.push('紙張建議 120g 以上，太薄站不穩。')
  }

  if (foldMode === 'standWide') {
    tips.push('預覽中上半頁是顛倒的 —— 那是背面，對折後就會轉正。')
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
