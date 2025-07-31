"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Users, Clock, Star, X, Utensils, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

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
  const [isLunchModalOpen, setIsLunchModalOpen] = useState(false);
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
              setError("Failed to load initial data");
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
  }, [levels]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isLunchModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isLunchModalOpen]);

  // Lunch Modal component with proper scroll
  const LunchModal = () => {
    if (!isLunchModalOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setIsLunchModalOpen(false);
      }
    };

    const handleCloseModal = () => {
      setIsLunchModalOpen(false);
    };

    // Close modal on ESC key
    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsLunchModalOpen(false);
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
      };
    }, []);

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
        style={{ overflowY: "auto" }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl w-full max-w-6xl shadow-xl border border-orange-100 flex flex-col"
          style={{ maxHeight: "90vh", height: "90vh" }}
        >
          {/* Modal Header */}
          <div
            className="flex justify-between items-center p-6 md:p-8 border-b border-orange-100"
            style={{ flexShrink: 0 }}
          >
            <div className="flex items-center">
              <Utensils className="h-6 w-6 md:h-8 md:w-8 text-orange-600 mr-3" />
              <h2 className="text-2xl md:text-3xl font-bold text-orange-600">
                Sponsoring Lunches For Pathshala
              </h2>
            </div>
            <button
              onClick={handleCloseModal}
              aria-label="Close modal"
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              style={{ flexShrink: 0 }}
            >
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div
            className="p-6 md:p-8 space-y-8 overflow-y-auto"
            style={{ flex: 1 }}
          >
            <div className="space-y-4">
              <p className="text-gray-700 text-lg leading-relaxed">
                After the Pathshala session for the day is over, the Pathshala
                Students and their Families can enjoy the Lunch get-together.
              </p>

              <p className="text-gray-700 text-lg leading-relaxed">
                We encourage each Pathshala Student Family to sign-up atleast
                once during the calendar year for sponsoring the Lunch.
              </p>

              <p className="text-gray-700 text-lg leading-relaxed">
                You can sign up to sponsor lunch as part of the registration
                process.
              </p>
            </div>

            {/* Sponsoring Guidelines */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
              <h3 className="text-xl font-bold text-orange-700 mb-6 flex items-center">
                <Star className="h-6 w-6 mr-2" />
                Lunch Sponsoring Guidelines
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-orange-600 mr-3 mt-1 text-lg">•</span>
                  <p className="text-gray-700 leading-relaxed">
                    Please make sure the food served qualifies jain criteria.
                    Following ingredients must not be used in the items served –
                    root vegetables (e.g. onion, garlic, potatoes, carrots),
                    egg-plant, mushrooms, eggs, gelatin and other non-vegetarian
                    items
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-orange-600 mr-3 mt-1 text-lg">•</span>
                  <p className="text-gray-700 leading-relaxed">
                    Please avoid using/serving green vegetables on "tithi"
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-orange-600 mr-3 mt-1 text-lg">•</span>
                  <p className="text-gray-700 leading-relaxed">
                    Lunch is usually served at noon, so please plan on setting
                    up lunch at around 11:45.
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-orange-600 mr-3 mt-1 text-lg">•</span>
                  <p className="text-gray-700 leading-relaxed">
                    Please be mindful that a few pathshala students and members
                    are vegan.
                  </p>
                </div>
              </div>
            </div>

            {/* Cleanup Guidelines */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-200">
              <h3 className="text-xl font-bold text-amber-700 mb-4 flex items-center">
                <Users className="h-6 w-6 mr-2" />
                Guidelines for cleaning up after Lunch
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                We thank the volunteer families for helping with clean up tasks
                after lunch. The below is a set of guidelines to help with the
                tasks.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-amber-600 mr-3 font-semibold bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    1
                  </span>
                  <p className="text-gray-700 leading-relaxed">
                    Cleaning up the dishes (loading in dishwasher).
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-amber-600 mr-3 font-semibold bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    2
                  </span>
                  <p className="text-gray-700 leading-relaxed">
                    If washed manually, dry them with dish cloth.
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-amber-600 mr-3 font-semibold bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    3
                  </span>
                  <p className="text-gray-700 leading-relaxed">
                    Do the necessary kitchen cleaning after doing dishes.
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-amber-600 mr-3 font-semibold bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    4
                  </span>
                  <p className="text-gray-700 leading-relaxed">
                    Vacuuming the dining hall floors, kitchen floors and
                    surfaces.
                  </p>
                </div>
              </div>
            </div>

            {/* Extra content for scrolling */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-xl font-bold text-blue-700 mb-4">
                Additional Information
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                This is additional content to demonstrate that the modal scroll
                is working properly. You should be able to scroll down to see
                this content and the footer below.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                The modal maintains proper scrolling behavior while keeping the
                header and close button accessible at all times.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Thank you for being part of our Pathshala community and
                contributing to our shared meals and fellowship.
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            className="flex justify-end p-6 md:p-8 pt-4 border-t border-gray-100"
            style={{ flexShrink: 0 }}
          >
            <button
              onClick={handleCloseModal}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Skeleton component while loading
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

  if (error) {
    return (
      <div className="min-h-screen text-center text-red-600 flex items-center justify-center p-4">
        {error}
      </div>
    );
  }

  if (loading || levels.length === 0) {
    return <Skeleton />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <main>
          <div className="pt-16">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20 text-center h-48 sm:h-52 md:h-56 lg:h-60">
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
                        <p className="text-gray-600 mb-4">{level.Description}</p>
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

                {/* Pathshala Lunch Section */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-8 border border-orange-200 shadow-sm">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between">
                    <div className="lg:w-2/3">
                      <div className="flex items-center mb-6">
                        <div className="bg-orange-100 p-3 rounded-full mr-4">
                          <Utensils className="h-8 w-8 text-orange-600" />
                        </div>
                        <h2 className="text-4xl font-bold text-orange-700">
                          Pathshala Lunch
                        </h2>
                      </div>
                      <p className="text-gray-700 text-lg leading-relaxed mb-4">
                        Join us for a community lunch after each Pathshala
                        session! It's a wonderful opportunity for students and
                        families to come together, share a meal, and strengthen
                        our community bonds while following Jain dietary
                        principles.
                      </p>
                      <p className="text-gray-600 text-base">
                        Every family is encouraged to sponsor a lunch during the
                        year to support our community gathering.
                      </p>
                    </div>

                    <div className="lg:w-1/3 flex flex-row gap-4 w-full lg:w-auto lg:self-center">
                      <button
                        onClick={() => setIsLunchModalOpen(true)}
                        className="group flex items-center justify-center px-6 py-3 bg-white border-2 border-orange-600 text-orange-600 rounded-xl font-semibold hover:bg-orange-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md flex-1"
                      >
                        <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                        Know More
                      </button>

                      <button
                        onClick={() => {
                          router.push("/contribute");
                        }}
                        className="group flex items-center justify-center px-6 py-3 bg-white border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md flex-1"
                      >
                        <Heart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                        Donate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      <LunchModal />
    </>
  );
};

export default Pathsala;
