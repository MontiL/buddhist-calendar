import { Suspense } from 'react'
import type { Metadata } from 'next'

import { PrintView } from '@/components/print/print-view'

export const metadata: Metadata = {
  title: '列印月曆 — 佛教齋戒行事曆',
  description: '選擇月份與紙張大小，將佛曆印成月曆。',
}

export default function PrintPage() {
  return (
    <Suspense>
      <PrintView />
    </Suspense>
  )
}
