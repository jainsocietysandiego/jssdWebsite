'use client';

import React, { useState, useEffect, Suspense } from 'react';

import {
  Calendar,
  MapPin,
  Mail,
  Phone,
  Home,
  Hash,
  User,
  Users
} from 'lucide-react';

// CONFIG — SET YOUR GOOGLE APPSCRIPT DEPLOYMENT URL
const SUBMIT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyXzmrnSpc7uDjbZgYazubjNdsDC3oCwjociUcYZ1xU4i_vH6zmUx-6axkw0py1bZ6R/exec';
const API_KEY = 'AIzaSyD0MBBXb6oamBJQaEe_FF7T8i0DDzx3UTg';
const CALENDAR_ID = 'jainsocietyofsandiego@gmail.com';

const Loading = () => (
  <div className="min-h-screen bg-brand-light flex items-center justify-center">
    <div className="text-center px-4">
      <div className="relative">
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8 relative">
          <div className="absolute inset-0 border-4 border-[rgba(234,88,12,0.1)] rounded-full"></div>
          <div className="absolute inset-1 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <div 
            className="absolute inset-2 border-4 border-brand-dark/30 border-r-transparent rounded-full"
            style={{
              animation: 'spin 1s linear infinite reverse'
            }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-accent rounded-full flex items-center justify-center animate-pulse">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full"></div>
          </div>
        </div>        
        <h3 className="text-lg md:text-xl font-semibold text-brand-dark mb-2">Jai Jinendra</h3>
        <p className="text-sm md:text-base text-accent animate-pulse">Ahimsa Parmo Dharma</p>
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>
    </div>
  </div>
);

// Util to fetch Google Calendar event details
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

// Floating Label Input field component
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
        <div className="absolute top-1/2 left-3 -translate-y-1/2 text-accent">{props.icon}</div>
      ) : null}
      <input
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        type={props.type}
        required={props.required ?? true}
        autoComplete={props.autoComplete ?? 'off'}
        placeholder=" "
        className="w-full px-11 py-3 rounded-xl border-soft focus:border-accent outline-none  text-brand-dark text-sm md:text-base peer transition-all duration-300 focus:ring-2 focus:ring-accent/20"
      />
      <label
        htmlFor={props.name}
        className="absolute left-11 top-[0.6rem] text-brand-dark/60 pointer-events-none
                   peer-focus:-top-3 peer-focus:text-xs peer-focus:text-accent
                   bg-brand-white px-1 duration-300 transform -translate-y-[0.8rem]
                   peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-brand-dark/60
                   peer-placeholder-shown:-translate-y-1/2 md:peer-placeholder-shown:text-base"
      >
        {props.label}
      </label>
    </div>
  );
}


// --- The actual register page, wrapped in Suspense boundary for Next.js 14+ ---
function RegisterPageInner({ eventId }: { eventId: string }) {
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
  const [submitting, setSubmitting] = useState(false);

  // Fetch event data on load
  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    fetchEventById(eventId).then(ev => {
      setEventData(ev);
      setLoading(false);
    });
  }, [eventId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  if (success) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-brand-light">
      <div className="flex-grow flex items-center justify-center animate-fade-in">
        <div className="bg-brand-white rounded-xl shadow-soft px-8 md:px-10 py-10 md:py-12 max-w-md text-center">
          <div className="flex justify-center mb-5">
            <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="#e6fce7"/>
              <path d="M8 13l3 3 5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-green-600 mb-2">Registration Successful!</h2>
          <p className="text-brand-dark mb-2 text-sm md:text-base text-justify">
            Thank you for registering for <span className="font-semibold text-accent">{eventData?.title}</span>.
          </p>
          <p className="text-brand-dark/70 text-xs md:text-sm">You'll receive a confirmation email soon.</p>
        </div>
      </div>
     
      <style jsx global>{`
        @keyframes fade-in { from { opacity:0; transform: translateY(40px);} to { opacity:1; transform:none; } }
        .animate-fade-in { animation: fade-in .7s cubic-bezier(.22,.7,.53,1.15); }
      `}</style>
    </div>
  );
}

if (loading) {
  return (
    <Loading />
  );
}

if (!eventData) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="font-medium text-red-600">Event not found.</p>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen bg-brand-light flex flex-col pt-[14vh]">
    <main className="flex-1 py-8 md:py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-brand-white shadow-soft rounded-3xl overflow-hidden animate-fade-in">
          {/* Event banner */}
          <div className="bg-accent text-brand-light px-6 md:px-8 py-6 flex flex-col gap-2 border">
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-lg md:text-xl">{eventData.title}</div>
                <div className="flex items-center gap-1 text-sm mt-1">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>{eventData.location || '—'}</span>
                </div>
              </div>
            </div>
            {eventData.description && (
              <div className="mt-2 ml-9 text-sm text-brand-light/90 italic text-justify">
                {eventData.description}
              </div>
            )}
          </div>
          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 bg-brand-white space-y-6">
            <div className="text-xl md:text-2xl font-bold text-accent text-center mb-6">
              Event Registration
            </div>

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
              className={`mt-6 w-full py-3 md:py-4 rounded-xl bg-accent font-bold text-brand-light shadow-soft hover:shadow-lg hover:from-accent-hov hover:to-accent transition-all duration-300 text-base md:text-lg tracking-wide flex items-center justify-center ${
                submitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {submitting && (
                <svg className="animate-spin h-5 w-5 md:h-6 md:w-6 mr-2 text-brand-light" viewBox="0 0 24 24">
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
    
    <style jsx global>{`
      @keyframes fade-in { from { opacity:0; transform: translateY(40px);} to { opacity:1; transform:none; } }
      .animate-fade-in { animation: fade-in .7s cubic-bezier(.22,.7,.53,1.15); }
    `}</style>
  </div>
);

}

// --- Actual page export: useSearchParams in Suspense-bound client component ---
import { useSearchParams } from 'next/navigation';

function RegisterWithSearchParams() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event') || '';
  return <RegisterPageInner eventId={eventId} />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading form...</div>}>
      <RegisterWithSearchParams />
    </Suspense>
  );
}
