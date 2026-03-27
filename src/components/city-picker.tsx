'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CITY_NAMES_ZH, type CityName } from '@/lib/solar-noon'

interface CityPickerProps {
  city: CityName
  onCityChange: (city: CityName) => void
}

export function CityPicker({ city, onCityChange }: CityPickerProps) {
  return (
    <Select value={city} onValueChange={v => onCityChange(v as CityName)}>
      <SelectTrigger className="w-20 h-8 text-sm">
        <SelectValue>{CITY_NAMES_ZH[city]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(CITY_NAMES_ZH) as [CityName, string][]).map(
          ([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  )
}
