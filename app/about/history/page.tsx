"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const API_URL =
  "https://script.google.com/macros/s/AKfycbyK_7X_B2nnubo_DCrsmYI93Iqff7Yo27oPTsTWKqKBp0p3zZDKqzyTgyVSMn1K0BvP/exec";
const FALLBACK_JSON = "/about-history1.json";
const CACHE_KEY = "history-data";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface SheetEntry {
  Section: string;
  Label: string;
  Content: string;
  ImageURL?: string;
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

const HistoryPage: React.FC = () => {
  const [data, setData] = useState<SheetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const getContent = (section: string, label: string) =>
    data.find((entry) => entry.Section === section && entry.Label === label)
      ?.Content || "";

  const getImageUrl = (section: string) =>
    data.find((entry) => entry.Section === section && entry.ImageURL)
      ?.ImageURL || "";

  const getParagraphs = () =>
    (data.find((entry) => entry.Section === "description")?.Content || "")
      .split(/\n\s*\n/)
      .filter(Boolean);

  const getPhases = () => data.filter((entry) => entry.Section === "phase");

  useEffect(() => {
    let didCancel = false;

    const loadFallbackAndUpdate = async () => {
      try {
        const res = await fetch(FALLBACK_JSON);
        const fallbackData = await res.json();
        if (!didCancel) {
          setData(fallbackData.content || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load fallback JSON:", err);
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
            setData(cachedData || []);
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

      axios
        .get(API_URL)
        .then((res) => {
          const newData = res.data.content || [];
          if (!didCancel) {
            setData(newData);
            setLoading(false);
          }
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: newData, timestamp: Date.now() })
          );
        })
        .catch((err) => {
          console.error("Error fetching live history data:", err);
        });
    };

    loadData();
    return () => {
      didCancel = true;
    };
  }, []);

  if (loading) return <Loading />;

  return (
  <div className="min-h-screen bg-brand-light">
    <main className="pt-[14vh]">

      <section className="relative flex items-center justify-center
                          h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden">
        <Image
          src="/images/hero-banner.jpg"          // keep this banner everywhere
          alt="History banner background"
          fill
          priority
          quality={85}
          className="object-cover"
        />
        {/* <div className="absolute inset-0 z-0 bg-black/20 " /> */}
        <h1 className="relative z-10 font-bold text-brand-light
                       text-3xl sm:text-4xl md:text-5xl ">
          {getContent('banner','Title') || 'Our History'}
        </h1>
      </section>

      <section className="py-16 bg-brand-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-10 items-center">
          {/* text */}
          <div className="flex-1 space-y-6 text-gray-700 leading-relaxed">
            {getParagraphs().map((p,i)=>(
              <p key={i} className="text-justify text-base md:text-lg">{p}</p>
            ))}
          </div>

          {/* image */}
          <div className="w-full md:w-1/2 relative h-80 md:h-[400px]">
            <Image
              src={getImageUrl('description')}
              alt="JSSD history"
              fill
              className="rounded-xl shadow-soft object-cover"
            />
          </div>
        </div>
      </section>

      {/* ───────── PHASES / TIMELINE ───────── */}
      <section className="py-12 bg-white border-t border-orange-200">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          {getPhases().map((ph,i)=>(
            <div key={i} className="space-y-2">
              <h3 className="text-accent font-bold text-lg md:text-xl">{ph.Label}</h3>
              <p className="text-brand-dark text-justify text-sm md:text-base leading-relaxed">
                {ph.Content}
              </p>
            </div>
          ))}
        </div>
      </section>

    </main>
  </div>
);

};

export default HistoryPage;
