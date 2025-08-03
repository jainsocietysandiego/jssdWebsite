"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Users, Clock, Star, Utensils, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LunchModal from "../components/lunchModal";

interface LevelData {
  Level: string;
  Title: string;
  Description: string;
  "Age Group": string;
  Duration: string;
  Fees: string | number;
  Students: string | number;
  "Topics Covered": string;
  "Key Activities ": string;
  "Teachers Note": string;
  "Learning Outcome": string;
}

const LEVELS_API_URL =
  "https://script.google.com/macros/s/AKfycbyHVNzO5Wbr-OBUAD_KPKPazFsZWz4ak7LONoccChBmZnAmnINE6cUbcnmH_647G5urKw/exec"; // replace with actual URL if different
const LUNCH_API_URL =
  "https://script.google.com/macros/s/AKfycbwYiIqVZVVqPzxhDGmRowu2fbedIR1ejj6kF_FDeS_B9ZqFkRb5ugENe9t6XDV3TmjlBA/exec"; // your provided URL https://script.google.com/macros/s/AKycbaseurl-for-lunch-json;
const LEVELS_FALLBACK_JSON = "/pathsala.json";

const LEVELS_CACHE_KEY = "pathsala-levels-cache";
const LUNCH_CACHE_KEY = "pathsala-lunch-cache";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

const Pathsala: React.FC = () => {
  const router = useRouter();

  const [levels, setLevels] = useState<LevelData[]>([]);
  const [lunchContent, setLunchContent] = useState<Record<string, string>>({});
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [loadingLunch, setLoadingLunch] = useState(true);
  const [errorLevels, setErrorLevels] = useState<string | null>(null);
  const [errorLunch, setErrorLunch] = useState<string | null>(null);

  const [isLunchModalOpen, setIsLunchModalOpen] = useState(false);

  // Load levels data (with caching and fallback)
  useEffect(() => {
    let isMounted = true;

    async function loadLevels() {
      try {
        const cached = localStorage.getItem(LEVELS_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL && Array.isArray(data)) {
            if (isMounted) {
              setLevels(data);
              setLoadingLevels(false);
              console.log("[Levels] Loaded from cache");
              return;
            }
          }
        }

        // fetch fallback first
        try {
          const fallbackRes = await fetch(LEVELS_FALLBACK_JSON);
          if (!fallbackRes.ok) {
            throw new Error(`Fallback JSON load failed: ${fallbackRes.status}`);
          }
          const fallbackData = await fallbackRes.json();
          if (
            isMounted &&
            fallbackData.levels &&
            Array.isArray(fallbackData.levels)
          ) {
            setLevels(fallbackData.levels);
            setLoadingLevels(false);
            console.log("[Levels] Loaded from fallback JSON");
          }
        } catch (fallbackErr) {
          console.warn("[Levels] Fallback load failed", fallbackErr);
          // will try to fetch from API next
          if (isMounted) setErrorLevels("Failed to load fallback data");
        }

        // fetch main API for fresh data (non-blocking for UI)
        const apiRes = await fetch(LEVELS_API_URL);
        if (!apiRes.ok)
          throw new Error(`Levels API fetch error: ${apiRes.status}`);
        const apiJson = await apiRes.json();

        if (
          isMounted &&
          apiJson.levels &&
          Array.isArray(apiJson.levels) &&
          JSON.stringify(apiJson.levels) !== JSON.stringify(levels)
        ) {
          setLevels(apiJson.levels);
          localStorage.setItem(
            LEVELS_CACHE_KEY,
            JSON.stringify({ data: apiJson.levels, timestamp: Date.now() })
          );
          console.log("[Levels] Updated from API");
        }
        if (isMounted) setLoadingLevels(false);
      } catch (e) {
        console.error("[Levels] Fetch error", e);
        if (isMounted) {
          setErrorLevels("Failed to load program levels");
          setLoadingLevels(false);
        }
      }
    }

    loadLevels();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load lunch modal content data (with caching)
  useEffect(() => {
    let isMounted = true;

    async function loadLunch() {
      try {
        const cached = localStorage.getItem(LUNCH_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (
            Date.now() - timestamp < CACHE_TTL &&
            data &&
            typeof data === "object"
          ) {
            if (isMounted) {
              setLunchContent(data);
              setLoadingLunch(false);
              console.log("[Lunch] Loaded from cache");
              return;
            }
          }
        }

        // fetch lunch content from API
        const res = await fetch(LUNCH_API_URL);
        if (!res.ok) throw new Error(`Lunch API fetch error: ${res.status}`);
        const json = await res.json();

        if (isMounted && json.lunch && typeof json.lunch === "object") {
          if (JSON.stringify(json.lunch) !== JSON.stringify(lunchContent)) {
            setLunchContent(json.lunch);
            localStorage.setItem(
              LUNCH_CACHE_KEY,
              JSON.stringify({ data: json.lunch, timestamp: Date.now() })
            );
            console.log("[Lunch] Loaded from API");
          }
        }

        if (isMounted) setLoadingLunch(false);
      } catch (e) {
        console.error("[Lunch] Fetch error", e);
        if (isMounted) {
          setErrorLunch("Failed to load lunch content");
          setLoadingLunch(false);
        }
      }
    }

    loadLunch();

    return () => {
      isMounted = false;
    };
  }, []);

  // Loading and error logic

  const isLoading = loadingLevels || loadingLunch;
  const hasError = errorLevels || errorLunch;

  // Simple loading component, can customize per your design
  const Loading = () => (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="text-orange-600">Loading...</div>
    </div>
  );

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-red-600 text-center p-4">
          <p>{errorLevels || errorLunch}</p>
          <button
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded"
            onClick={() => {
              localStorage.removeItem(LEVELS_CACHE_KEY);
              localStorage.removeItem(LUNCH_CACHE_KEY);
              setErrorLevels(null);
              setErrorLunch(null);
              setLoadingLevels(true);
              setLoadingLunch(true);
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !levels.length) return <Loading />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <main>
          <div className="pt-16">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20 text-center h-52">
              <h1 className="text-5xl font-bold">Pathala Program</h1>
              <p className="mt-2 max-w-3xl mx-auto text-xl">
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

                {/* Your existing levels grid */}
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

                {/* Your existing features section */}
                <div className="bg-orange-50 rounded-lg p-8 mb-16">
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

                {/* Enhanced Pathshala Lunch Section */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-8 border border-orange-200 shadow-sm">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between">
                    <div className="lg:w-2/3">
                      <div className="flex items-center mb-6">
                        <div className="bg-orange-100 p-3 rounded-full mr-4">
                          <Utensils className="h-8 w-8 text-orange-600" />
                        </div>
                        <h2 className="text-4xl font-bold text-orange-700">
                          {lunchContent.lunch_heading}
                        </h2>
                      </div>
                      <p className="text-gray-700 text-lg leading-relaxed mb-4">
                        {lunchContent.lunch_intro}
                      </p>
                      <p className="text-gray-600 text-base">
                        {lunchContent.lunch_call}
                      </p>
                    </div>
                    
                    <div className="lg:w-1/3 flex flex-row gap-4 w-full lg:w-auto lg:self-center mt-6 lg:mt-0">
                      <button
                        onClick={() => setIsLunchModalOpen(true)}
                        className="group flex items-center justify-center px-6 py-3 bg-white border-2 border-orange-600 text-orange-600 rounded-xl font-semibold hover:bg-orange-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md flex-1"
                      >
                        <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                        {lunchContent.button_one ?? "Know More"}
                      </button>
                      
                      <button
                        onClick={() => {
                          router.push('/pathsala/lunch-donation');
                        }}
                        className="group flex items-center justify-center px-6 py-3 bg-white border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md flex-1"
                      >
                        <Heart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                        {lunchContent.button_two ?? "Donate"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      
      {/* Use the separated modal component */}
      <LunchModal 
        isOpen={isLunchModalOpen} 
        onClose={() => setIsLunchModalOpen(false)} 
        lunch={lunchContent}
      />
    </>
  );
};

export default Pathsala;