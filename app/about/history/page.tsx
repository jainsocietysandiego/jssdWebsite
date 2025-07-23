'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Constants
const API_URL = 'https://script.google.com/macros/s/AKfycbw_x_gsRrQ3MEn1ZJBDGs8qhv6u0Uf4Ms_eGrzCetAOH4vwSawGVgkT5vGByArv040b/exec';
const FALLBACK_JSON = '/about-history.json';
const CACHE_KEY = 'history-data';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface SheetEntry {
  Section: string;
  Label: string;
  Content: string;
}

const HistorySkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 animate-pulse">
    <Navbar />
    <div className="pt-16">
      <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
        <div className="h-10 w-1/2 mx-auto rounded bg-orange-300 mb-4" />
        <div className="h-6 w-1/3 mx-auto rounded bg-orange-200" />
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          <div className="h-6 w-full bg-orange-100 rounded mb-4" />
          <div className="h-6 w-3/4 bg-orange-100 rounded mb-4" />
          <div className="h-6 w-2/3 bg-orange-100 rounded mb-4" />
        </div>
      </section>
      <section className="py-16 bg-orange-50">
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          {[...Array(3)].map((_, idx) => (
            <div key={idx}>
              <div className="h-6 w-1/2 bg-orange-200 rounded mb-4" />
              <div className="h-4 w-full bg-orange-100 rounded mb-2" />
              <div className="h-4 w-3/4 bg-orange-100 rounded" />
            </div>
          ))}
        </div>
      </section>
    </div>
    <Footer />
  </div>
);

const HistoryPage: React.FC = () => {
  const [data, setData] = useState<SheetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const getContent = (section: string, label: string) =>
    data.find(entry => entry.Section === section && entry.Label === label)?.Content || '';

  const getParagraphs = () =>
    (data.find(entry => entry.Section === 'description')?.Content || '')
      .split(/\n\s*\n/)
      .filter(Boolean);

  const getPhases = () => data.filter(entry => entry.Section === 'phase');

  useEffect(() => {
    let didCancel = false;

    const loadFallbackAndUpdate = async () => {
      try {
        const res = await fetch(FALLBACK_JSON);
        const fallbackData = await res.json();
        if (!didCancel) {
          setData(fallbackData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load fallback JSON:', err);
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
            setData(cachedData);
            setLoading(false);
            shouldFetch = false;
          }
        } catch {
          // Corrupt cache, continue
        }
      }

      if (shouldFetch) {
        await loadFallbackAndUpdate();
      }

      // Background fetch
      axios
        .get(API_URL)
        .then(res => {
          const newData = res.data.content || [];
          if (!didCancel) {
            setData(newData); // Re-render with fresh data
          }
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: newData, timestamp: Date.now() })
          );
        })
        .catch(err => {
          console.error('Error fetching live history data:', err);
        });
    };

    loadData();
    return () => {
      didCancel = true;
    };
  }, []);

  if (loading) return <HistorySkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />

      <main className="pt-16">
        {/* Banner */}
        <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold">
              {getContent('banner', 'Title') || 'Our History'}
            </h1>
          </div>
        </section>

        {/* Paragraph Description */}
        <section className="py-16 bg-white border border-shadow-md border-colour-gray rounded-xl">
          <div className="max-w-5xl mx-auto px-4 space-y-6 text-gray-800 text-lg leading-relaxed text-justify">
            {getParagraphs().map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </section>

        {/* Phases Section */}
        <section className="py-16 bg-orange-50">
          <div className="max-w-5xl mx-auto px-4 space-y-10">
            {getPhases().map((phase, idx) => (
              <div key={idx}>
                <h3 className="text-xl font-bold text-orange-700 mb-2">{phase.Label}</h3>
                <p className="text-gray-700 text-base leading-relaxed">{phase.Content}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HistoryPage;
