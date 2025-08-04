'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';

const API_URL =
  'https://script.google.com/macros/s/AKfycbyBLwwT4JaPjLzmWvrhtsXmiVEN0_hBgM1qQJMYoun6mhfcQAtFwYfZUhJWT1w6jV-b/exec';
const FALLBACK_JSON = '/group.json';
const CACHE_KEY = 'committee-data';
const CACHE_TTL = 10 * 60 * 1000;

const EXCLUDED_KEYS = ['Slug'];
const CONTACT_KEYS = [
  'Contact 1 Name',
  'Contact 1 Phone',
  'Contact 1 Email',
  'Contact 2 Name',
  'Contact 2 Phone',
  'Contact 2 Email',
];
const BULLET_KEYS = ['Activities'];

interface Committee {
  [key: string]: string;
}

export default function CommitteePage() {
  const { slug } = useParams<{ slug: string }>();
  const [committee, setCommittee] = useState<Committee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFromAPI = async () => {
      try {
        const res = await fetch(API_URL, { cache: 'no-store' });
        const json = await res.json();
        const all = json.committees || [];
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: all, timestamp: Date.now() })
        );
        const match = all.find((c: Committee) => c['Slug'] === slug);
        setCommittee(match || null);
      } catch (err) {
        console.error('❌ Error fetching committee data:', err);
        setCommittee(null);
      } finally {
        setLoading(false);
      }
    };

    const loadData = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      let shouldFetch = true;

      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            const found = cachedData.find((c: Committee) => c['Slug'] === slug);
            if (found) {
              setCommittee(found);
              setLoading(false);
              shouldFetch = false;
            }
          }
        } catch {
          console.warn('⚠️ Corrupted cache');
        }
      }

      if (!committee) {
        try {
          const res = await fetch(FALLBACK_JSON);
          const fallback = await res.json();
          const found = fallback.committees?.find((c: Committee) => c['Slug'] === slug);
          if (found) {
            setCommittee(found);
            setLoading(false);
          }
        } catch (e) {
          console.error('❌ Failed to load fallback JSON:', e);
        }
      }

      if (shouldFetch) fetchFromAPI();
    };

    loadData();
  }, [slug]);

  if (loading) return <Skeleton />;
  if (!committee) return notFound();

  const title = committee['Committee Name'];
  const driveFileId = committee['Banner Image Name']?.split('id=')[1];
  const imageUrl = driveFileId
    ? `https://drive.google.com/thumbnail?id=${driveFileId}`
    : '/default-banner.jpg';

  return (
    <div className="min-h-screen bg-brand-light">
      <main className="pt-[14vh]">
        <div className="pb-12">
          <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 w-full overflow-hidden">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
            <h1 className="absolute inset-0 z-10 flex items-center justify-center text-brand-light text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-[0_0_10px_rgb(255_255_255_/_50%)] px-4 text-center">
              {title}
            </h1>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
            {Object.entries(committee).map(([key, value]) => {
              if (
                EXCLUDED_KEYS.includes(key) ||
                key === 'Committee Name' ||
                key === 'Banner Image Name'
              )
                return null;

              if (CONTACT_KEYS.includes(key)) return null;

              if (BULLET_KEYS.includes(key)) {
                const bullets = value.split(',').map((item) => item.trim()).filter(Boolean);
                if (bullets.length === 0) return null;

                return (
                  <div key={key} className="bg-brand-white rounded-xl shadow-soft p-6">
                    <h2 className="text-lg md:text-xl font-semibold text-accent mb-4">{key}</h2>
                    <ul className="list-disc list-inside text-brand-dark space-y-1 text-sm md:text-base">
                      {bullets.map((point, i) => (
                        <li key={i} className="text-justify">{point}</li>
                      ))}
                    </ul>
                  </div>
                );
              }

              if (!value.trim()) return null;

              return (
                <div key={key} className="bg-brand-white rounded-xl shadow-soft p-6">
                  <h2 className="text-lg md:text-xl font-semibold text-accent mb-4">{key}</h2>
                  <p className="text-brand-dark whitespace-pre-line text-sm md:text-base leading-relaxed text-justify">{value}</p>
                </div>
              );
            })}

            <div className="bg-brand-white rounded-xl shadow-soft p-6">
              <h2 className="text-lg md:text-xl font-semibold text-accent mb-4">Contact Details</h2>
              {[1, 2].map((num) => {
                const name = committee[`Contact ${num} Name`];
                const phone = committee[`Contact ${num} Phone`];
                const email = committee[`Contact ${num} Email`];
                if (!name) return null;

                return (
                  <div key={num} className="mb-4 p-4 bg-brand-light rounded-lg border-soft">
                    <p className="font-medium text-brand-dark mb-2">{name}</p>
                    {phone && <p className="text-brand-dark/80 text-sm md:text-base">📞 {phone}</p>}
                    {email && <p className="text-brand-dark/80 text-sm md:text-base">✉️ {email}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Skeleton
function Skeleton() {
  return (
    <div className="min-h-screen bg-brand-light">
      <main className="pt-[14vh] animate-pulse">
        <div className="h-48 sm:h-56 md:h-64 lg:h-72 bg-brand-dark/20 w-full relative">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 md:h-10 w-1/2 bg-white/50 rounded" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-brand-white rounded-xl p-6">
              <div className="h-4 w-1/3 bg-brand-dark/10 mb-2 rounded" />
              <div className="h-4 w-full bg-brand-dark/5 mb-1 rounded" />
              <div className="h-4 w-5/6 bg-brand-dark/5 rounded" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
