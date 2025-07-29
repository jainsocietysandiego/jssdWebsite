"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const API_URL =
  "https://script.google.com/macros/s/AKfycbyK_7X_B2nnubo_DCrsmYI93Iqff7Yo27oPTsTWKqKBp0p3zZDKqzyTgyVSMn1K0BvP/exec";
const FALLBACK_JSON = "/about-history.json";
const CACHE_KEY = "history-data";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface SheetEntry {
  Section: string;
  Label: string;
  Content: string;
  ImageURL?: string;
}

const HistorySkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 animate-pulse">
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

  if (loading) return <HistorySkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <main className="pt-16">
        <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold">
              {getContent("banner", "Title") || "Our History"}
            </h1>
          </div>
        </section>

        <section className="py-12 bg-white border border-shadow-md border-colour-gray rounded-xl">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1 space-y-6 text-gray-800 text-lg leading-relaxed text-justify">
              {getParagraphs().map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center relative h-[400px] mt-12">
              <div className="relative w-[90%] h-[90%]">
                <Image
                  src={getImageUrl("description")}
                  alt="History"
                  fill
                  className="rounded-lg shadow-md object-cover ml-16"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 bg-orange-50">
          <div className="max-w-5xl mx-auto px-4 space-y-10">
            {getPhases().map((phase, idx) => (
              <div key={idx}>
                <h3 className="text-xl font-bold text-orange-700 mb-2">
                  {phase.Label}
                </h3>
                <p className="text-gray-700 text-base leading-relaxed">
                  {phase.Content}
                </p>
              </div>
            ))}
          </div>
        </section>
        <div className="w-full h-[100px] bg-white"></div>
      </main>
    </div>
  );
};

export default HistoryPage;
