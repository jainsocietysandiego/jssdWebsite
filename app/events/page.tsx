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

// Calendar connection
const API_KEY = 'AIzaSyB8AZVAVLsFcDaSbrraZgwRtcylsHNRCxw';
const CALENDAR_ID = 'gamingaurav@gmail.com';
const PACIFIC_TZ = 'America/Los_Angeles';

// --- Pacific Time calculation helpers ---

function dayPartsInTZ(dateStr: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    // All-day: convert UTC to San Diego date
    const utcMidnight = new Date(dateStr + 'T00:00:00Z');
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: PACIFIC_TZ, year: 'numeric', month: 'numeric', day: 'numeric',
    });
    const parts = dtf.formatToParts(utcMidnight);
    return {
      year: Number(parts.find(p => p.type === 'year')!.value),
      month: Number(parts.find(p => p.type === 'month')!.value) - 1,
      day: Number(parts.find(p => p.type === 'day')!.value),
    };
  }
  // Timed event: use browser local
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

function cellMatchPacific(eventDate: string, cell: Date) {
  const parts = dayPartsInTZ(eventDate);
  return (
    parts.year === cell.getFullYear() &&
    parts.month === cell.getMonth() &&
    parts.day === cell.getDate()
  );
}

function eventAsPacificDate(dateStr: string) {
  const p = dayPartsInTZ(dateStr);
  return new Date(p.year, p.month, p.day);
}

function pacificLabel(dateStr: string, isAllDay: boolean) {
  if (isAllDay && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const utc = new Date(dateStr + 'T00:00:00Z');
    return utc.toLocaleDateString('en-US', {
      timeZone: PACIFIC_TZ, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// --- Fetch events for a 2-year window
async function getGoogleEvents(startISO: string, endISO: string) {
  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events` +
    `?key=${API_KEY}&timeMin=${startISO}&timeMax=${endISO}&singleEvents=true&orderBy=startTime`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.items || []).map((item: any) => {
    const isAllDay = !!item.start?.date && !item.start?.dateTime;
    const start = item.start?.dateTime || item.start?.date;
    const end = item.end?.dateTime || item.end?.date;
    let time = 'All Day';
    if (!isAllDay && item.start?.dateTime && item.end?.dateTime) {
      time =
        `${new Date(item.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ` +
        `${new Date(item.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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

const EventsPage: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch upon month change
  useEffect(() => {
    const start = new Date(currentMonth.getFullYear() - 1, 0, 1).toISOString();
    const end = new Date(currentMonth.getFullYear() + 1, 11, 31).toISOString();
    setLoading(true);
    getGoogleEvents(start, end).then(setEvents).finally(() => setLoading(false));
  }, [currentMonth]);

  // Now in Pacific Time
  const now = new Date();
  const pacificParts = (() => {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: PACIFIC_TZ, year: 'numeric', month: 'numeric', day: 'numeric',
    });
    const ps = dtf.formatToParts(now);
    return {
      year: Number(ps.find(p => p.type === 'year')!.value),
      month: Number(ps.find(p => p.type === 'month')!.value) - 1,
      day: Number(ps.find(p => p.type === 'day')!.value),
    };
  })();
  const pacificToday = new Date(pacificParts.year, pacificParts.month, pacificParts.day);

  // Filters
  const beforeToday = (dateStr: string) => eventAsPacificDate(dateStr) < pacificToday;
  const isUpcoming = (dateStr: string) => !beforeToday(dateStr);
  const futureEvents = events.filter(e => isUpcoming(e.date));
  const pastEvents = events.filter(e => beforeToday(e.date));

  // --- Calendar grid ---
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const numDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const days: Date[] = [];
  for (let i = 0; i < startDay; i++)
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i - startDay + 1));
  for (let i = 1; i <= numDays; i++)
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  while (days.length % 7 !== 0 || days.length < 35)
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), days.length - startDay + 1));

  // -- UI Components --
  const badgeColor = 'bg-blue-100 text-blue-800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      
      <main>
        <div className="pt-16">
          {/* HERO */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Community Events</h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Join us for spiritual celebrations, educational programs, and community gatherings
              </p>
            </div>
          </div>

          {/* UPCOMING EVENTS */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">Don't miss these exciting events happening in our community</p>
              </div>
              {loading ? (
                <div>Loading events...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {futureEvents.length === 0 && (
                    <div className="col-span-2 text-center text-gray-400">No upcoming events.</div>
                  )}
                  {futureEvents
                    .sort((a, b) => eventAsPacificDate(a.date) - eventAsPacificDate(b.date))
                    .map(e => (
                      <div
                        key={e.id}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{e.title}</h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{pacificLabel(e.date, e.isAllDay)}</span>
                            </div>
                            <div className="flex items-center text-gray-600 mb-2">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{e.time}</span>
                            </div>
                            {e.location && (
                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{e.location}</span>
                              </div>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColor} mb-2`}>
                            Calendar
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{e.description}</p>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => router.push(`/events/register?event=${e.id}`)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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

          {/* CALENDAR GRID */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Event Calendar</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">View all events in calendar format</p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                  <button className="flex items-center text-gray-600 hover:text-orange-600 transition-colors" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
                    <ChevronLeft className="h-5 w-5 mr-1" /> Previous
                  </button>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button className="flex items-center text-gray-600 hover:text-orange-600 transition-colors" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                    Next <ChevronRight className="h-5 w-5 ml-1" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-3 text-center font-medium text-gray-500">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((date, idx) => {
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const hasEvent = events.some(e => cellMatchPacific(e.date, date));
                    return (
                      <div
                        key={idx}
                        className={`
                          p-3 text-center border border-gray-100 select-none
                          ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                          ${hasEvent ? 'bg-orange-50 border-orange-200' : ''}
                        `}
                      >
                        <span className={`${hasEvent ? 'font-bold text-orange-600' : ''}`}>{date.getDate()}</span>
                        {hasEvent && <div className="w-2 h-2 bg-orange-600 rounded-full mx-auto mt-1"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* PAST EVENTS */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Past Events</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Relive the memories from our previous community gatherings
                </p>
              </div>
              {loading ? (
                <div>Loading events...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {pastEvents.length === 0 &&
                    <div className="col-span-2 text-center text-gray-400">No past events.</div>
                  }
                  {pastEvents
                    .sort((a, b) => eventAsPacificDate(b.date) - eventAsPacificDate(a.date))
                    .map(e => (
                      <div key={e.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{e.title}</h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{pacificLabel(e.date, e.isAllDay)}</span>
                            </div>
                            <div className="flex items-center text-gray-600 mb-2">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{e.time}</span>
                            </div>
                            {e.location && (
                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{e.location}</span>
                              </div>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColor} mb-2`}>Calendar</span>
                        </div>
                        <p className="text-gray-600 mb-4">{e.description}</p>
                        {/* No buttons for past events */}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default EventsPage;
