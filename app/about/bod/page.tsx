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
  'https://script.google.com/macros/s/AKfycbyNPC97PyE0Uye8dzZ-5sDKe6IGuPlUsSf2WY4dW1kxrYtLEYfnXV0gND2B3qMW9Bsz/exec';
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

  /* ═════ SKELETON ═════ */
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light animate-pulse">
        <main className="pt-[14vh]">
          <section className="h-64 bg-brand-dark/20" />
          <section className="max-w-7xl mx-auto px-4 py-10 space-y-3">
            <div className="h-4 bg-brand-dark/10 rounded" />
            <div className="h-4 bg-brand-dark/10 rounded w-2/3" />
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light">
      <main className="pt-[14vh]">

        <section className="relative flex items-center justify-center
                            h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden">
          <Image
            src="/images/hero-banner.jpg"
            alt="Board banner"
            fill
            priority
            quality={85}
            className="object-cover"
          />
          <h1 className="relative z-10 font-bold text-brand-light
                         text-3xl sm:text-4xl md:text-5xl ">
            {bannerTitle}
          </h1>
        </section>

        {intro && (
          <section className="py-12 bg-brand-white">
            <div className="max-w-7xl mx-auto px-4">
              <p className="text-brand-dark leading-relaxed text-justify whitespace-pre-line
                            text-base md:text-lg">
                {intro}
              </p>
            </div>
          </section>
        )}

        <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
          {sectionOrder.map(sec => {
            const people = members.filter(m => m.Section === sec);
            if (!people.length) return null;

            return (
              <section key={sec} className="space-y-8">
                <h2 className="text-accent font-bold border-b border-accent/20 pb-2
                               text-2xl sm:text-3xl">
                  {labels[sec] || pretty(sec)}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {people.map(p => (
                    <div key={p.Email} className="bg-brand-white p-5 rounded-xl shadow-soft flex gap-4">
                      {/* avatar */}
                      <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden border-soft">
                        <Image
                          src={p.ImageURL?.trim() || ''}
                          alt={p.Name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(p.Name)}&background=F97316&color=fff&rounded=true`;
                          }}
                        />
                      </div>

                      {/* text */}
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-brand-dark">{p.Name}</h3>
                        <p className="text-accent text-sm font-semibold">{p.Role}</p>
                        <p className="text-brand-dark/80 text-sm break-words">{p.Email}</p>

                        {Object.entries(p).map(([k, v]) => {
                          if (['Section','Name','Role','Email','Image Name','ImageURL'].includes(k) || !v) return null;
                          const label = pretty(k);
                          const value = k.toLowerCase().includes('term') && !isNaN(Date.parse(v))
                            ? new Date(v).toLocaleDateString()
                            : String(v);
                          return (
                            <p key={k} className="text-brand-dark/60 text-xs">
                              {label}: {value}
                            </p>
                          );
                        })}
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
