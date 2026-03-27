'use client'

import { useRef, useState, useMemo, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarApi, DatesSetArg, EventClickArg } from '@fullcalendar/core'

import { CalendarToolbar, type CalendarView, type CalendarToggles } from './toolbar'
import { DayCellContent } from './day-cell-content'
import { EventPopup } from './event-popup'
import { useCity } from '@/hooks/use-city'
import {
  getBuddhistCalendarEvents,
  getSolarNoonEvents,
  type BuddhistCalendarEvent,
} from '@/lib/lunar-utils'

function toFcEvents(events: BuddhistCalendarEvent[]) {
  return events.map(e => ({
    id: e.id,
    title: e.title,
    date: e.date,
    start: e.start,
    end: e.end,
    allDay: true,
    backgroundColor: e.backgroundColor,
    borderColor: e.borderColor,
    textColor: e.textColor,
    extendedProps: {
      type: e.type,
      subType: e.subType,
      solarNoon: e.solarNoon,
      isFastingDay: e.isFastingDay,
    },
  }))
}

export function BuddhistCalendar() {
  const calendarRef = useRef<FullCalendar>(null)
  const { city, updateCity } = useCity()

  const [view, setView] = useState<CalendarView>('dayGridMonth')
  const [title, setTitle] = useState('')
  const [toggles, setToggles] = useState<CalendarToggles>({
    festival: true,
    fasting: true,
    posadha: true,
    solarNoon: true,
  })
  const [visibleRange, setVisibleRange] = useState<{
    start: Date
    end: Date
  } | null>(null)
  const [clickedEvent, setClickedEvent] = useState<EventClickArg | null>(null)

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setTitle(arg.view.title)
    setVisibleRange({ start: arg.start, end: arg.end })
  }, [])

  const api = (): CalendarApi | undefined =>
    calendarRef.current?.getApi()

  const handlePrev = () => api()?.prev()
  const handleNext = () => api()?.next()
  const handleToday = () => api()?.today()

  const handleViewChange = (newView: CalendarView) => {
    setView(newView)
    api()?.changeView(newView)
  }

  const handleToggle = (key: keyof CalendarToggles, value: boolean) => {
    setToggles(prev => ({ ...prev, [key]: value }))
  }

  const events = useMemo(() => {
    if (!visibleRange) return []
    const { start, end } = visibleRange
    const buddhistEvents = getBuddhistCalendarEvents(start, end)
    const solarNoonEvents = getSolarNoonEvents(start, end, city)

    const filtered: BuddhistCalendarEvent[] = []

    if (toggles.festival) {
      filtered.push(...buddhistEvents.filter(e => e.type === 'festival'))
    }
    if (toggles.fasting) {
      filtered.push(
        ...buddhistEvents.filter(
          e => e.type === 'sixthDay' || e.type === 'longFastMonth',
        ),
      )
    }
    if (toggles.posadha) {
      filtered.push(...buddhistEvents.filter(e => e.type === 'posadha'))
    }
    if (toggles.solarNoon) {
      filtered.push(...solarNoonEvents)
    }

    return toFcEvents(filtered)
  }, [visibleRange, toggles, city])

  return (
    <div className="h-full">
      <CalendarToolbar
        title={title}
        view={view}
        toggles={toggles}
        city={city}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={handleViewChange}
        onToggle={handleToggle}
        onCityChange={updateCity}
      />

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        locale="zh-tw"
        firstDay={0}
        height="auto"
        events={events}
        datesSet={handleDatesSet}
        eventClick={arg => {
          arg.jsEvent.preventDefault()
          setClickedEvent(arg)
        }}
        dayCellContent={arg =>
          view === 'dayGridMonth' ? (
            <DayCellContent
              date={arg.date}
              dayNumber={arg.dayNumberText}
            />
          ) : null
        }
        listDaySideFormat={{ weekday: 'short' }}
        noEventsContent="此期間沒有事件"
      />

      <EventPopup
        eventArg={clickedEvent}
        onClose={() => setClickedEvent(null)}
      />
    </div>
  )
}
