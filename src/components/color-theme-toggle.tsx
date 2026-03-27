'use client'

import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { PaletteIcon, CheckIcon } from 'lucide-react'

type ColorTheme = 'default' | 'blue' | 'green' | 'rose' | 'orange' | 'violet'

const COLOR_THEMES: { value: ColorTheme; label: string; color: string }[] = [
  { value: 'default', label: '預設', color: '#18181b' },
  { value: 'blue', label: '藍', color: '#3b82f6' },
  { value: 'green', label: '綠', color: '#22c55e' },
  { value: 'rose', label: '玫瑰', color: '#f43f5e' },
  { value: 'orange', label: '橙', color: '#f97316' },
  { value: 'violet', label: '紫', color: '#8b5cf6' },
]

const STORAGE_KEY = 'buddhist-calendar-color-theme'

export function ColorThemeToggle() {
  const [colorTheme, setColorTheme] = useState<ColorTheme>('default')

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ColorTheme) ?? 'default'
    applyColorTheme(stored)
    setColorTheme(stored)
  }, [])

  function applyColorTheme(theme: ColorTheme) {
    const html = document.documentElement
    if (theme === 'default') {
      html.removeAttribute('data-color-theme')
    } else {
      html.setAttribute('data-color-theme', theme)
    }
    localStorage.setItem(STORAGE_KEY, theme)
  }

  function handleSelect(theme: ColorTheme) {
    applyColorTheme(theme)
    setColorTheme(theme)
  }

  const currentColor =
    COLOR_THEMES.find(t => t.value === colorTheme)?.color ?? '#18181b'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex size-8 items-center justify-center rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="切換顏色主題"
      >
        <PaletteIcon className="size-4" style={{ color: currentColor }} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>顏色主題</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {COLOR_THEMES.map(t => (
            <DropdownMenuItem
              key={t.value}
              onClick={() => handleSelect(t.value)}
              className="flex items-center gap-2"
            >
              <span
                className="size-3.5 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: t.color }}
              />
              {t.label}
              {colorTheme === t.value && (
                <CheckIcon className="ml-auto size-3.5" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
