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

  if (!data) return <Loading />;

  return (
  <div className="min-h-screen bg-brand-light">
    <main className="pt-[8vh] sm:pt-[12vh]">

      <section className="relative flex items-center justify-center
                                    h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden">
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
                      {data.heading}
                    </h1>
                    <p className="mt-2 max-w-5xl mx-auto text-white text-sm sm:text-base md:text-lg text-center">
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
