'use client'

import { InfoIcon } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

export function SolarNoonNote() {
  const year = new Date().getFullYear()
  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors cursor-pointer"
        aria-label="過午時間計算說明"
      >
        <InfoIcon className="size-3 shrink-0" />
        過午時間計算說明
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-80 text-sm">
        <PopoverTitle>過午時間計算說明</PopoverTitle>
        <p className="text-muted-foreground">
          使用 suncalc 天文演算法根據各城市經緯度即時計算太陽過中時間，並校正至中央氣象署（CWA）官方值。
        </p>
        <p className="text-muted-foreground">
          與{' '}
          <a
            href={`https://www.cwa.gov.tw/Data/astronomy/${year}suntr.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            CWA 官方資料
          </a>{' '}
          誤差：±10 秒以內（嘉義無官方資料，誤差較大）
        </p>
      </PopoverContent>
    </Popover>
  )
}
