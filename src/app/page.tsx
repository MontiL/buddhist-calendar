import { BuddhistCalendar } from '@/components/calendar/buddhist-calendar'

export default function Home() {
  return (
    <main className="flex flex-col flex-1 p-4 sm:p-6">
      <header className="mb-4">
        <h1 className="text-xl font-bold tracking-tight">佛教齋戒行事曆</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          農曆・佛菩薩紀念日・齋日・布薩日・過午時間
        </p>
      </header>
      <BuddhistCalendar />
    </main>
  )
}
