"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

const API_URL =
  "https://script.google.com/macros/s/AKfycbz0uWMSA2J_UnV2I3OeqGjVvS3HP58PpprD6660IhHRmmHwk7nYa1tn74ik3a8C53e1/exec";
const FALLBACK_JSON = "/religious-activities.json";
const CACHE_KEY = "religious-activities-data";
const CACHE_TTL = 10 * 60 * 1000;

interface SheetEntry {
  Section: string;
  Title: string;
  Description: string;
}

/* ───────── LOADER ───────── */
const BeautifulLoader = () => (
  <div className="min-h-screen bg-brand-light flex items-center justify-center px-4">
    <div className="text-center">
      {/* Animated rings */}
      <div className="relative mx-auto mb-6 md:mb-8 w-20 h-20 sm:w-24 sm:h-24">
        <div className="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
        <div className="absolute inset-2 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-4 border-4 border-brand-dark/30 border-r-transparent rounded-full animate-spin-reverse"></div>
        <div className="absolute inset-6 w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-full flex items-center justify-center animate-pulse">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Loading text */}
      <h3 className="text-lg sm:text-xl font-semibold text-brand-dark mb-1">
        Jai Jinendra
      </h3>
      <p className="text-sm sm:text-base text-accent animate-pulse">
        Ahimsa Parmo Dharma
      </p>

      {/* Animated dots */}
      <div className="flex justify-center space-x-1 mt-4">
        <div
          className="w-2 h-2 bg-accent rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-accent rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-accent rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  </div>
);

const ReligiousActivitiesPage: React.FC = () => {
  const [data, setData] = useState<SheetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const getIntroParagraphs = () =>
    data
      .filter((entry) => entry.Section === "intro")
      .map((entry) => entry.Description);

  const getActivities = () => data.filter((entry) => entry.Section === "activity");

  /* ───────── DATA FETCH ───────── */
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
      } catch {
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
          /* ignore corrupt cache */
        }
      }

      if (shouldFetch) await loadFallbackAndUpdate();

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
        .catch(() => {});
    };

    loadData();
    return () => {
      didCancel = true;
    };
  }, []);

  if (loading) return <BeautifulLoader />;

  /* ───────── RENDER ───────── */
  return (
    <div className="min-h-screen bg-brand-light">
      <main className="pt-[14vh]">
        {/* Banner */}
        <section className="relative flex items-center justify-center h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden">
          <Image
            src="/images/hero-banner.jpg"
            alt="Religious Activities banner"
            fill
            priority
            quality={85}
            className="object-cover"
          />
          <h1 className="relative z-10 font-bold text-brand-light text-3xl sm:text-4xl md:text-5xl">
            Religious Activities
          </h1>
        </section>

        {/* Intro */}
        <section className="py-12 bg-brand-white">
          <div className="max-w-6xl mx-auto px-4 space-y-6">
            {getIntroParagraphs().map((paragraph, i) => (
              <p
                key={i}
                className="text-justify text-base sm:text-lg text-gray-700 leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Activities – clean bullet list */}
        <section className="py-8 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="space-y-6">
              {getActivities().map((activity, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-5 sm:p-6 bg-white shadow-soft"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-accent rounded-full mt-2.5"></div>
                    <div className="flex-1">
                      <h3 className="text-accent font-bold text-lg sm:text-xl mb-1.5">
                        {activity.Title}
                      </h3>
                      <p className="text-brand-dark text-sm sm:text-base leading-relaxed">
                        {activity.Description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReligiousActivitiesPage;
