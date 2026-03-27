import { BuddhistCalendar } from '@/components/calendar/buddhist-calendar'
import { SolarNoonNote } from '@/components/solar-noon-note'

export default function Home() {
  return (
    <main className="flex flex-col flex-1 p-4 sm:p-6">
      <header className="mb-4">
        <h1 className="text-xl font-bold tracking-tight">佛教齋戒行事曆</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          農曆・齋日・過午時間・布薩日・佛菩薩紀念日
        </p>
        <div className="mt-1">
          <SolarNoonNote />
        </div>
      </header>
      <BuddhistCalendar />
    </main>
  )
}
