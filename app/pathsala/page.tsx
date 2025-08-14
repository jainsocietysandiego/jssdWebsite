"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Users, Clock, Star, Utensils, Heart, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LunchModal from "../components/lunchModal";
import Image from "next/image";

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
  "https://script.google.com/macros/s/AKfycbyHVNzO5Wbr-OBUAD_KPKPazFsZWz4ak7LONoccChBmZnAmnINE6cUbcnmH_647G5urKw/exec";
const LUNCH_API_URL =
  "https://script.google.com/macros/s/AKfycbwYiIqVZVVqPzxhDGmRowu2fbedIR1ejj6kF_FDeS_B9ZqFkRb5ugENe9t6XDV3TmjlBA/exec";
const LEVELS_FALLBACK_JSON = "/pathsala.json";

const LEVELS_CACHE_KEY = "pathsala-levels-cache";
const LUNCH_CACHE_KEY = "pathsala-lunch-cache";
const CACHE_TTL = 10 * 60 * 1000;

const Pathsala: React.FC = () => {
  const router = useRouter();

  const [levels, setLevels] = useState<LevelData[]>([]);
  const [lunchContent, setLunchContent] = useState<Record<string, string>>({});
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [loadingLunch, setLoadingLunch] = useState(true);
  const [errorLevels, setErrorLevels] = useState<string | null>(null);
  const [errorLunch, setErrorLunch] = useState<string | null>(null);

  const [isLunchModalOpen, setIsLunchModalOpen] = useState(false);

  // Your existing useEffect hooks remain exactly the same
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
          if (isMounted) setErrorLevels("Failed to load fallback data");
        }

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

  const isLoading = loadingLevels || loadingLunch;
  const hasError = errorLevels || errorLunch;

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
      <div className="min-h-screen bg-brand-light">
        <main>
          <div className="pt-[8vh] sm:pt-[12vh]">
            {/* Hero Section - UNCHANGED */}
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
                  Pathshala Program
                </h1>
                <p className="mt-2 max-w-4xl mx-auto text-white text-sm sm:text-base md:text-lg text-center">
                  Nurturing young minds with Jain values, philosophy, and cultural heritage
                </p>
              </div>
            </section>

            <section className="py-16 md:py-20 bg-brand-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 md:mb-16">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-dark mb-4">
                    About Our Pathshala
                  </h2>
                  <div className="w-16 md:w-24 h-1 bg-accent mx-auto mb-4 rounded-full"></div>
                  <p className="text-brand-dark/80 max-w-4xl mx-auto text-sm md:text-base text-center">
                    Our Pathshala program provides comprehensive Jain education
                    from childhood through young adulthood. Each level builds
                    upon the previous, creating a strong foundation in Jain
                    principles and practices.
                  </p>
                </div>

                {/* NEW: Two Column Layout - Levels + Sidebar */}
                <div className="grid lg:grid-cols-12 gap-8 mb-16">
                    <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent transform -translate-x-1/2"></div>
                  
                  {/* Left Side: Original Levels Grid - UNCHANGED except grid layout */}
                  <div className="lg:col-span-8">
                    <div className="space-y-5">
  {levels.map((level) => (
    <div
      key={level.Level}
      className="bg-brand-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-gray-200 transition-all duration-300 overflow-hidden group"
    >
      <div className="flex items-stretch p-6 sm:p-7">
        
        {/* Level Indicator */}
        <div className="flex-shrink-0 w-1 bg-gradient-to-b from-accent to-orange-600 rounded-full"></div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 pl-6 flex flex-col justify-between">
          
         {/* Title Row */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h4 className="flex items-center gap-3 text-xl font-bold text-brand-dark group-hover:text-accent transition-colors duration-300">
            <span className="text-lg sm:text-xl font-semibold text-accent bg-accent/10 px-3 py-1 rounded-lg">
              Level {level.Level}
            </span>
            {level.Title}
          </h4>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 text-accent px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap border border-orange-200">
            {level["Age Group"]}
          </div>
        </div>


          {/* Description */}
          <p className="text-brand-dark/70 text-sm leading-relaxed line-clamp-2 mb-4 font-medium">
            {level.Description}
          </p>

          {/* Meta Data */}
          <div className="flex flex-wrap gap-4 text-sm text-brand-dark/60">
            <div className="flex items-center gap-2 bg-accent/5 px-3 py-1.5 rounded-lg border border-accent/10">
              <Star className="h-4 w-4 text-accent" />
              <span className="font-medium">{level.Fees}</span>
            </div>
            <div className="flex items-center gap-2 bg-accent/5 px-3 py-1.5 rounded-lg border border-accent/10">
              <Clock className="h-4 w-4 text-accent" />
              <span className="font-medium">{level.Duration}</span>
            </div>
            <div className="flex items-center gap-2 bg-accent/5 px-3 py-1.5 rounded-lg border border-accent/10">
              <Users className="h-4 w-4 text-accent" />
              <span className="font-medium">{level.Students} enrolled</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0 self-center ml-8">
          <button
            onClick={() => {
              sessionStorage.setItem(
                `pathsala-level-${level.Level}`,
                JSON.stringify(level)
              );
              router.push(`/pathsala/level-${level.Level}`);
            }}
            className="bg-gradient-to-r from-accent to-orange-600 hover:from-orange-600 hover:to-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 text-sm whitespace-nowrap shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-0.5"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  ))}
</div>

                  </div>

                  {/* NEW: Right Side Sidebar */}
                  <aside className="lg:col-span-4">
                    <div className="sticky top-8 space-y-6">
                      {/* Pathshala Registration CTA */}
                      <div className="bg-gradient-to-br from-[#EA580C] via-[#D3490C] to-[#C2410C] rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300">
                            <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-accent" />
                            </div>
                            <h3 className="text-xl font-bold text-brand-light mb-3">
                            Ready to Join?
                            </h3>
                            <p className="text-white mb-6 text-sm text-center">
                            Register for this level or contact us for more information about our Pathshala program.
                            </p>
                                      <div className="space-y-3">
                                        <a
                                          href="/pathsala/register"
                                          className="block bg-brand-light hover:bg-brand-white text-brand-dark hover:text-accent py-3 px-6 rounded-xl font-semibold text-center text-sm md:text-base transition-all duration-300 hover:scale-105"
                                        >
                                          Register Now
                                        </a>
                                      </div>
                                    </div>                     
                      
                    </div>
                  </aside>
                </div>

                {/* Your existing features section - UNCHANGED */}
                <div className="bg-brand-light rounded-xl p-6 md:p-8 mb-16">
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
                        <div className="bg-accent text-brand-light p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <item.icon className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-brand-dark mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-700 text-sm md:text-md text-center">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Your existing lunch section - UNCHANGED */}
                <div className="bg-brand-light rounded-xl p-6 md:p-8 border-soft shadow-soft">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between">
                    <div className="lg:w-2/3">
                      <div className="flex items-center mb-6">
                        <div className="bg-[rgba(234,88,12,0.1)] p-3 rounded-full mr-4">
                          <Utensils className="h-8 w-8 text-accent" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent">
                          {lunchContent.lunch_heading}
                        </h2>
                      </div>
                      <p className="text-brand-dark text-base md:text-md leading-relaxed mb-4 text-justify">
                        {lunchContent.lunch_intro}
                      </p>
                      <p className="text-brand-dark/80 text-sm md:text-md text-justify">
                        {lunchContent.lunch_call}
                      </p>
                    </div>
                    
                    <div className="lg:w-1/3 flex flex-row gap-4 w-full lg:w-auto lg:self-center mt-6 lg:mt-0">
                      <button
                        onClick={() => setIsLunchModalOpen(true)}
                        className="group flex items-center justify-center px-4 md:px-6 py-3 bg-brand-white border-2 border-accent text-accent rounded-xl font-semibold hover:bg-accent hover:text-white transition-all duration-300 shadow-soft hover:shadow-lg flex-1 text-sm md:text-base"
                      >
                        <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                        {lunchContent.button_one ?? "Know More"}
                      </button>
                      
                      <button
                        onClick={() => {
                          router.push('/pathsala/lunch-donation');
                        }}
                        className="group flex items-center justify-center px-4 md:px-6 py-3 bg-brand-white border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-600 hover:text-white transition-all duration-300 shadow-soft hover:shadow-lg flex-1 text-sm md:text-base"
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
      
      <LunchModal 
        isOpen={isLunchModalOpen} 
        onClose={() => setIsLunchModalOpen(false)} 
        lunch={lunchContent}
      />
    </>
  );
};

export default Pathsala;
