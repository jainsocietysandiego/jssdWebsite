"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import { useRouter,usePathname  } from "next/navigation"; 
import MailingListForm from "./mailingListSection";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzN9-QOSlSBd5GWQqfnBljehPnKYiGHAbYbs3MjKVA3Bs4MPQO6X6UF5k-oh6UCOwMaTA/exec";
const CACHE_KEY = "homepage-api";
const CACHE_TTL = 1 * 60 * 1000; // 10 minutes

const Home: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [missionPointsWarning, setMissionPointsWarning] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMailingModal, setShowMailingModal] = useState(false);

  const pathname = usePathname();

useEffect(() => {
  if (typeof window === "undefined") return;

  if (pathname === "/") {
    const hash = window.location.hash;
    if (hash) {
      const scrollToHash = () => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };
      setTimeout(scrollToHash, 500);
    }
  }
}, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMailingModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load from localStorage or /homepage.json
  useEffect(() => {
    const loadData = async () => {
      let shouldFetch = true;

      // 1. Try from localStorage
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setData(cachedData);
            shouldFetch = false;
          }
        } catch {
          // corrupted cache
        }
      }

      // 2. If still no data, load from public/homepage.json
      if (!cached || shouldFetch) {
        if (!data) {
          const fallback = await fetch("/homepage.json")
            .then((res) => res.json())
            .catch(() => null);
          if (fallback) setData(fallback);
        }

        // 3. Fetch fresh data in background
        fetch(API_URL)
          .then((res) => res.json())
          .then((liveData) => {
            setData(liveData);
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ data: liveData, timestamp: Date.now() })
            );

            if (liveData.missionPoints?.length > 5) {
              setMissionPointsWarning(
                "You cannot add more than 10 mission points."
              );
            }
          })
          .catch(() => {});
      }
    };

    loadData();
  }, []);

  // Preload slide images
  useEffect(() => {
    if (data?.slides) {
      data.slides.forEach((slide: any) => {
        const img = new window.Image();
        img.src = slide.url;
      });
    }
  }, [data]);

  useEffect(() => {
    if (!data?.slides) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [data]);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % data.slides.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + data.slides.length) % data.slides.length
    );
  const scrollToAbout = () =>
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });

  const handleFeedbackSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    formData.append("access_key", "4c5f5788-8bae-46e1-b35a-f2f8b7b93318");
    formData.append("from_name", formData.get("email") as string);
    formData.append("subject", "New Feedback Submission from Website");
    formData.append("replyto", formData.get("email") as string);

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: json,
    });

    const result = await response.json();
    if (result.success) {
      console.log("Feedback submitted successfully:", result);
      alert("Thank you for your feedback!");
    } else {
      alert("Error! Please try again.");
    }

    form.reset();
  };

  if (!data)
    return <div className="min-h-screen bg-orange-100">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <main>
        <div className="pt-16">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white text-center py-6">
            <h1 className="text-3xl md:text-4xl font-bold">
              {data.headerTitle}
            </h1>
          </div>

          {/* Hero */}
          <section className="relative h-screen overflow-hidden">
            <div className="absolute inset-0">
              {data.slides.map((slide: any, i: number) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    i === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={slide.url}
                    alt={slide.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                </div>
              ))}
            </div>
            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="text-center text-white px-4 max-w-4xl">
                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                  {data.heroHeading}
                </h2>
                <p className="text-xl md:text-2xl mb-8">{data.heroTagline}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={scrollToAbout}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    Learn More <ArrowDown className="ml-2 h-5 w-5" />
                  </button>
                  <a
                    href="/membership"
                    className="bg-transparent border-2 border-white hover:bg-white hover:text-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Become a JSSD Member
                  </a>
                  <a
                    href="/contribute"
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Make a Donation
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {data.slides.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {data.aboutHeading}
                </h2>
                <div className="w-24 h-1 bg-orange-600 mx-auto mb-8"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {data.aboutDescription}
                  </p>
                  <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-600">
                    <blockquote className="text-lg italic text-gray-800">
                      {data.aboutQuote}
                    </blockquote>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {data.stats.map((stat: any, i: number) => (
                      <div
                        key={i}
                        className="text-center p-6 bg-gray-50 rounded-lg"
                      >
                        <h3 className="text-2xl font-bold text-orange-600 mb-2">
                          {stat.number}
                        </h3>
                        <p className="text-gray-600">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Our Mission Box*/}
                <div className="relative lg:top-[-78px] md:top-[-20px] sm:top-0">
                  <div className="bg-gradient-to-r from-orange-400 to-amber-400 p-8 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-bold text-white mb-6">
                      {data.missionHeading}
                    </h3>
                    <ul className="space-y-3 text-white">
                      {data.missionPoints
                        ?.slice(0, 10)
                        .map((point: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>{point}</span>
                          </li>
                        ))}
                    </ul>
                    {missionPointsWarning && (
                      <p className="text-red-500 text-sm mt-4">
                        {missionPointsWarning}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Calendar */}
          <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold text-orange-700 mb-6">
                Announcements & JCNC Calendar
              </h2>
              <div className="flex justify-center">
                <iframe
                  src="https://calendar.google.com/calendar/embed?src=6db58ce32d670528f394614b256b704b7af31460e88f5755f1057e7cdcdf04ac%40group.calendar.google.com&ctz=Asia%2FKolkata"
                  style={{ border: 0 }}
                  width="100%"
                  height="600"
                  frameBorder="0"
                  scrolling="no"
                  className="max-w-4xl w-full rounded shadow-lg"
                ></iframe>
              </div>
            </div>
          </section>

          {/* Feedback */}
          <section id = 'feedback' className="bg-orange-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-4xl font-bold text-orange-700 mb-4">
                  {data.feedbackHeading}
                </h2>
              </div>
              <div>
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name*"
                    required
                    className="w-full border border-gray-300 rounded px-4 py-2"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email*"
                    required
                    className="w-full border border-gray-300 rounded px-4 py-2"
                  />
                  <select
                    name="category"
                    required
                    className="w-full border border-gray-300 rounded px-4 py-2"
                  >
                    <option value="">--Please choose an option--</option>
                    <option>Any</option>
                    <option>Religious</option>
                    <option>Cultural</option>
                    <option>Education</option>
                    <option>Facilities</option>
                    <option>Technology</option>
                    <option>Rental</option>
                    <option>Public Relation</option>
                    <option>Finance</option>
                    <option>Kitchen</option>
                    <option>Library</option>
                    <option>Other</option>
                  </select>
                  <textarea
                    name="message"
                    placeholder="Message"
                    rows={4}
                    required
                    className="w-full border border-gray-300 rounded px-4 py-2"
                  ></textarea>
                  <button
                    type="submit"
                    className="w-full bg-orange-700 text-white py-2 rounded hover:bg-orange-800 transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-10 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold mb-6">{data.ctaHeading}</h2>
              <p className="text-xl mb-8 opacity-90">{data.ctaTagline}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/membership"
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Become a Member
                </a>
                <a
                  href="/events"
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  View Events
                </a>
                <button onClick={() => setShowMailingModal(true)} className="bg-transparent border-2 border-white hover:bg-white hover:text-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">Add to mailing list</button>
              </div>
            </div>
          </section>
          {showMailingModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative">
              <button onClick={() => setShowMailingModal(false)} className="absolute top-4 right-4 text-gray-600 text-2xl font-bold hover:text-black">×</button>
              <MailingListForm />
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default Home;
