"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Users, Clock, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface LevelData {
  Level: string;
  Title: string;
  Description: string;
  "Age Group": string;
  Duration: string;
  Students: number;
  Fees: string;
  "Topics Covered": string;
  "Key Activities ": string;
  "Teachers Note": string;
  "Learning Outcome": string;
}

const API_URL =
  "https://script.google.com/macros/s/AKfycbyHVNzO5Wbr-OBUAD_KPKPazFsZWz4ak7LONoccChBmZnAmnINE6cUbcnmH_647G5urKw/exec";
const LOCAL_JSON_PATH = "/pathsala.json";
const CACHE_KEY = "pathshala-api";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const Pathsala: React.FC = () => {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      let shouldFetch = true;

      // 1. Try cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setLevels(cachedData);
            setLoading(false);
            shouldFetch = false;
            console.log("[Cache] Loaded Pathshala data from cache.");
          }
        } catch {
          console.warn("Invalid cache format, skipping cache.");
        }
      }

      // 2. If no cache data loaded yet, try loading local fallback JSON
      if (shouldFetch && isMounted) {
        try {
          console.time("Fallback JSON Fetch Time");
          const res = await fetch(LOCAL_JSON_PATH);
          if (!res.ok)
            throw new Error(`Fallback JSON HTTP error: ${res.status}`);
          const fallback = await res.json();
          console.timeEnd("Fallback JSON Fetch Time");
          if (fallback?.levels && isMounted) {
            setLevels(fallback.levels);
            setLoading(false);
            console.log("[Fallback JSON] Loaded fallback pathsala.json");
          }
        } catch (e) {
          console.timeEnd("Fallback JSON Fetch Time");
          console.error("❌ Failed to load fallback JSON:", e);
          setTimeout(() => {
            if (isMounted && levels.length === 0) {
              setError("Failed to load initial data.");
              setLoading(false);
            }
          }, 500);
        }
      }

      // 3. Always refresh cache and state in background with API call
      try {
        console.time("API Fetch Time");
        const res = await fetch(API_URL);
        console.timeEnd("API Fetch Time");
        if (!res.ok) throw new Error(`API HTTP error: ${res.status}`);
        const apiData = await res.json();
        if (apiData?.levels && isMounted) {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: apiData.levels, timestamp: Date.now() })
          );
          if (JSON.stringify(apiData.levels) !== JSON.stringify(levels)) {
            setLevels(apiData.levels);
            console.log("[API] Updated Pathshala levels with fresh API data.");
          } else {
            console.log("[API] API data is same as current state, no update.");
          }
        }
      } catch (e) {
        console.timeEnd("API Fetch Time");
        console.warn("⚠️ Background fetch failed:", e);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [levels]); // Depend on levels so update works correctly

  // --- Skeleton shown while loading OR if no levels data loaded yet ---
  const Skeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 animate-pulse">
      <main>
        <div className="pt-16">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20 text-center">
            <div className="h-10 w-1/3 mx-auto rounded bg-orange-300" />
            <div className="mt-4 h-6 w-1/2 mx-auto rounded bg-orange-200" />
          </div>
          <section className="py-20 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg shadow-lg border border-orange-100 p-6"
                >
                  <div className="h-6 w-20 bg-orange-200 rounded mb-4 animate-pulse" />
                  <div className="h-4 bg-orange-100 rounded mb-2 animate-pulse" />
                  <div className="h-3 bg-orange-100 rounded mb-6 animate-pulse" />
                  <div className="space-y-2 mb-6">
                    {[...Array(3)].map((__, i) => (
                      <div
                        key={i}
                        className="h-4 bg-orange-150 rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                  <div className="h-10 bg-orange-300 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );

  // --- Render error if occurred ---
  if (error) {
    return (
      <div className="min-h-screen text-center text-red-600 flex items-center justify-center p-4">
        {error}
      </div>
    );
  }

  // --- Show skeleton while loading or no data yet ---
  if (loading || levels.length === 0) {
    return <Skeleton />;
  }

  // --- Main render ---
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <main>
          <div className="pt-16">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Pathshala Program
              </h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Nurturing young minds with Jain values, philosophy, and cultural
                heritage
              </p>
            </div>

            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    About Our Pathshala
                  </h2>
                  <p className="text-gray-600 max-w-3xl mx-auto">
                    Our Pathshala program provides comprehensive Jain education
                    from childhood through young adulthood. Each level builds
                    upon the previous, creating a strong foundation in Jain
                    principles and practices.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {levels.map((level) => (
                    <div
                      key={level.Level}
                      className="bg-white rounded-lg shadow-lg border border-orange-100 hover:shadow-xl transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl font-bold text-orange-600">
                            Level {level.Level}
                          </h3>
                          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                            {level["Age Group"]}
                          </div>
                        </div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-3">
                          {level.Title}
                        </h4>
                        <p className="text-gray-600 mb-4">
                          {level.Description}
                        </p>
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="h-4 w-4 mr-2" />
                            <span>Fees: {level.Fees}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{level.Duration} per session</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{level.Students} students enrolled</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            sessionStorage.setItem(
                              `pathsala-level-${level.Level}`,
                              JSON.stringify(level)
                            );
                            router.push(`/pathsala/level-${level.Level}`);
                          }}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-orange-50 rounded-lg p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      {
                        icon: BookOpen,
                        title: "Comprehensive Curriculum",
                        desc: "Age-appropriate lessons on Jain philosophy, history, and practices",
                      },
                      {
                        icon: Users,
                        title: "Experienced Teachers",
                        desc: "Volunteer teachers with deep knowledge of Jain traditions",
                      },
                      {
                        icon: Star,
                        title: "Cultural Activities",
                        desc: "Festivals, competitions, and cultural programs to enhance learning",
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div className="bg-orange-600 text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <item.icon className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      
    </>
  );
};

export default Pathsala;
