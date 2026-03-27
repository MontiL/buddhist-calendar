'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CalendarIcon } from 'lucide-react'
import { CITY_NAMES_ZH, type CityName } from '@/lib/solar-noon'

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
    googleUrl: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(`${baseUrl}${path}`)}`,
    webcalUrl: `webcal://${baseUrl.replace(/^https?:\/\//, '')}${path}`,
  }
}

export function ICalSubscribe({ city }: ICalSubscribeProps) {
  // baseUrl is determined at runtime to support both local dev and production
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://buddhist-calendar.vercel.app'

  const subscriptions = [
    toSubscriptionLinks('佛菩薩紀念日', '/api/ical/festivals', baseUrl),
    toSubscriptionLinks('齋日', '/api/ical/fasting', baseUrl),
    toSubscriptionLinks('布薩日', '/api/ical/posadha', baseUrl),
    toSubscriptionLinks(
      `過午時間（${CITY_NAMES_ZH[city]}）`,
      `/api/ical/solar-noon?city=${city}`,
      baseUrl,
    ),
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
