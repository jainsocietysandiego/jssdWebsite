'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Clock, MapPin, Users } from 'lucide-react';

const API_URL = 'https://script.google.com/macros/s/AKfycby4gsDwefTyRV7yzdlw0LFgNe0ROpWfi97Y_hnlODDtJa8CuO2QyLqqumv5CSCk8roLTg/exec';
const FALLBACK_URL = '/AboutPage.json';
const CACHE_KEY = 'about-page-data';
const CACHE_TTL = 10 * 60 * 1000;

interface SheetEntry {
  Section: string;
  Label: string;
  Content: string;
}

const AboutSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 animate-pulse">
    <div className="pt-16">
      <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20 text-center">
        <div className="h-10 w-1/2 mx-auto rounded bg-orange-300 mb-4" />
      </section>
      <section className="py-20 bg-white grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto px-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-orange-100 rounded" />
          ))}
        </div>
        <div className="h-64 w-full bg-orange-200 rounded" />
      </section>
      <section className="py-20 bg-orange-50">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="h-6 w-1/2 bg-orange-200 mx-auto rounded" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-orange-100 rounded" />
          ))}
        </div>
      </section>
    </div>
    <Footer />
  </div>
);

const AboutPage: React.FC = () => {
  const [data, setData] = useState<SheetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const getContent = (section: string, label: string) =>
    data.find(entry => entry.Section === section && entry.Label === label)?.Content || '';

  const getList = (section: string, label: string) =>
    getContent(section, label).split(',').map(item => item.trim()).filter(Boolean);

  const getParagraphs = (section: string, label: string) =>
    getContent(section, label).split(/\n\s*\n/).filter(Boolean);

  useEffect(() => {
    const loadData = async () => {
      let shouldFetch = true;

      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setData(cachedData);
            setLoading(false);
            shouldFetch = false;
          }
        }

        if (shouldFetch) {
          const res = await fetch(FALLBACK_URL);
          if (res.ok) {
            const fallbackJson = await res.json();
            setData(fallbackJson.content);
          }
          setLoading(false);
        }

        // Background fetch
        axios
          .get(API_URL)
          .then(res => {
            if (res.data?.content) {
              setData(res.data.content);
              localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: res.data.content,
                timestamp: Date.now()
              }));
            }
          })
          .catch(err => console.error('Background fetch failed', err));
      } catch (err) {
        console.error('Data loading failed:', err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <AboutSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <main className="pt-16">
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white h-48 sm:h-52 md:h-56 lg:h-60 flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold">{getContent('hero', 'Title')}</h1>
          </div>
        </section>

        {/* Two Column Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-gray-700 text-lg">
              {getParagraphs('hero', 'Description').map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
            <div className="rounded-lg shadow-md overflow-hidden">
              <img
                src={getContent('hero', 'Image URL')}
                alt="About Image"
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-orange-100">
          <div className="max-w-6xl mx-auto px-4 text-gray-800">
            <h2 className="text-3xl font-bold text-center text-orange-700 mb-12">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ContactCard icon={MapPin} label="Address" value={getContent('contact', 'Address')} />
              <ContactCard icon={Clock} label="Regular Hours" value={getContent('contact', 'Regular Hours')} />
              <ContactCard icon={Clock} label="Pathshala Hours" value={getContent('contact', 'Pathshala Hours')} />
              <ContactCard icon={Users} label="Mailing Address" value={getContent('contact', 'Mailing Address')} />
              <ContactCard icon={Mail} label="Event Contact" value={getContent('contact', 'Event Contact')} />
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <Mail className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                <h3 className="font-semibold">Emails</h3>
                {getList('contact', 'Emails').map((email, idx) => (
                  <p key={idx}>{email}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Organizational Structure */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Organizational Structure</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                JSSD is governed by a constitution and managed by dedicated volunteers elected by our members.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-orange-50 p-8 rounded-lg shadow">
                <h3 className="text-2xl font-bold text-orange-600 mb-6">Executive Committee</h3>
                <div className="space-y-4">
                  {getList('org_structure', 'Executive Roles').map((role, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b pb-2">
                      <span className="font-semibold">{role}</span>
                      <span className="text-gray-600">2-year term</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 p-8 rounded-lg shadow">
                <h3 className="text-2xl font-bold text-orange-600 mb-6">Trustee Committee</h3>
                <p className="text-gray-700 mb-4">
                  Provides oversight and guidance to ensure JSSD operates in line with its mission.
                </p>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-orange-800 mb-2">Key Responsibilities:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {getList('org_structure', 'Trustee Duties').map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        
      </main>
    </div>
  );
};

const ContactCard = ({
  icon: Icon,
  label,
  value
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow text-center">
    <Icon className="w-8 h-8 mx-auto text-orange-600 mb-2" />
    <h3 className="font-semibold">{label}</h3>
    <p>{value}</p>
  </div>
);

export default AboutPage;
