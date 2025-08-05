'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

type PolicyItem = { title: string; link: string };

const API_URL = 'https://script.google.com/macros/s/AKfycbzOaZ19OuJZNEiMshDfGS74NiMd4PTqdsgJJRVEFmk6H3XOHxBeTxCvBJQBbOumufckLg/exec';
const FALLBACK_JSON = '/about-policy.json';
const CACHE_KEY = 'policy-data';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const PolicyList: React.FC<{ title: string; items: PolicyItem[] }> = ({ title, items }) => (
  <div className="bg-white p-6 rounded-lg shadow-md h-full">
    <h3 className="text-2xl font-bold text-orange-600 mb-4 border-b-2 border-orange-200 pb-2">{title}</h3>
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index}>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-orange-600 hover:underline transition-colors"
          >
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const PolicySkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 animate-pulse">
   
    <div className="pt-16">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20 text-center">
        <div className="h-10 w-1/2 mx-auto rounded bg-orange-300 mb-4" />
        <div className="h-6 w-1/3 mx-auto rounded bg-orange-200" />
      </div>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md space-y-4">
              <div className="h-6 w-2/3 bg-orange-100 rounded" />
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-4 w-full bg-orange-50 rounded" />
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>

  </div>
);

const PoliciesPage: React.FC = () => {
  const [data, setData] = useState<{
    heading: string;
    description: string;
    general: PolicyItem[];
    bod: PolicyItem[];
    religious: PolicyItem[];
  } | null>(null);

  useEffect(() => {
    let didCancel = false;

    const loadFallbackAndUpdate = async () => {
      try {
        const res = await fetch(FALLBACK_JSON);
        const fallbackData = await res.json();
        if (!didCancel) setData(fallbackData);
      } catch (err) {
        console.error('Failed to load fallback JSON:', err);
      }
    };

    const loadData = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      let shouldFetch = true;

      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setData(cachedData);
            shouldFetch = false;
          }
        } catch {
          // Corrupted cache
        }
      }

      if (shouldFetch) {
        await loadFallbackAndUpdate();
      }

      // Background fetch from Google Apps Script
      fetch(API_URL)
        .then((res) => res.json())
        .then((apiData) => {
          if (!didCancel) {
            setData(apiData); // Optional re-render
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ data: apiData, timestamp: Date.now() })
            );
          }
        })
        .catch((err) => {
          console.error('Failed to fetch live policy data:', err);
        });
    };

    loadData();

    return () => {
      didCancel = true;
    };
  }, []);

  if (!data) return <PolicySkeleton />;

  return (
  <div className="min-h-screen bg-brand-light">
    <main className="pt-[14vh]">

      <section className="relative flex items-center justify-center
                          h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] overflow-hidden">
        <Image
          src="/images/hero-banner.jpg"
          alt="Hero banner background"
          fill
          priority
          quality={85}
          className="object-cover"
        />

        <div className="relative z-10 px-4 text-center">
          <h1 className="font-bold text-brand-light
                         text-3xl sm:text-4xl md:text-5xl lg:text-6xl
                         
                         [text-shadow:_0_0_10px_rgb(255_255_255_/_40%),_0_0_25px_rgb(255_255_255_/_25%)]">
            {data.heading}
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-center
                        text-xs md:text-xl text-brand-light">
            {data.description}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-brand-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* each PolicyList returns a card */}
            <PolicyList title="General Documents"   items={data.general}   />
            <PolicyList title="BOD Documents"       items={data.bod}       />
            <PolicyList title="Religious Programs"  items={data.religious} />

          </div>
        </div>
      </section>

    </main>
  </div>
);

};

export default PoliciesPage;
