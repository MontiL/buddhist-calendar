'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BellIcon, CalendarIcon } from 'lucide-react'
import { CITY_NAMES_ZH, type CityName } from '@/lib/solar-noon'
import {
  ALL_DAY_ALARM_OPTIONS,
  SOLAR_ALARM_OPTIONS,
  useReminder,
  type AllDayAlarm,
  type SolarAlarm,
} from '@/hooks/use-reminder'

interface ICalSubscribeProps {
  city: CityName
}

interface SubscriptionLink {
  label: string
  googleUrl: string
  webcalUrl: string
}

function SubscriptionLinks({ label, googleUrl, webcalUrl }: SubscriptionLink) {
  return (
    <div className="px-1.5 py-1 space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <div className="flex gap-2">
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-2 py-1 rounded bg-accent hover:bg-accent/80 transition-colors"
        >
          Google
        </a>
        <a
          href={webcalUrl}
          className="text-xs px-2 py-1 rounded bg-accent hover:bg-accent/80 transition-colors"
        >
          Apple
        </a>
      </div>
    </div>
  )
}

function toSubscriptionLinks(
  label: string,
  path: string,
  baseUrl: string,
): SubscriptionLink {
  return {
    label,
    googleUrl: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(`webcal://${baseUrl.replace(/^https?:\/\//, '')}${path}`)}`,
    webcalUrl: `webcal://${baseUrl.replace(/^https?:\/\//, '')}${path}`,
  }
}

function withAlarm(path: string, alarm: string): string {
  if (alarm === 'off') return path
  return `${path}${path.includes('?') ? '&' : '?'}alarm=${alarm}`
}

export function ICalSubscribe({ city }: ICalSubscribeProps) {
  const { allDayAlarm, solarAlarm, updateAllDayAlarm, updateSolarAlarm } =
    useReminder()

  // baseUrl is determined at runtime to support both local dev and production
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://buddhist-calendar.vercel.app'

  const subscriptions = [
    toSubscriptionLinks('齋日', withAlarm('/api/ical/fasting', allDayAlarm), baseUrl),
    toSubscriptionLinks(
      `過午時間（${CITY_NAMES_ZH[city]}）`,
      withAlarm(`/api/ical/solar-noon?city=${city}`, solarAlarm),
      baseUrl,
    ),
    toSubscriptionLinks('布薩日', withAlarm('/api/ical/posadha', allDayAlarm), baseUrl),
    toSubscriptionLinks('佛菩薩紀念日', withAlarm('/api/ical/festivals', allDayAlarm), baseUrl),
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <CalendarIcon className="size-3.5" />
        訂閱行事曆
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>選擇訂閱類型</DropdownMenuLabel>
        </DropdownMenuGroup>
        {subscriptions.map((sub, i) => (
          <DropdownMenuGroup key={sub.label}>
            {i > 0 && <DropdownMenuSeparator />}
            <SubscriptionLinks {...sub} />
          </DropdownMenuGroup>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>提醒設定</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <BellIcon className="size-3.5" />
              齋日／布薩／紀念日
              <span className="ml-auto pl-2 text-xs text-muted-foreground">
                {ALL_DAY_ALARM_OPTIONS.find(o => o.value === allDayAlarm)?.label}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={allDayAlarm}
                onValueChange={value => updateAllDayAlarm(value as AllDayAlarm)}
              >
                {ALL_DAY_ALARM_OPTIONS.map(option => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <BellIcon className="size-3.5" />
              過午時間
              <span className="ml-auto pl-2 text-xs text-muted-foreground">
                {SOLAR_ALARM_OPTIONS.find(o => o.value === solarAlarm)?.label}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={solarAlarm}
                onValueChange={value => updateSolarAlarm(value as SolarAlarm)}
              >
                {SOLAR_ALARM_OPTIONS.map(option => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <p className="px-1.5 py-1 text-[11px] leading-4 text-muted-foreground">
          提醒功能僅支援 Apple
          行事曆等應用程式；Google 日曆不支援訂閱行事曆的提醒。Apple
          行事曆請確認訂閱設定中未開啟「移除提示」。變更提醒設定後需重新訂閱才會生效。
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
