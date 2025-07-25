'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Calendar, MapPin, Mail, Phone, Home, Hash, User, Users
} from 'lucide-react';

// Google Calendar & App Script config
const CALENDAR_ID = 'gamingaurav@gmail.com';
const API_KEY = 'AIzaSyB8AZVAVLsFcDaSbrraZgwRtcylsHNRCxw';
const SUBMIT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyXzmrnSpc7uDjbZgYazubjNdsDC3oCwjociUcYZ1xU4i_vH6zmUx-6axkw0py1bZ6R/exec';

// Helper function to get event details from Google Calendar by ID
async function fetchEventById(eventId: string) {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${eventId}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    id: data.id,
    title: data.summary || '',
    location: data.location || '',
    description: data.description || '',
    start: data.start?.dateTime || data.start?.date,
    end: data.end?.dateTime || data.end?.date,
  };
}

// Reusable floating label input field
function FloatingLabelInput(props: {
  icon: React.ReactNode,
  name: string,
  label: string,
  type: string,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  required?: boolean,
  autoComplete?: string
}) {
  return (
    <div className="relative mt-3">
      {props.icon ? (
        <div className="absolute top-1/2 left-3 -translate-y-1/2 text-orange-600">{props.icon}</div>
      ) : null}
      <input
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        type={props.type}
        required={props.required ?? true}
        autoComplete={props.autoComplete ?? 'off'}
        placeholder=" "
        className="w-full px-11 py-3 rounded border border-gray-300 focus:border-orange-500 outline-none bg-gray-50 text-gray-800 text-base peer transition"
      />
      <label
        htmlFor={props.name}
        className="absolute left-11 top-[0.6rem] text-gray-400 pointer-events-none
                   peer-focus:-top-3 peer-focus:text-xs peer-focus:text-orange-700
                   bg-white px-1 duration-300 transform -translate-y-[0.8rem]
                   peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                   peer-placeholder-shown:-translate-y-1/2"
      >
        {props.label}
      </label>
    </div>
  );
}

const RegisterPage: React.FC = () => {
  // Get eventId from query params
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event') || '';
  // Page state
  const [eventData, setEventData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true); // loading event info
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    zip: '',
  });
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false); // loading animation for submit

  // Fetch event data on load
  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    fetchEventById(eventId).then(ev => {
      setEventData(ev);
      setLoading(false);
    });
  }, [eventId]);

  // Form input handler
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  // Form submit handler: disables and shows spinner while submitting
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // All fields are required
    if (!form.name || !form.email || !form.phone || !form.address || !form.state || !form.zip) {
      alert('Please fill all fields');
      return;
    }
    setSubmitting(true);
    const payload = {
      timestamp: new Date().toISOString(),
      fullName: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      state: form.state,
      zip: form.zip,
      eventId: eventData?.id || '',
      eventTitle: eventData?.title || '',
      eventLocation: eventData?.location || '',
      eventStart: eventData?.start || '',
      eventEnd: eventData?.end || '',
      eventDescription: eventData?.description || '',
    };
    await fetch(SUBMIT_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setSubmitting(false);
    setSuccess(true);
  }

  // Success confirmation
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-orange-50 to-amber-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl px-10 py-12 max-w-md text-center">
            <div className="flex justify-center mb-5">
              <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="12" fill="#e6fce7"/>
                <path d="M8 13l3 3 5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Registration Successful!</h2>
            <p className="text-gray-700 mb-2">
              Thank you for registering for <span className="font-semibold text-orange-700">{eventData?.title}</span>.
            </p>
            <p className="text-gray-500 text-sm">You’ll receive a confirmation email soon.</p>
          </div>
        </div>
        <Footer />
        <style jsx global>{`
          @keyframes fade-in { from { opacity:0; transform: translateY(40px);} to { opacity:1; transform:none; } }
          .animate-fade-in { animation: fade-in .7s cubic-bezier(.22,.7,.53,1.15); }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-medium text-orange-700">Loading event...</div>;
  }
  if (!eventData) {
    return <div className="min-h-screen flex items-center justify-center font-medium text-red-700">Event not found.</div>;
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-bl from-orange-50 to-amber-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto my-12">
          <div className="bg-white shadow-xl rounded-3xl overflow-hidden animate-fade-in">
            {/* Event banner */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-400 text-white px-8 py-6 flex flex-col gap-2 border-b-4 border-orange-700">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <div>
                  <div className="font-semibold text-lg">{eventData.title}</div>
                  <div className="flex items-center gap-1 text-sm mt-0.5">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{eventData.location || '—'}</span>
                  </div>
                </div>
              </div>
              {eventData.description &&
                <div className="mt-2 ml-7 text-sm text-orange-900/80 italic">{eventData.description}</div>}
            </div>
            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="p-8 bg-white space-y-5">
              <div className="text-xl font-bold text-orange-700 text-center mb-6">Event Registration</div>
              <FloatingLabelInput
                icon={<User />}
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                label="Full Name"
              />
              <FloatingLabelInput
                icon={<Mail />}
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                label="Email"
              />
              <FloatingLabelInput
                icon={<Phone />}
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="tel"
                label="Phone Number"
                autoComplete="tel"
              />
              <FloatingLabelInput
                icon={<Home />}
                name="address"
                value={form.address}
                onChange={handleChange}
                type="text"
                label="Address"
              />
              <div className="flex flex-col md:flex-row gap-4">
                <FloatingLabelInput
                  icon={<Users />}
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  type="text"
                  label="State"
                />
                <FloatingLabelInput
                  icon={<Hash />}
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  type="text"
                  label="ZIP Code"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className={`mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 font-bold text-white shadow-md hover:shadow-xl hover:from-orange-700 hover:to-amber-600 transition text-lg tracking-wide flex items-center justify-center ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {submitting && (
                  <svg className="animate-spin h-6 w-6 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-70" fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                )}
                {submitting ? "Submitting..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
      <style jsx global>{`
        @keyframes fade-in { from { opacity:0; transform: translateY(40px);} to { opacity:1; transform:none; } }
        .animate-fade-in { animation: fade-in .7s cubic-bezier(.22,.7,.53,1.15); }
      `}</style>
    </div>
  );
};

export default RegisterPage;
