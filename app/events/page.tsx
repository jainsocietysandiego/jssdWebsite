'use client'

import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Events: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const events = [
    {
      id: 1,
      title: 'Mahavir Jayanti Celebration',
      date: '2025-04-13',
      time: '10:00 AM - 2:00 PM',
      location: 'JSSD Community Center',
      description: 'Grand celebration of Lord Mahavir\'s birth anniversary with prayers, cultural programs, and community feast.',
      attendees: 250,
      type: 'religious',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Pathshala Annual Competition',
      date: '2025-03-15',
      time: '9:00 AM - 12:00 PM',
      location: 'JSSD Community Center',
      description: 'Annual competition for Pathshala students featuring quiz, speech, and cultural performances.',
      attendees: 80,
      type: 'educational',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Paryushan Parv',
      date: '2025-08-20',
      time: '7:00 AM - 9:00 PM',
      location: 'JSSD Community Center',
      description: 'Eight-day festival of forgiveness and spiritual purification with daily prayers and lectures.',
      attendees: 400,
      type: 'religious',
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Community Potluck Dinner',
      date: '2025-02-28',
      time: '6:00 PM - 9:00 PM',
      location: 'JSSD Community Center',
      description: 'Monthly community gathering with shared meals and social activities.',
      attendees: 120,
      type: 'social',
      status: 'upcoming'
    },
    {
      id: 5,
      title: 'Diwali Celebration',
      date: '2024-10-31',
      time: '5:00 PM - 10:00 PM',
      location: 'JSSD Community Center',
      description: 'Joyous celebration of the festival of lights with traditional decorations and festivities.',
      attendees: 300,
      type: 'cultural',
      status: 'past'
    },
    {
      id: 6,
      title: 'Yoga and Meditation Workshop',
      date: '2024-12-07',
      time: '8:00 AM - 10:00 AM',
      location: 'JSSD Community Center',
      description: 'Weekly yoga and meditation sessions for spiritual wellness and health.',
      attendees: 45,
      type: 'wellness',
      status: 'past'
    }
  ];

  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  const pastEvents = events.filter(event => event.status === 'past');

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'religious': return 'bg-orange-100 text-orange-800';
      case 'educational': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-green-100 text-green-800';
      case 'cultural': return 'bg-purple-100 text-purple-800';
      case 'wellness': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const EventCard = ({ event }: { event: typeof events[0] }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
          <div className="flex items-center text-gray-600 mb-2">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-gray-600 mb-2">
            <Clock className="h-4 w-4 mr-2" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{event.location}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)} mb-2`}>
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </span>
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-sm">{event.attendees}</span>
          </div>
        </div>
      </div>
      <p className="text-gray-600 mb-4">{event.description}</p>
      <div className="flex space-x-3">
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          {event.status === 'upcoming' ? 'Register' : 'View Details'}
        </button>
        {event.status === 'upcoming' && (
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
            Add to Calendar
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      <main>
        <div className="pt-16">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Community Events</h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Join us for spiritual celebrations, educational programs, and community gatherings
              </p>
            </div>
          </div>

          {/* Upcoming Events */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Don't miss these exciting events happening in our community
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </section>

          {/* Calendar View */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Event Calendar</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  View all events in calendar format
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center justify-between mb-8">
                  <button className="flex items-center text-gray-600 hover:text-orange-600 transition-colors">
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Previous
                  </button>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button className="flex items-center text-gray-600 hover:text-orange-600 transition-colors">
                    Next
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-3 text-center font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i - 6);
                    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                    const hasEvent = events.some(event => 
                      new Date(event.date).toDateString() === date.toDateString()
                    );
                    
                    return (
                      <div
                        key={i}
                        className={`p-3 text-center border border-gray-100 ${
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                        } ${hasEvent ? 'bg-orange-50 border-orange-200' : ''}`}
                      >
                        <span className={`${hasEvent ? 'font-bold text-orange-600' : ''}`}>
                          {date.getDate()}
                        </span>
                        {hasEvent && (
                          <div className="w-2 h-2 bg-orange-600 rounded-full mx-auto mt-1"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Past Events */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Past Events</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Relive the memories from our previous community gatherings
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </section>

          {/* Event Categories */}
          <section className="py-20 bg-orange-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Event Categories</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  We organize various types of events to serve different aspects of our community
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="bg-orange-100 text-orange-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Religious Events</h3>
                  <p className="text-gray-600">Festivals, prayer meetings, and spiritual celebrations</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Educational Programs</h3>
                  <p className="text-gray-600">Pathshala activities, workshops, and learning sessions</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="bg-green-100 text-green-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Gatherings</h3>
                  <p className="text-gray-600">Social events, potlucks, and networking opportunities</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Events;