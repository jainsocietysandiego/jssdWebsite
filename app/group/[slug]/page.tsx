'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';

const API_URL =
  'https://script.google.com/macros/s/AKfycbyvRvMW0wBhim-kMRXg13LhyR8vDLeUvwgFnTrNDrCWhtvQMI3_Qc48w0aOQwaE-01I/exec';
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
          const found = fallback.committees?.find(
            (c: Committee) => c['Slug'] === slug
          );
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

  if (loading) return <Loading />;
  if (!committee) return notFound();

  // Use the full URLs for images as passed from your API response
  const imageUrl1 = committee['Image 1'] || '';
  const imageUrl2 = committee['Image 2'] || '';

  // Dynamic title and optional description for the hero banner
  const title = committee['Committee Name'] || '';
  const description = committee['Description'] || '';

  return (
    <div className="min-h-screen bg-brand-light">
      <main className="pt-[8vh] sm:pt-[12vh]">

        {/* === Hero Section with dynamic title and description === */}
        <section className="relative flex items-center justify-center h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden">
          <Image
            src="/images/hero-banner.jpg"
            alt={title}
            fill
            priority
            quality={85}
            className="object-cover"
          />
          <div className="relative z-10 text-center px-4">
            <h1 className="font-bold text-brand-light text-3xl sm:text-4xl md:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-4xl mx-auto text-white text-sm sm:text-base md:text-lg text-center">
                {description}
              </p>
            )}
          </div>
        </section>

        {/* === Main Content Section with two-column layout === */}
        <section className="py-16 bg-brand-white">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-10 items-start">

            {/* Left column - committee details */}
            <div className="flex-1 space-y-8 text-gray-700 leading-relaxed">
              {Object.entries(committee).map(([key, value]) => {
                if (
                  EXCLUDED_KEYS.includes(key) ||
                  key === 'Committee Name' ||
                  key === 'Description' ||
                  key === 'Image 1' ||
                  key === 'Image 2'
                )
                  return null;

                if (CONTACT_KEYS.includes(key)) return null;

                if (BULLET_KEYS.includes(key)) {
                  const bullets = value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean);
                  if (!bullets.length) return null;

                  return (
                    <div
                      key={key}
                      className="bg-brand-white rounded-xl shadow-soft p-6"
                    >
                      <h2 className="text-lg md:text-xl font-semibold text-accent mb-4">
                        {key}
                      </h2>
                      <ul className="list-disc list-inside text-brand-dark space-y-1 text-sm md:text-base">
                        {bullets.map((point, i) => (
                          <li key={i} className="text-justify">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }

                if (!value.trim()) return null;

                return (
                  <div
                    key={key}
                    className="bg-brand-white rounded-xl shadow-soft p-6"
                  >
                    <h2 className="text-lg md:text-xl font-semibold text-accent mb-4">
                      {key}
                    </h2>
                    <p className="text-brand-dark whitespace-pre-line text-sm md:text-base leading-relaxed text-justify">
                      {value}
                    </p>
                  </div>
                );
              })}

              {/* Contact details */}
              <div className="bg-brand-white rounded-xl shadow-soft p-6">
                <h2 className="text-lg md:text-xl font-semibold text-accent mb-4">
                  Contact Details
                </h2>
                {[1, 2].map((num) => {
                  const name = committee[`Contact ${num} Name`];
                  const phone = committee[`Contact ${num} Phone`];
                  const email = committee[`Contact ${num} Email`];
                  if (!name) return null;

                  return (
                    <div
                      key={num}
                      className="mb-4 p-4 bg-brand-light rounded-lg border-soft"
                    >
                      <p className="font-medium text-brand-dark mb-2">{name}</p>
                      {phone && (
                        <p className="text-brand-dark/80 text-sm md:text-base">
                          📞 {phone}
                        </p>
                      )}
                      {email && (
                        <p className="text-brand-dark/80 text-sm md:text-base">
                          ✉️ {email}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right column - render two images from Drive */}
            <div className="w-full md:w-1/2 flex flex-col gap-6">
              {imageUrl1 && (
                <div className="relative h-80 md:h-[200px]">
                  <Image
                    src={imageUrl1}
                    alt={title}
                    fill
                    className="rounded-xl shadow-soft object-cover"
                  />
                </div>
              )}
              {imageUrl2 && (
                <div className="relative h-80 md:h-[200px]">
                  <Image
                    src={imageUrl2}
                    alt={title}
                    fill
                    className="rounded-xl shadow-soft object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const Loading = () => (
  <div className="min-h-screen bg-brand-light flex items-center justify-center">
    <div className="text-center px-4">
      <div className="relative">
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8 relative">
          <div className="absolute inset-0 border-4 border-[rgba(234,88,12,0.1)] rounded-full"></div>
          <div className="absolute inset-1 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <div
            className="absolute inset-2 border-4 border-brand-dark/30 border-r-transparent rounded-full"
            style={{ animation: 'spin 1s linear infinite reverse' }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-accent rounded-full flex items-center justify-center animate-pulse">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full"></div>
          </div>
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-brand-dark mb-2">Jai Jinendra</h3>
        <p className="text-sm md:text-base text-accent animate-pulse">Ahimsa Parmo Dharma</p>
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  </div>
);
