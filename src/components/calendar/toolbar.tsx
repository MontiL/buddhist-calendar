'use client'

import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { CityPicker } from '@/components/city-picker'
import { ICalSubscribe } from '@/components/ical-subscribe'
import { ModeToggle } from '@/components/mode-toggle'
import { ColorThemeToggle } from '@/components/color-theme-toggle'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import type { CityName } from '@/lib/solar-noon'

export type CalendarView = 'dayGridMonth' | 'listMonth'

export interface CalendarToggles {
  festival: boolean
  fasting: boolean
  posadha: boolean
  solarNoon: boolean
}

interface CalendarToolbarProps {
  title: string
  view: CalendarView
  toggles: CalendarToggles
  city: CityName
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (view: CalendarView) => void
  onToggle: (key: keyof CalendarToggles, value: boolean) => void
  onCityChange: (city: CityName) => void
}

export function CalendarToolbar({
  title,
  view,
  toggles,
  city,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onToggle,
  onCityChange,
}: CalendarToolbarProps) {
  return (
    <div className="space-y-2 mb-3">
      {/* Row 1: Navigation + View + City */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="size-8" onClick={onPrev}>
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-3" onClick={onToday}>
            今日
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={onNext}>
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>

        <h2 className="text-sm font-semibold flex-1 text-center sm:text-left">
          {title}
        </h2>

        <div className="flex items-center gap-2 ml-auto">
          {/* Theme toggles */}
          <ColorThemeToggle />
          <ModeToggle />

          {/* View toggle */}
          <div className="flex rounded-md border overflow-hidden text-sm">
            <button
              onClick={() => onViewChange('dayGridMonth')}
              className={`px-3 py-1.5 transition-colors ${
                view === 'dayGridMonth'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              月
            </button>
            <button
              onClick={() => onViewChange('listMonth')}
              className={`px-3 py-1.5 transition-colors border-l ${
                view === 'listMonth'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              列表
            </button>
          </div>

          <CityPicker city={city} onCityChange={onCityChange} />
        </div>
      </div>

      <Separator />

      {/* Row 2: Switches + Subscribe */}
      <div className="flex items-center gap-4 flex-wrap">
        <SwitchLabel
          label="佛菩薩紀念日"
          checked={toggles.festival}
          color="bg-pink-200"
          onChange={v => onToggle('festival', v)}
        />
        <SwitchLabel
          label="六齋日／長齋月"
          checked={toggles.fasting}
          color="bg-yellow-200"
          onChange={v => onToggle('fasting', v)}
        />
        <SwitchLabel
          label="布薩日"
          checked={toggles.posadha}
          color="bg-purple-200"
          onChange={v => onToggle('posadha', v)}
        />
        <SwitchLabel
          label="過午時間"
          checked={toggles.solarNoon}
          color="bg-sky-200"
          onChange={v => onToggle('solarNoon', v)}
        />

        <div className="ml-auto">
          <ICalSubscribe city={city} />
        </div>
      </div>
    </div>
  )
}

function SwitchLabel({
  label,
  checked,
  color,
  onChange,
}: {
  label: string
  checked: boolean
  color: string
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none">
      <div className={`size-2.5 rounded-full ${color}`} />
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  )
}
