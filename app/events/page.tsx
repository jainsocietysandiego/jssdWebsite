'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';

const API_KEY = 'AIzaSyD0MBBXb6oamBJQaEe_FF7T8i0DDzx3UTg';
const CALENDAR_ID = 'jainsocietyofsandiego@gmail.com';
const PACIFIC_TZ = 'America/Los_Angeles';

// --- Timezone helpers ---
function extractPacificParts(dateStr: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const utcDate = new Date(dateStr + 'T00:00:00Z');
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: PACIFIC_TZ, year: 'numeric', month: 'numeric', day: 'numeric'
    });
    const parts = fmt.formatToParts(utcDate);
    return {
      year: parseInt(parts.find(p => p.type === 'year')?.value ?? '0', 10),
      month: parseInt(parts.find(p => p.type === 'month')?.value ?? '1', 10) - 1,
      day: parseInt(parts.find(p => p.type === 'day')?.value ?? '1', 10)
    };
  }
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

function datesMatchPacific(ev: string, cell: Date) {
  const p = extractPacificParts(ev);
  return (
    p.year === cell.getFullYear() &&
    p.month === cell.getMonth() &&
    p.day === cell.getDate()
  );
}

function pacificDateFromString(dateStr: string) {
  const p = extractPacificParts(dateStr);
  return new Date(p.year, p.month, p.day);
}

function pacificDisplayLabel(dateStr: string, isAllDay: boolean) {
  if (isAllDay) {
    const utc = new Date(dateStr + 'T00:00:00Z');
    return utc.toLocaleDateString('en-US', {
      timeZone: PACIFIC_TZ, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// --- Google Calendar fetching ---
async function fetchCalendarEvents(minIso: string, maxIso: string) {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${minIso}&timeMax=${maxIso}&singleEvents=true&orderBy=startTime`;
  const resp = await fetch(url);
  const body = await resp.json();
  return (body.items ?? []).map((item: any) => {
    const isAllDay = !!item.start?.date && !item.start?.dateTime;
    const start = item.start.dateTime || item.start.date;
    const end = item.end?.dateTime || item.end?.date;
    let time = 'All Day';
    if (!isAllDay && item.start?.dateTime && item.end?.dateTime) {
      time = `${new Date(item.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(item.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return {
      id: item.id,
      title: item.summary || '(No Title)',
      date: start,
      time,
      location: item.location || '',
      description: item.description || '',
      type: 'calendar',
      isAllDay,
    };
  });
}

const EventsPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const minIso = new Date(currentMonth.getFullYear() - 1, 0, 1).toISOString();
    const maxIso = new Date(currentMonth.getFullYear() + 1, 11, 31).toISOString();
    fetchCalendarEvents(minIso, maxIso)
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [currentMonth]);

  // --- Pacific today ---
  const now = new Date();
  const todayPacParts = (() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: PACIFIC_TZ, year: 'numeric', month: 'numeric', day: 'numeric'
    });
    const arr = fmt.formatToParts(now);
    return {
      year: parseInt(arr.find(p => p.type === 'year')?.value ?? '0', 10),
      month: parseInt(arr.find(p => p.type === 'month')?.value ?? '1', 10) - 1,
      day: parseInt(arr.find(p => p.type === 'day')?.value ?? '1', 10)
    };
  })();
  const todayPacific = new Date(todayPacParts.year, todayPacParts.month, todayPacParts.day);

  // --- Filtering ---
  const beforeToday = (dateStr: string) => pacificDateFromString(dateStr).getTime() < todayPacific.getTime();
  const isUpcoming = (dateStr: string) => !beforeToday(dateStr);
  const upcomingEvents = events.filter(e => isUpcoming(e.date));
  const pastEvents = events.filter(e => beforeToday(e.date));

  // --- Calendar grid creation ---
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const numDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const daysInGrid: Date[] = [];
  for (let i = 0; i < startDay; i++)
    daysInGrid.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i - startDay + 1));
  for (let d = 1; d <= numDays; d++)
    daysInGrid.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
  while (daysInGrid.length % 7 !== 0 || daysInGrid.length < 35)
    daysInGrid.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), daysInGrid.length - startDay + 1));

  // --- Badge for cards ---
  function eventBadge() {
    return 'bg-blue-100 text-blue-800';
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-brand-light pt-[14vh]">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center
                          h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden">
        <Image
          src="/images/hero-banner.png"
          alt="Community events"
          fill
          priority
          quality={85}
          className="object-cover"
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-bold text-brand-light
                         text-3xl sm:text-4xl md:text-5xl
                         ">
            Community Events
          </h1>
          <p className="mt-2 max-w-3xl mx-auto text-white
                        text-sm sm:text-base md:text-lg text-justify">
            Join us for spiritual celebrations, educational programs, and community gatherings
          </p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-brand-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-accent font-bold text-2xl sm:text-3xl md:text-4xl mb-2">
              Upcoming Events
            </h2>
            <p className="text-brand-dark max-w-3xl mx-auto text-sm md:text-base text-center">
              Don't miss these exciting events happening in our community
            </p>
          </div>
          {loading ? (
            <div className="text-center text-brand-dark">Loading events...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {upcomingEvents.length === 0 && (
                <div className="col-span-2 text-center text-brand-dark/60">No upcoming events.</div>
              )}
              {upcomingEvents
                .sort((a, b) => pacificDateFromString(a.date).getTime() - pacificDateFromString(b.date).getTime())
                .map(e => (
                  <div
                    key={e.id}
                    className="bg-brand-light rounded-xl shadow-soft hover:shadow-lg transition-shadow p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold text-accent mb-2">{e.title}</h3>
                        <div className="flex items-center text-brand-dark/70 mb-2">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm md:text-base">{pacificDisplayLabel(e.date, e.isAllDay)}</span>
                        </div>
                        <div className="flex items-center text-brand-dark/70 mb-2">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="text-sm md:text-base">{e.time}</span>
                        </div>
                        {e.location && (
                          <div className="flex items-center text-brand-dark/70 mb-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="text-sm md:text-base">{e.location}</span>
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${eventBadge()} mb-2`}>Calendar</span>
                    </div>
                    <p className="text-brand-dark/80 mb-4 text-sm md:text-base text-justify">{e.description}</p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => router.push(`/events/register?event=${e.id}`)}
                        style={{
                          backgroundColor: 'var(--color-accent)',
                          color: 'var(--color-text-light)'
                        }}
                        className="hover:bg-accent-hov px-4 py-2 rounded-xl font-medium transition-colors text-sm md:text-base"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Event Calendar Grid */}
      <section className="py-12 bg-brand-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-accent font-bold text-2xl sm:text-3xl md:text-4xl mb-8">
            Announcements & JSSD Calendar
          </h2>
          <div className="flex justify-center">
            <iframe
              src="https://calendar.google.com/calendar/embed?src=jainsocietyofsandiego%40gmail.com&ctz=Asia%2FKolkata"
              style={{ border: 0 }}
              width="100%"
              height="600"
              frameBorder="0"
              scrolling="no"
              className="max-w-4xl w-full rounded-xl shadow-soft"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="py-16 bg-brand-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-accent font-bold text-2xl sm:text-3xl md:text-4xl mb-2">
              Past Events
            </h2>
            <p className="text-brand-dark max-w-3xl mx-auto text-sm md:text-base text-center">
              Relive the memories from our previous community gatherings
            </p>
          </div>
          {loading ? (
            <div className="text-center text-brand-dark">Loading events...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pastEvents.length === 0 && (
                <div className="col-span-2 text-center text-brand-dark/60">No past events.</div>
              )}
              {pastEvents
                .sort((a, b) => pacificDateFromString(b.date).getTime() - pacificDateFromString(a.date).getTime())
                .map(e => (
                  <div key={e.id} className="bg-brand-light rounded-xl shadow-soft hover:shadow-lg transition-shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold text-accent mb-2">{e.title}</h3>
                        <div className="flex items-center text-brand-dark/70 mb-2">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm md:text-base">{pacificDisplayLabel(e.date, e.isAllDay)}</span>
                        </div>
                        <div className="flex items-center text-brand-dark/70 mb-2">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="text-sm md:text-base">{e.time}</span>
                        </div>
                        {e.location && (
                          <div className="flex items-center text-brand-dark/70 mb-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="text-sm md:text-base">{e.location}</span>
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${eventBadge()} mb-2`}>Calendar</span>
                    </div>
                    <p className="text-brand-dark/80 mb-4 text-sm md:text-base text-justify">{e.description}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
