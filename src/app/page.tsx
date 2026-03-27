import { BuddhistCalendar } from '@/components/calendar/buddhist-calendar'

export default function Home() {
  return (
    <main className="flex flex-col flex-1 p-4 sm:p-6">
      <header className="mb-4">
        <h1 className="text-xl font-bold tracking-tight">佛教齋戒行事曆</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          農曆・齋日・過午時間・布薩日・佛菩薩紀念日
        </p>
        <p className="text-xs mt-1">
          過午時間由 suncalc 天文演算法計算，以{' '}
          <a
            href="/solar-noon"
            className="text-blue-500 hover:underline"
          >
            CWA 官方值
          </a>{' '}
          校正；誤差 ±10 秒以內（嘉義較大）{' '}
          <a
            href="/solar-noon"
            className="inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
          >
            演算法說明
          </a>
        </p>
      </header>
      <BuddhistCalendar />
    </main>
  )
}
