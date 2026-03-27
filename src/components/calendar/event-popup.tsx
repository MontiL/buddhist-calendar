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

const TYPE_BADGE_CLASS: Record<string, string> = {
  festival: 'bg-pink-100 text-pink-800 border-pink-300',
  sixthDay: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  longFastMonth: 'bg-green-100 text-green-800 border-green-300',
  posadha: 'bg-purple-100 text-purple-800 border-purple-300',
  solarNoon: 'bg-sky-100 text-sky-800 border-sky-300',
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
            <Badge
              variant="outline"
              className={TYPE_BADGE_CLASS[type] ?? ''}
            >
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
