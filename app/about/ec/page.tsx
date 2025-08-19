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
  'https://script.google.com/macros/s/AKfycbwXQMksXvLgq3wBV8bR9ZLZ6cCQZ7-7EPEsqHOj9NoVF1YCjapmhIEOzwRN9nTlv3w1mw/exec';
const FALLBACK_JSON = '/EC.json';   // Put your file in /public
const CACHE_KEY = 'EC-data';
const CACHE_TTL = 10 * 60 * 1_000; // 10 min

/* ───── page ───── */
const BODPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [bannerTitle, setBannerTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [loading, setLoading] = useState(true);

  const Loading = () => (
    <div className="min-h-screen bg-brand-light flex items-center justify-center">
      <div className="text-center px-4">
        <h3 className="text-lg md:text-xl font-semibold text-brand-dark mb-2">
          Jai Jinendra
        </h3>
        <p className="text-sm md:text-base text-accent animate-pulse">
          Ahimsa Parmo Dharma
        </p>
      </div>
    </div>
  );

  /* helpers */
  const pretty = (s: string) =>
    s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const populate = (rows: SheetEntry[]) => {
    setBannerTitle(
      rows.find((r) => r.Section === 'banner')?.Name ||
        'Executive Committee & BOD'
    );
    setIntro(rows.find((r) => r.Section === 'intro')?.Name || '');

    const found: string[] = [];
    const lbls: Record<string, string> = {};

    const people = rows.filter((r) => {
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
      let rendered = false;

      /* 1️⃣ cache */
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            populate(data);
            setLoading(false);
            rendered = true;
          }
        } catch {
          // ignore
        }
      }

      /* 2️⃣ fallback */
      if (!rendered) {
        try {
          const res = await fetch(FALLBACK_JSON);
          if (res.ok) {
            const j = await res.json();
            populate(j.content || j);
            setLoading(false);
            rendered = true;
          }
        } catch {
          console.warn('Fallback load failed');
        }
      }

      /* 3️⃣ background refresh */
      axios
        .get(API_URL)
        .then((res) => {
          const rows = res.data.content || [];
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: rows, timestamp: Date.now() })
          );
          if (mounted) {
            populate(rows);
            setLoading(false);
          }
        })
        .catch(() => {
          console.warn('API refresh failed');
        });
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-brand-light">
      <main className="pt-[8vh] sm:pt-[12vh]">
        {/* Banner */}
        <section className="relative flex items-center justify-center h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden">
          <Image
            src="/images/hero-banner.jpg"
            alt="Pathshala Program"
            fill
            priority
            quality={85}
            className="object-cover"
          />
          <div className="relative z-10 text-center px-4">
            <h1 className="font-bold text-brand-light text-3xl sm:text-4xl md:text-5xl">
              {bannerTitle}
            </h1>
            <p className="mt-2 max-w-4xl mx-auto text-white text-sm sm:text-base md:text-lg text-center">
              Meet our devoted leaders committed to serving the Jain community with dedication
            </p>
          </div>
        </section>

        {/* Intro */}
        {intro && (
          <section className="py-8 bg-brand-white">
            <div className="max-w-6xl mx-auto px-4">
              <p className="text-brand-dark leading-relaxed text-justify whitespace-pre-line text-sm md:text-base">
                {intro}
              </p>
            </div>
          </section>
        )}

        {/* Board Members */}
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
          {sectionOrder.map((sec) => {
            const people = members.filter((m) => m.Section === sec);
            if (!people.length) return null;

            return (
              <section key={sec} className="space-y-6">
                <h2 className="text-accent font-bold border-b border-accent/20 pb-2 text-xl sm:text-2xl">
                  {labels[sec] || pretty(sec)}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {people.map((p) => (
                    <div
                      key={p.Email}
                      className="flex bg-brand-white rounded-xl shadow-lg border border-accent/10 hover:border-accent/30 transition-all duration-300 overflow-hidden min-h-[160px]"
                    >
                      <div className="w-32 h-auto relative flex-shrink-0">
                        <Image
                          src={p.ImageURL?.trim() || ''}
                          alt={p.Name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              p.Name
                            )}&background=F97316&color=fff`;
                          }}
                        />
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <h3 className="text-base md:text-lg font-bold text-brand-dark leading-tight line-clamp-2">
                          {p.Name}
                        </h3>
                        <p className="text-accent font-semibold text-xs md:text-sm">
                          {p.Role}
                        </p>
                        <p className="text-brand-dark/80 text-xs break-words leading-relaxed">
                          {p.Email}
                        </p>
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
