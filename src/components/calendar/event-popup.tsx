'use client'

import { Lunar } from 'lunar-typescript'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { EventClickArg } from '@fullcalendar/core'

const TYPE_LABELS: Record<string, string> = {
  festival: '佛菩薩紀念日',
  sixthDay: '六齋日',
  longFastMonth: '長齋月',
  posadha: '布薩日',
  solarNoon: '過午時間',
}

/** 與行事曆格內晶片共用同一組語意變數，明暗模式自動對應 */
const TYPE_TOKEN: Record<string, string> = {
  festival: 'festival',
  sixthDay: 'fasting',
  longFastMonth: 'longfast',
  posadha: 'posadha',
  solarNoon: 'noon',
}

function badgeStyle(type: string): React.CSSProperties | undefined {
  const token = TYPE_TOKEN[type]
  if (!token) return undefined
  return {
    backgroundColor: `var(--evt-${token}-bg)`,
    color: `var(--evt-${token}-fg)`,
    borderColor: `var(--evt-${token}-edge)`,
  }
}

interface EventPopupProps {
  eventArg: EventClickArg | null
  onClose: () => void
}

export function EventPopup({ eventArg, onClose }: EventPopupProps) {
  if (!eventArg) return null

  const { event } = eventArg
  const type = event.extendedProps.type as string
  const solarNoon = event.extendedProps.solarNoon as string | undefined
  const date = event.start

  let lunarText = ''
  if (date) {
    const lunar = Lunar.fromDate(date)
    lunarText = `農曆 ${lunar.getMonthInChinese().replace('腊', '臘')}月${lunar.getDayInChinese()}`
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" style={badgeStyle(type)}>
              {TYPE_LABELS[type] ?? type}
            </Badge>
          </div>
          <DialogTitle className="text-base">{event.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 text-sm text-muted-foreground">
          {lunarText && <p>{lunarText}</p>}
          {solarNoon && type !== 'solarNoon' && (
            <p>過午時間：{solarNoon}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
