"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import MailingListForm from "./mailingListSection";
import ReCAPTCHA from "react-google-recaptcha";

const API_URL =
  "https://script.google.com/macros/s/AKfycbyaIHcv54dtaQjZXzxc3crjVuhDypC1BUq5uQ3cNA4Vio0gRH9skehKgjF6lcSgoNQO/exec";
const CACHE_KEY = "homepage-api";
const CACHE_TTL = 1 * 60 * 1000; // 1 minute

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
              animation: "spin 1s linear infinite reverse",
            }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-accent rounded-full flex items-center justify-center animate-pulse">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full"></div>
          </div>
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-brand-dark mb-2">
          Jai Jinendra
        </h3>
        <p className="text-sm md:text-base text-accent animate-pulse">
          Ahimsa Parmo Dharma
        </p>
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
  </div>
);

const Home: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMailingModal, setShowMailingModal] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "submitting" | "submitted"
  >("idle");
 const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const siteKey = "6LdGip0rAAAAAKsHaqNZGhLnKNCQjmqYqOnIWI9G";

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
      if (e.key === "ArrowLeft") handlePrevSlide();
      if (e.key === "ArrowRight") handleNextSlide();
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
          console.log("Cache corrupted, will fetch fresh data");
        }
      }

      // 2. If still no data, load from public/homepage.json
      if (!cached || shouldFetch) {
        if (!data) {
          const fallback = await fetch("/homepage.json")
            .then((res) => res.json())
            .catch(() => {
              console.log("Failed to load fallback data");
              return null;
            });
          if (fallback) {
            setData(fallback);
            console.log("Loaded fallback data:", fallback);
            console.log(
              "Announcements from fallback:",
              fallback?.announcements
            );
          }
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
          })
          .catch((error) => {
            console.error("Failed to fetch live data:", error);
          });
      }
    };

    loadData();
  }, []);

  // Preload slide images
  useEffect(() => {
    if (data?.slides && Array.isArray(data.slides)) {
      data.slides.forEach((slide: any) => {
        if (slide.url) {
          const img = new window.Image();
          img.src = slide.url;
        }
      });
    }
  }, [data]);

  // Auto-advance carousel
  useEffect(() => {
    if (!data?.slides || !Array.isArray(data.slides) || data.slides.length <= 1)
      return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [data?.slides]);

  const handleNextSlide = () => {
    if (!data?.slides || !Array.isArray(data.slides)) return;
    setCurrentSlide((prev) => (prev + 1) % data.slides.length);
  };

  const handlePrevSlide = () => {
    if (!data?.slides || !Array.isArray(data.slides)) return;
    setCurrentSlide(
      (prev) => (prev - 1 + data.slides.length) % data.slides.length
    );
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  const scrollToAbout = () =>
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });

  
  const handleFeedbackSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!captchaToken) {
      alert("Please complete the CAPTCHA.");
      return;
    }

    setFeedbackStatus("submitting");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const body = new URLSearchParams();
    body.append("name", formData.get("name") as string);
    body.append("email", formData.get("email") as string);
    body.append("category", formData.get("category") as string);
    body.append("message", formData.get("message") as string);
    body.append("captchaToken", captchaToken);

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycby_pyb-DLtgdOPaELgbuH1SlhXBwnQ-F5vXifY5YNLuTwgsl-v9p4e2oItJHeY4oyZuzw/exec",
        {
          method: "POST",
          body,
          mode: "no-cors",
        }
      );

      setFeedbackStatus("submitted");
      alert("Thank you for your feedback!");
      form.reset();
      recaptchaRef.current?.reset();
      setCaptchaToken(null);

      setTimeout(() => setFeedbackStatus("idle"), 3000);
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Error! Please try again later.");
      setFeedbackStatus("idle");
    }
  };

  // Handle captcha change to get the token
  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  if (!data) return <Loading />;

  return (
    <div className="min-h-screen bg-brand-light">
      <main>
        <div className="pt-[8vh] sm:pt-[12vh]">
          {/* Enhanced Hero Carousel */}
          <section className="relative h-[92vh] sm:h-[88vh] overflow-hidden">
                {/* Carousel Container */}
                <div className="absolute inset-0">
                  {data.slides && Array.isArray(data.slides) && data.slides.map((slide: any, i: number) => (
                    <div
                      key={`slide-${i}`}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                        i === currentSlide 
                          ? "opacity-100 scale-100 z-10" 
                          : "opacity-0 scale-105 z-0"
                      }`}
                    >
                      <img
                        src={slide.url || ""}
                        alt={slide.alt || `Slide ${i + 1}`}
                        className="w-full h-[92vh] sm:h-[88vh] object-cover"
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60"></div>
                    </div>
                  ))}
                </div>

                {/* Content Overlay - Modified for bottom positioning */}
                <div className="relative z-20 flex items-end justify-center h-full pb-16 md:pb-20">
                  <div className="text-center text-brand-light px-4 max-w-5xl">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold md:mb-4 animate-fade-in drop-shadow-2xl">
                      {data.heroHeading || ""}
                    </h2>
                    <p className="text-md md:text-xl lg:text-2xl mb-4 md:mb-6 animate-fade-in-delay drop-shadow-lg font-light text-center">
                      {data.heroTagline || ""}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full md:w-auto justify-center">
                      <a
                        href="/membership"
                        className="btn-primary hover:bg-white hover:text-accent hover:border-2 hover:border-accent transition-all duration-300 flex items-center justify-center text-sm md:text-lg px-6 md:px-10 py-3 md:py-4 rounded-xl w-full md:w-auto"
                      >
                        Become a JSSD Member
                      </a>
                      <a
                        href="/contribute"
                        className="w-full sm:w-auto bg-white text-accent px-6 md:px-10 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 hover:bg-[#D3490C] hover:text-white hover:scale-105 shadow-[0_2px_4px_rgba(0,0,0,0.06)] hover:border-2 hover:border-accent text-sm md:text-lg text-center"
                      >
                        Donate Now
                      </a>                
                    </div>
                  </div>
                </div>

                {/* Navigation Arrows */}
                {data.slides && Array.isArray(data.slides) && data.slides.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevSlide}
                      className="absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-brand-light p-2 md:p-4 rounded-full transition-all duration-300 hover:scale-110 z-30 shadow-soft border border-white/20"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="h-4 w-4 md:h-7 md:w-7" />
                    </button>
                    <button
                      onClick={handleNextSlide}
                      className="absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-brand-light p-2 md:p-4 rounded-full transition-all duration-300 hover:scale-110 z-30 shadow-soft border border-white/20"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="h-4 w-4 md:h-7 md:w-7" />
                    </button>
                  </>
                )}

                {/* Enhanced Dot Indicators */}
                {data.slides && Array.isArray(data.slides) && data.slides.length > 1 && (
                  <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 md:space-x-4 z-30">
                    {data.slides.map((_: any, index: number) => (
                      <button
                        key={`dot-${index}`}
                        onClick={() => handleDotClick(index)}
                        className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 transform hover:scale-125 border-2 ${
                          index === currentSlide 
                            ? "bg-white border-white shadow-soft scale-125" 
                            : "bg-white/40 border-white/60 hover:bg-white/70"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Progress bar */}
                {data.slides && Array.isArray(data.slides) && data.slides.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
                    <div 
                      key={`progress-${currentSlide}`}
                      className="h-full bg-accent animate-progress"
                    />
                  </div>
                )}
              </section>


          {/* About Section */}
          <section id="about" className="py-16 md:py-20 bg-brand-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4">
                  {data.aboutHeading || ""}
                </h2>
                <div className="w-16 md:w-24 h-1 bg-accent mx-auto mb-8 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-base md:text-lg text-brand-dark leading-relaxed text-justify">
                    {data.aboutDescription || ""}
                  </p>

                  {data.aboutQuote && (
                    <div className="bg-brand-light p-4 md:p-6 rounded-xl border-l-4 border-accent shadow-soft">
                      <blockquote className="text-base md:text-lg italic text-brand-dark font-medium text-justify">
                        "{data.aboutQuote}"
                      </blockquote>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {data.stats &&
                      Array.isArray(data.stats) &&
                      data.stats.map((stat: any, i: number) => (
                        <div
                          key={i}
                          className="text-center p-4 md:p-6 bg-brand-light rounded-xl shadow-soft border-soft hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                          <h3 className="text-xl md:text-2xl font-bold text-accent mb-2">
                            {stat.number || ""}
                          </h3>
                          <p className="text-sm md:text-base text-brand-dark font-medium">
                            {stat.label || ""}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Our Mission Box*/}
                <div className="relative lg:top-[-78px] md:top-[-20px] sm:top-0">
                  <div className="bg-gradient-to-br from-[#EA580C] via-[#D3490C] to-[#C2410C] p-6 md:p-8 h-full rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300">
                    <h3 className="text-xl md:text-2xl font-bold text-brand-light mb-4 md:mb-6">
                      {data.missionHeading || ""}
                    </h3>
                    <ul className="space-y-3 text-brand-light">
                      {data.missionPoints &&
                        Array.isArray(data.missionPoints) &&
                        data.missionPoints
                          .slice(0, 10)
                          .map((point: string, idx: number) => (
                            <li key={idx} className="flex items-start group">
                              <span className="w-2 h-2 bg-brand-light rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></span>
                              <span className="text-sm md:text-base text-justify">
                                {point}
                              </span>
                            </li>
                          ))}
                    </ul>
                    {data.missionPoints &&
                      Array.isArray(data.missionPoints) &&
                      data.missionPoints.length > 10 && (
                        <p className="text-brand-light/80 text-xs md:text-sm mt-4 text-justify">
                          Note: Only showing first 10 mission points.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Calendar & Announcements */}
          <section className="bg-brand-white py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Google Calendar - Left Column (70% width) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="text-center lg:text-left">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent mb-4">
                      JSSD Calendar
                    </h2>
                  </div>
                  <div className="bg-brand-white rounded-2xl shadow-soft border-soft overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <iframe
                      src="https://calendar.google.com/calendar/embed?src=jainsocietyofsandiego%40gmail.com&ctz=Asia%2FKolkata&bgcolor=%23ffffff&color=%23B1440E"
                      style={{ border: 0 }}
                      width="100%"
                      height="600"
                      frameBorder="0"
                      scrolling="no"
                      className="w-full rounded-2xl"
                      title="JSSD Calendar"
                    ></iframe>
                  </div>
                </div>

                {/* Announcements - Right Column (30% width) */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="text-center lg:text-left">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent mb-5">
                      {data.announcementsHeading || "Latest Announcements"}
                    </h2>
                  </div>

                  <div className="bg-brand-white rounded-2xl shadow-soft border-soft p-4 h-[600px] overflow-y-auto scrollbar-hide">
                    {/* WhatsApp Button */}
                    <div className="mb-4 p-2">
                      <a
                        href={data.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-600 hover:bg-green-700 text-brand-light font-medium py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-soft hover:shadow-lg hover:scale-105 text-xs md:text-sm"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                        </svg>
                        <span>Join WhatsApp Group</span>
                      </a>
                    </div>

                    {data.announcements &&
                    Array.isArray(data.announcements) &&
                    data.announcements.length > 0 ? (
                      <div className="space-y-3">
                        {data.announcements.map(
                          (announcement: any, index: number) => (
                            <div
                              key={index}
                              className="bg-brand-light rounded-xl p-3 shadow-soft border-soft hover:shadow-lg transition-all duration-300 hover:scale-105"
                            >
                              <h3 className="text-sm md:text-base font-semibold text-accent mb-2 leading-tight">
                                {announcement.title ||
                                  announcement.Title ||
                                  `Announcement ${index + 1}`}
                              </h3>
                              <p className="text-xs md:text-sm text-brand-dark leading-relaxed text-justify">
                                {announcement.content ||
                                  announcement.Content ||
                                  announcement.description ||
                                  announcement.Description ||
                                  "No content available"}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-center mb-6">
                          <div className="w-12 md:w-16 h-12 md:h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                            <svg
                              className="w-6 md:w-8 h-6 md:h-8 text-accent"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                          <h3 className="text-sm md:text-base font-medium text-accent mb-2">
                            No Announcements
                          </h3>
                          <p className="text-xs md:text-sm text-brand-dark text-justify">
                            Check back later for updates.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Feedback */}
          <section id="feedback" className="bg-brand-light py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent mb-4 md:mb-6">
                    {data.feedbackHeading || ""}
                  </h2>
                  <p className="text-base md:text-lg text-brand-dark leading-relaxed text-justify">
                    We'd love to hear from you! Share your thoughts,
                    suggestions, or questions with us.
                  </p>
                </div>

                <div className="bg-brand-white p-6 md:p-8 rounded-2xl shadow-soft">
                  <form
                    onSubmit={handleFeedbackSubmit}
                    className="space-y-4 md:space-y-6"
                  >
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name*"
                      required
                      className="w-full border-soft rounded-xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base text-brand-dark bg-brand-light focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 shadow-soft"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email*"
                      required
                      className="w-full border-soft rounded-xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base text-brand-dark bg-brand-light focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 shadow-soft"
                    />
                    <select
                      name="category"
                      required
                      className="w-full border-soft rounded-xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base text-brand-dark bg-brand-light focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 shadow-soft"
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
                      placeholder="Your Message*"
                      rows={4}
                      required
                      className="w-full border-soft rounded-xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base text-brand-dark bg-brand-light focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 shadow-soft resize-none"
                    ></textarea>
                    <div></div>
                    <ReCAPTCHA
                sitekey={siteKey}
                onChange={onCaptchaChange}
                ref={recaptchaRef}
                theme="light"
              />
                    <button
                      type="submit"
                      disabled={
                        feedbackStatus === "submitting" ||
                        feedbackStatus === "submitted"
                      }
                      className="w-full btn-primary text-sm md:text-lg py-3 md:py-4 rounded-xl"
                    >
                      {feedbackStatus === "submitting"
                        ? "Submitting..."
                        : feedbackStatus === "submitted"
                        ? "Submitted"
                        : "Send Message"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-12 md:py-16 bg-brand-white text-brand-light relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-accent">
                {data.ctaHeading || ""}
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 md:mb-12 opacity-90 font-light max-w-3xl mx-auto text-justify text-gray-700">
                {data.ctaTagline || ""}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
                <a
                  href="/events"
                  className="bg-transparent border-2 border-[#EA580C] text-[#EA580C] px-6 md:px-10 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 hover:bg-[#EA580C] hover:text-white hover:scale-105 shadow-[0_2px_4px_rgba(0,0,0,0.06)] text-sm md:text-lg"
                >
                  View Events
                </a>
                <a
                  href="/membership"
                  className="bg-[#EA580C] text-white px-6 md:px-10 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 hover:bg-[#B45309] hover:scale-105 shadow-[0_2px_4px_rgba(0,0,0,0.06)] text-sm md:text-lg"
                >
                  Become a Member
                </a>
                <button
                  onClick={() => setShowMailingModal(true)}
                  className="bg-transparent border-2 border-[#EA580C] text-[#EA580C] px-6 md:px-10 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 hover:bg-[#EA580C] hover:text-white hover:scale-105 shadow-[0_2px_4px_rgba(0,0,0,0.06)] text-sm md:text-lg"
                >
                  Join Mailing List
                </button>
              </div>
            </div>
          </section>

          {/* Enhanced Modal */}
          {showMailingModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-brand-white rounded-2xl shadow-soft w-full max-w-3xl relative">
                <button
                  onClick={() => setShowMailingModal(false)}
                  className="absolute top-4 md:top-6 right-4 md:right-6 text-brand-dark/60 hover:text-brand-dark transition-colors text-2xl md:text-3xl font-bold w-10 md:w-12 h-10 md:h-12 flex items-center justify-center rounded-full hover:bg-brand-light/50"
                >
                  ×
                </button>
                <MailingListForm />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Custom CSS */}
      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-progress {
          width: 0%;
          animation: progress 5s linear;
        }

        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }

        .animate-fade-in {
          animation: fadeIn 1.2s ease-in-out;
        }

        .animate-fade-in-delay {
          animation: fadeIn 1.2s ease-in-out 0.4s both;
        }

        .animate-fade-in-delay-2 {
          animation: fadeIn 1.2s ease-in-out 0.8s both;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
