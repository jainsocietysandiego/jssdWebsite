'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

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

const EXCLUDED_SECTIONS = ['banner', 'intro'];
const API_URL =
  'https://script.google.com/macros/s/AKfycbyNPC97PyE0Uye8dzZ-5sDKe6IGuPlUsSf2WY4dW1kxrYtLEYfnXV0gND2B3qMW9Bsz/exec';
const FALLBACK_JSON = '/BOD.json';
const CACHE_KEY = 'bod-data';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const BODPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [sectionLabels, setSectionLabels] = useState<Record<string, string>>({});
  const [bannerTitle, setBannerTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [loading, setLoading] = useState(true);

  const toReadableLabel = (key: string): string =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  useEffect(() => {
    let isMounted = true;

    const populate = (data: SheetEntry[]) => {
      if (!isMounted) return;
      setBannerTitle(data.find((row) => row.Section === 'banner')?.Name || 'Executive Committee & BOD');
      setIntro(data.find((row) => row.Section === 'intro')?.Name || '');

      const sectionGroups: Record<string, string> = {};
      const foundSections: string[] = [];

      const people: Member[] = data.filter((row) => {
        const isMember = !EXCLUDED_SECTIONS.includes(row.Section);
        if (isMember && !foundSections.includes(row.Section)) {
          foundSections.push(row.Section);
          sectionGroups[row.Section] = toReadableLabel(row.Section);
        }
        return isMember;
      });

      setSectionLabels(sectionGroups);
      setSectionOrder(foundSections);
      setMembers(people);
    };

    // 1. Try cache first
    const cached = localStorage.getItem(CACHE_KEY);
    let haveLoaded = false;

    if (cached) {
      try {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          populate(cachedData);
          setLoading(false);
          haveLoaded = true;
          console.log('[Cache] Loaded from cache.');
        }
      } catch {
        // Ignore corrupt cache
      }
    }

    // 2. If cache not available/fresh, fetch fallback JSON asynchronously
    if (!haveLoaded) {
      console.time('Fallback JSON Fetch Time');
      fetch(FALLBACK_JSON)
        .then((res) => {
          if (!res.ok) throw new Error('Fallback JSON HTTP error');
          return res.json();
        })
        .then((fallbackData) => {
          console.timeEnd('Fallback JSON Fetch Time');
          console.log('Fallback JSON data:', fallbackData);
          if (isMounted) {
            // Pass the 'content' array if exists, otherwise the whole fallbackData
            populate(fallbackData.content || fallbackData);
            setLoading(false);
            console.log('[Fallback JSON] Loaded fallback JSON and updated state.');
          }
        })
        .catch((err) => {
          console.timeEnd('Fallback JSON Fetch Time');
          console.warn('❌ Failed to load fallback JSON:', err);
          if (isMounted) {
            setLoading(false);
          }
        });
    }

    // 3. Always fetch fresh data from API in background and update cache/UI if changed
    console.time('API Fetch Time');
    axios
      .get(API_URL)
      .then((res) => {
        console.timeEnd('API Fetch Time');
        const rows = res.data.content || [];
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: rows, timestamp: Date.now() }));
        if (isMounted && JSON.stringify(rows) !== JSON.stringify(members)) {
          populate(rows);
          console.log('[API] Updated state with fresh API data.');
        } else {
          console.log('[API] API data is same as current state, no update.');
        }
      })
      .catch((err) => {
        console.timeEnd('API Fetch Time');
        console.warn('❌ Failed to fetch from API:', err);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line
  }, []);

  const Skeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 animate-pulse">
      <main className="pt-16">
        <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="h-8 w-1/2 mx-auto rounded bg-orange-300" />
          </div>
        </section>
        <section className="py-12 bg-white max-w-7xl mx-auto px-4">
          <div className="space-y-4">
            <div className="h-4 bg-orange-100 rounded w-full" />
            <div className="h-4 bg-orange-100 rounded w-3/4" />
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded shadow space-y-3">
                <div className="h-20 w-20 rounded-full bg-orange-100 mx-auto" />
                <div className="h-4 bg-orange-200 rounded w-3/4 mx-auto" />
                <div className="h-3 bg-orange-100 rounded w-2/3 mx-auto" />
                <div className="h-3 bg-orange-100 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );

  const renderSection = (sectionKey: string) => {
    const people = members.filter((m) => m.Section === sectionKey);
    if (people.length === 0) return null;

    return (
      <section key={sectionKey} className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-orange-700 border-b border-orange-200 mb-6 pb-2">
          {sectionLabels[sectionKey] || toReadableLabel(sectionKey)}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {people.map((person, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-4 flex gap-4 items-start">
              <div className="relative w-20 h-20 min-w-[80px] rounded-full overflow-hidden border">
                <Image
                  src={person.ImageURL?.trim() || ''}
                  alt={person.Name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      person.Name
                    )}&background=F97316&color=fff&rounded=true`;
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{person.Name}</h3>
                <p className="text-sm text-orange-700 font-semibold mb-1">{person.Role}</p>
                <p className="text-sm text-gray-700 break-words">{person.Email}</p>
                {Object.entries(person).map(([key, value]) => {
                  if (
                    ['Section', 'Name', 'Role', 'Email', 'Image Name', 'ImageURL'].includes(key)
                  )
                    return null;
                  if (!value) return null;

                  const label = key
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                  const displayValue =
                    key.toLowerCase().includes('term') && !isNaN(Date.parse(value))
                      ? new Date(value).toLocaleDateString()
                      : String(value);

                  return (
                    <p key={key} className="text-sm text-gray-500">
                      {label}: {displayValue}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  if (loading || members.length === 0) {
    return <Skeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <main className="pt-16">
       <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white h-48 sm:h-52 md:h-56 lg:h-60 flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold">{bannerTitle}</h1>
          </div>
        </section>
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-lg text-gray-700 leading-relaxed text-justify whitespace-pre-line">{intro}</p>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4">{sectionOrder.map(renderSection)}</div>
      </main>
    </div>
  );
};

export default BODPage;
