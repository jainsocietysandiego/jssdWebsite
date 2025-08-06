'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

/* ───── types ───── */
interface Member {
  Section: string;
  Name: string;
  Role: string;
  Email: string;
  Extension: string;
  'Term End': string;
  'Image Name': string;
  ImageURL?: string;
}
interface SheetEntry extends Member {}

/* ───── constants ───── */
const EXCLUDED_SECTIONS = ['banner', 'intro'];
const API_URL =
  'https://script.google.com/macros/s/AKfycbxMb9YRpNURrdMoCpkqQGD0h1WAWJOzoN94qgvNxnz6-zkQPXCjKI9ksePbMrHaMELe/exec';
const FALLBACK_JSON = '/BOD.json';
const CACHE_KEY = 'bod-data';
const CACHE_TTL = 10 * 60 * 1_000;           // 10 min

/* ───── page ───── */
const BODPage: React.FC = () => {
  const [members, setMembers]           = useState<Member[]>([]);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [labels, setLabels]             = useState<Record<string, string>>({});
  const [bannerTitle, setBannerTitle]   = useState('');
  const [intro, setIntro]               = useState('');
  const [loading, setLoading]           = useState(true);

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

  /* helpers */
  const pretty = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const populate = (rows: SheetEntry[]) => {
    setBannerTitle(rows.find(r => r.Section === 'banner')?.Name || 'Executive Committee & BOD');
    setIntro(rows.find(r => r.Section === 'intro')?.Name || '');

    const found: string[] = [];
    const lbls: Record<string, string> = {};

    const people = rows.filter(r => {
      if (EXCLUDED_SECTIONS.includes(r.Section)) return false;
      if (!found.includes(r.Section)) {
        found.push(r.Section);
        lbls[r.Section] = pretty(r.Section);
      }
      return true;
    });

    setMembers(people);
    setSectionOrder(found);
    setLabels(lbls);
  };

  /* data load */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      /* 1️⃣ cache */
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            populate(data);
            setLoading(false);
          }
        } catch {/* ignore */}
      }

      /* 2️⃣ fallback */
      if (mounted && loading) {
        fetch(FALLBACK_JSON)
          .then(r => r.json())
          .then(j => { if (mounted) { populate(j.content || j); setLoading(false); }})
          .catch(() => setLoading(false));
      }

      /* 3️⃣ background refresh */
      axios.get(API_URL).then(res => {
        const rows = res.data.content || [];
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: rows, timestamp: Date.now() }));
        if (mounted) populate(rows);
      }).catch(() => {/* ignore */});
    };
    load();
    return () => { mounted = false; };
  }, [loading]);

  if (loading) { return <Loading />; }

  return (
    <div className="min-h-screen bg-brand-light">
  <main className="pt-[14vh]">
    
    {/* Hero Banner Section */}
    <section className="relative flex items-center justify-center
                        h-32 sm:h-40 md:h-44 lg:h-48 overflow-hidden">
      <Image
        src="/images/hero-banner.jpg"
        alt="Board banner"
        fill
        priority
        quality={85}
        className="object-cover"
      />
      <h1 className="relative z-10 font-bold text-brand-light
                     text-2xl sm:text-3xl md:text-4xl">
        {bannerTitle}
      </h1>
    </section>

    {/* Intro Section */}
    {intro && (
      <section className="py-8 bg-brand-white">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-brand-dark leading-relaxed text-justify whitespace-pre-line
                        text-sm md:text-base">
            {intro}
          </p>
        </div>
      </section>
    )}

    {/* Board Members Sections */}
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {sectionOrder.map(sec => {
        const people = members.filter(m => m.Section === sec);
        if (!people.length) return null;

        return (
          <section key={sec} className="space-y-6">
            {/* Section Header */}
            <h2 className="text-accent font-bold border-b border-accent/20 pb-2
                           text-xl sm:text-2xl">
              {labels[sec] || pretty(sec)}
            </h2>

            {/* Members Grid - More compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {people.map(p => (
                <div key={p.Email} className="flex bg-brand-white rounded-xl shadow-lg 
                                               border border-accent/10 hover:shadow-lg hover:border-accent/30
                                               transition-all duration-300 overflow-hidden min-h-[160px]">

                  {/* Member Image - Smaller and more compact */}
                  <div className="w-32 h-auto relative flex-shrink-0">
                    <Image
                      src={p.ImageURL?.trim() || ''}
                      alt={p.Name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(p.Name)}&background=F97316&color=fff&rounded=false`;
                      }}
                    />
                  </div>

                  {/* Member Info - Compact layout */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    {/* Top: Name & Role */}
                    <div className="space-y-1">
                      <h3 className="text-base md:text-lg font-bold text-brand-dark leading-tight line-clamp-2">
                        {p.Name}
                      </h3>
                      <p className="text-accent font-semibold text-xs md:text-sm">
                        {p.Role}
                      </p>
                    </div>

                    {/* Middle: Contact & Details - More compact */}
                    <div className="space-y-1 flex-1 py-1">
                      <p className="text-brand-dark/80 text-xs break-words leading-relaxed">
                        {p.Email}
                      </p>

                      {Object.entries(p)
                        .filter(([k, v]) => !['Section','Name','Role','Email','Image Name','ImageURL'].includes(k) && v)
                        .slice(0, 2) // Limit to 2 additional fields for compactness
                        .map(([k, v]) => {
                          const label = pretty(k);
                          const value = k.toLowerCase().includes('term') && !isNaN(Date.parse(v))
                            ? new Date(v).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                            : String(v);
                          return (
                            <p key={k} className="text-brand-dark/60 text-xs leading-relaxed">
                              <span className="font-semibold text-brand-dark/80">{label}:</span> {value}
                            </p>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  </main>
</div>

  );
};

export default BODPage;
