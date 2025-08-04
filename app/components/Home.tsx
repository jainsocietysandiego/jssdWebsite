"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import { useRouter, usePathname } from "next/navigation"; 
import MailingListForm from "./mailingListSection";

const API_URL =
  "https://script.google.com/macros/s/AKfycbyaIHcv54dtaQjZXzxc3crjVuhDypC1BUq5uQ3cNA4Vio0gRH9skehKgjF6lcSgoNQO/exec";
const CACHE_KEY = "homepage-api";
const CACHE_TTL = 1 * 60 * 1000; // 1 minute

const Home: React.FC = () => {
  const [data, setData] = useState<any>(null);
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
          // corrupted cache
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
            console.log("Announcements from fallback:", fallback?.announcements);
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
    if (!data?.slides || !Array.isArray(data.slides) || data.slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % data.slides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [data?.slides]);

  const handleNextSlide = () => {
    if (!data?.slides || !Array.isArray(data.slides)) return;
    setCurrentSlide(prev => (prev + 1) % data.slides.length);
  };

  const handlePrevSlide = () => {
    if (!data?.slides || !Array.isArray(data.slides)) return;
    setCurrentSlide(prev => (prev - 1 + data.slides.length) % data.slides.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

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
        <div className="pt-[14vh]">
          {/* Header */}
          

          {/* Enhanced Hero Carousel */}
          <section className="relative h-screen overflow-hidden">
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
                    className="w-full h-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50"></div>
                </div>
              ))}
            </div>

            {/* Content Overlay */}
            <div className="relative z-20 flex items-center justify-center h-full">
              <div className="text-center text-white px-4 max-w-4xl">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                  {data.heroHeading || ""}
                </h2>
                <p className="text-xl md:text-2xl mb-8 animate-fade-in-delay">
                  {data.heroTagline || ""}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
                  <button
                    onClick={scrollToAbout}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center hover:scale-105 hover:shadow-lg"
                  >
                    Learn More <ArrowDown className="ml-2 h-5 w-5" />
                  </button>
                  <a
                    href="/membership"
                    className="bg-transparent border-2 border-white hover:bg-white hover:text-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Become a JSSD Member
                  </a>
                  <a
                    href="/contribute"
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Make a Donation
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            {data.slides && Array.isArray(data.slides) && data.slides.length > 1 && (
              <>
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-30"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-30"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Dot Indicators */}
            {data.slides && Array.isArray(data.slides) && data.slides.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
                {data.slides.map((_: any, index: number) => (
                  <button
                    key={`dot-${index}`}
                    onClick={() => handleDotClick(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${
                      index === currentSlide 
                        ? "bg-white shadow-lg scale-125" 
                        : "bg-white/60 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Progress bar for auto-advance */}
            {data.slides && Array.isArray(data.slides) && data.slides.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
                <div 
                  key={`progress-${currentSlide}`}
                  className="h-full bg-orange-500 animate-progress"
                />
              </div>
            )}
          </section>

          {/* About Section */}
          <section id="about" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {data.aboutHeading || ""}
                </h2>
                <div className="w-24 h-1 bg-orange-600 mx-auto mb-8"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {data.aboutDescription || ""}
                  </p>
                  {data.aboutQuote && (
                    <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-600">
                      <blockquote className="text-lg italic text-gray-800">
                        {data.aboutQuote}
                      </blockquote>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {data.stats && Array.isArray(data.stats) && data.stats.map((stat: any, i: number) => (
                      <div
                        key={i}
                        className="text-center p-6 bg-gray-50 rounded-lg"
                      >
                        <h3 className="text-2xl font-bold text-orange-600 mb-2">
                          {stat.number || ""}
                        </h3>
                        <p className="text-gray-600">{stat.label || ""}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Our Mission Box*/}
                <div className="relative lg:top-[-78px] md:top-[-20px] sm:top-0">
                  <div className="bg-gradient-to-r from-orange-400 to-amber-400 p-8 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-bold text-white mb-6">
                      {data.missionHeading || ""}
                    </h3>
                    <ul className="space-y-3 text-white">
                      {data.missionPoints && Array.isArray(data.missionPoints) && data.missionPoints
                        .slice(0, 10)
                        .map((point: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>{point}</span>
                          </li>
                        ))}
                    </ul>
                    {data.missionPoints && Array.isArray(data.missionPoints) && data.missionPoints.length > 10 && (
                      <p className="text-red-100 text-sm mt-4">
                        Note: Only showing first 10 mission points.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Calendar & Announcements */}
          <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* Google Calendar - Left Column (70% width) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="text-center lg:text-left">
                    <h2 className="text-2xl lg:text-3xl font-bold text-orange-700 mb-4">
                      JSSD Calendar
                    </h2>
                  </div>
                  <div className="bg-gray-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <iframe
                      src="https://calendar.google.com/calendar/embed?src=jainsocietyofsandiego%40gmail.com&ctz=Asia%2FKolkata"
                      style={{ border: 0 }}
                      width="100%"
                      height="600"
                      frameBorder="0"
                      scrolling="no"
                      className="w-full rounded-xl"
                      title="JCNC Calendar"
                    ></iframe>
                  </div>
                </div>

                {/* Announcements - Right Column (30% width) */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="text-center lg:text-left">
                    <h2 className="text-2xl lg:text-3xl font-bold text-orange-700 mb-5">
                      {data.announcementsHeading || "Latest Announcements"}
                    </h2>
                  </div>
                                                                       
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-lg border border-orange-200 p-4 h-[600px] overflow-y-auto scrollbar-hide">
                    {/* WhatsApp Button - Update this part */}
                    <div className="mb-4 p-2">
                      <a   
                        href={data.whatsappLink }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        <span>Join WhatsApp Group</span>
                      </a>
                    </div>

                    {data.announcements && Array.isArray(data.announcements) && data.announcements.length > 0 ? (
                      <div className="space-y-3">
                        {data.announcements.map((announcement: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-3 shadow-sm border border-orange-100 hover:shadow-md transition-shadow duration-200"
                          >
                            <h3 className="text-base font-semibold text-orange-700 mb-2 leading-tight">
                              {announcement.title || announcement.Title || `Announcement ${index + 1}`}
                            </h3>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {announcement.content || announcement.Content || announcement.description || announcement.Description || 'No content available'}
                            </p>
                          </div>
                        ))}
                                               
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-center mb-6">
                          <div className="text-orange-300 mb-4">
                            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                          <h3 className="text-base font-medium text-gray-600 mb-2">No Announcements</h3>
                          <p className="text-sm text-gray-500">Check back later for updates.</p>
                                                  
                        </div>
                        
                        
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Feedback */}
          <section id='feedback' className="bg-orange-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-4xl font-bold text-orange-700 mb-4">
                  {data.feedbackHeading || ""}
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
              <h2 className="text-4xl font-bold mb-6">{data.ctaHeading || ""}</h2>
              <p className="text-xl mb-8 opacity-90">{data.ctaTagline || ""}</p>
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
                <button onClick={() => setShowMailingModal(true)} className="bg-transparent border-2 border-white hover:bg-white hover:text-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">Add to Mailing List</button>
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

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .animate-progress {
          width: 0%;
          animation: progress 5s linear;
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-in-out;
        }
        
        .animate-fade-in-delay {
          animation: fadeIn 1s ease-in-out 0.3s both;
        }
        
        .animate-fade-in-delay-2 {
          animation: fadeIn 1s ease-in-out 0.6s both;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
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