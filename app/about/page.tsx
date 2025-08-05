'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, Clock, MapPin, Users } from 'lucide-react';
import Image from 'next/image';

const API_URL =
  'https://script.google.com/macros/s/AKfycby4gsDwefTyRV7yzdlw0LFgNe0ROpWfi97Y_hnlODDtJa8CuO2QyLqqumv5CSCk8roLTg/exec';
const FALLBACK_URL = '/AboutPage.json';
const CACHE_KEY = 'about-page-data';
const CACHE_TTL = 10 * 60 * 1_000;   // 10 min

interface SheetEntry {
  Section: string;
  Label: string;
  Content: string;
}

const AboutSkeleton = () => (
  <div className="min-h-screen bg-brand-light animate-pulse">
    <div className="pt-16 space-y-8">
      <section className="h-64 bg-brand-dark/20" />
      <section className="max-w-7xl mx-auto px-4">
        <div className="h-4 w-full bg-brand-dark/10 mb-2 rounded" />
        <div className="h-4 w-5/6 bg-brand-dark/10 mb-2 rounded" />
        <div className="h-4 w-2/3 bg-brand-dark/10 rounded" />
      </section>
    </div>
  </div>
);

const AboutPage: React.FC = () => {
  const [data, setData] = useState<SheetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- helpers ---------- */
  const getContent = (s: string, l: string) =>
    data.find(e => e.Section === s && e.Label === l)?.Content || '';

  const getList = (s: string, l: string) =>
    getContent(s, l).split(',').map(t => t.trim()).filter(Boolean);

  const getParagraphs = (s: string, l: string) =>
    getContent(s, l).split(/\n\s*\n/).filter(Boolean);

  /* ---------- load data ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setData(cachedData);
            setLoading(false);
          }
        }

        if (loading) {
          const res = await fetch(FALLBACK_URL);
          if (res.ok) {
            const json = await res.json();
            setData(json.content);
            setLoading(false);
          }
        }

        // background refresh
        axios.get(API_URL).then(res => {
          if (res.data?.content) {
            setData(res.data.content);
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ data: res.data.content, timestamp: Date.now() })
            );
          }
        }).catch(() => {/* ignore */});
      } catch {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <AboutSkeleton />;

  return (
    <div className="min-h-screen bg-brand-light">
      <main className="pt-[14vh]">

        <section className="relative flex items-center justify-center
                            h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden">
          <Image
            src="/images/hero-banner.jpg"
            alt="Hero banner background"
            fill
            priority
            quality={85}
            className="object-cover"
          />
          <h1 className="relative z-10 px-4 text-center font-bold text-brand-light
                         text-3xl sm:text-4xl md:text-5xl lg:text-6xl
                         ">
            {getContent('hero', 'Title')}
          </h1>
        </section>

        <section className="py-16 md:py-20 bg-brand-white">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* text */}
            <div className="space-y-6 text-gray-700 leading-relaxed">
              {getParagraphs('hero', 'Description').map((p, i) => (
                <p key={i} className="text-justify text-base md:text-lg">{p}</p>
              ))}
            </div>
            {/* image */}
            <div className="rounded-xl shadow-soft overflow-hidden">
              <img
                src={getContent('hero', 'Image URL')}
                alt="About JSSD"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* CONTACT INFO ----------------------------------------------- */}
        <section className="py-16 bg-brand-light">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-center text-accent font-bold text-2xl sm:text-3xl mb-10">
              Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ContactCard icon={MapPin}  label="Address"          value={getContent('contact', 'Address')} />
              <ContactCard icon={Clock}   label="Regular Hours"    value={getContent('contact', 'Regular Hours')} />
              <ContactCard icon={Clock}   label="Pathshala Hours"  value={getContent('contact', 'Pathshala Hours')} />
              <ContactCard icon={Users}   label="Mailing Address"  value={getContent('contact', 'Mailing Address')} />
              <ContactCard icon={Mail}    label="Event Contact"    value={getContent('contact', 'Event Contact')} />

              {/* e-mails */}
              <div className="bg-brand-white p-6 rounded-xl shadow-soft text-center border-soft">
                <Mail className="w-7 h-7 mx-auto text-accent mb-3" />
                <h3 className="font-semibold mb-1">Emails</h3>
                {getList('contact', 'Emails').map((e, i) => (
                  <p key={i} className="break-words text-sm">{e}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ORG STRUCTURE ---------------------------------------------- */}
        <section className="py-16 bg-brand-white">
          <div className="max-w-7xl mx-auto px-4 space-y-12">
            <header className="text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-dark">
                Organizational Structure
              </h2>
              <p className="text-brand-dark max-w-3xl mx-auto text-justify">
                JSSD is governed by a constitution and managed by dedicated volunteers elected by our members.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Executive */}
              <div className="bg-brand-light p-8 rounded-2xl shadow-soft">
                <h3 className="text-xl md:text-2xl font-bold text-accent mb-6">
                  Executive Committee
                </h3>
                <div className="space-y-4">
                  {getList('org_structure', 'Executive Roles').map((r, i) => (
                    <div key={i} className="flex justify-between border-b border-dashed border-accent/30 pb-2">
                      <span className="font-semibold">{r}</span>
                      <span className="text-brand-dark/70 text-sm">2-year term</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trustees */}
              <div className="bg-brand-light p-8 rounded-2xl shadow-soft">
                <h3 className="text-xl md:text-2xl font-bold text-accent mb-6">
                  Trustee Committee
                </h3>
                <p className="text-brand-dark mb-4 text-justify">
                  Provides oversight and guidance to ensure JSSD operates in line with its mission.
                </p>
                <div className="bg-brand-white p-5 rounded-xl border-soft">
                  <h4 className="font-semibold text-accent mb-3">Key Responsibilities:</h4>
                  <ul className="list-disc list-inside space-y-1 text-brand-dark text-sm md:text-base">
                    {getList('org_structure', 'Trustee Duties').map((d, i) => (
                      <li key={i}>{d}</li>
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

/* ------------- small card component ------------- */
const ContactCard = ({
  icon: Icon,
  label,
  value
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className="bg-brand-white p-6 rounded-xl shadow-soft text-center border-soft space-y-1 break-words">
    <Icon className="w-7 h-7 mx-auto text-accent mb-2" />
    <h3 className="font-semibold">{label}</h3>
    <p className="text-sm">{value}</p>
  </div>
);

export default AboutPage;
