import { BuddhistCalendar } from '@/components/calendar/buddhist-calendar'
import { convertToTaiwanTime } from '@/lib/taiwan-time'

export default function Home() {
  const year = convertToTaiwanTime(new Date()).getUTCFullYear()
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
            href={`https://www.cwa.gov.tw/Data/astronomy/${year}suntr.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            CWA 官方值
          </a>{' '}
          校正；誤差 ±10 秒以內（嘉義較大）
        </p>
      </header>
      <BuddhistCalendar />
    </main>
  )
}
