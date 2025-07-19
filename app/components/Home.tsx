'use client'

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const Home: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch('https://script.google.com/macros/s/AKfycbyXi_djK0REvy1lTRk6Lot8_fSL0Pfy4BuJuWW7bRPXWk6wAS0oUsSIGieeL0Ua6IFXUQ/exec')
      .then(res => res.json())
      .then(setData);
  }, []);

  useEffect(() => {
    if (!data) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [data]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % data.slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + data.slides.length) % data.slides.length);
  const scrollToAbout = () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });

  if (!data) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      <div className="pt-16 text-center">Loading...</div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      <main>
        <div className="pt-16">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white text-center py-6">
            <h1 className="text-3xl md:text-4xl font-bold">{data.headerTitle}</h1>
          </div>

          {/* Hero Section */}
          <section className="relative h-screen overflow-hidden">
            <div className="absolute inset-0">
              {data.slides.map((slide: any, index: number) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                  <img src={slide.url} alt={slide.alt} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40"></div>
                </div>
              ))}
            </div>

            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="text-center text-white px-4 max-w-4xl">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">{data.heroHeading}</h2>
                <p className="text-xl md:text-2xl mb-8 opacity-90">{data.heroTagline}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={scrollToAbout}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    Learn More <ArrowDown className="ml-2 h-5 w-5" />
                  </button>
                  <a href="/membership" className="bg-transparent border-2 border-white hover:bg-white hover:text-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                    Become a JSSD Member
                  </a>
                  <a href="/contribute" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                    Make a Donation
                  </a>
                </div>
              </div>
            </div>

            <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors">
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {data.slides.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.aboutHeading}</h2>
                <div className="w-24 h-1 bg-orange-600 mx-auto mb-8"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-lg text-gray-700 leading-relaxed">{data.aboutDescription}</p>

                  <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-600">
                    <blockquote className="text-lg italic text-gray-800">{data.aboutQuote}</blockquote>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {data.stats.map((stat: any, index: number) => (
                      <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-2xl font-bold text-orange-600 mb-2">{stat.number}</h3>
                        <p className="text-gray-600">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="bg-gradient-to-r from-orange-400 to-amber-400 p-8 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-bold text-white mb-6">{data.missionHeading}</h3>
                    <ul className="space-y-3 text-white">
                      {data.missionPoints.map((point: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold mb-6">{data.ctaHeading}</h2>
              <p className="text-xl mb-8 opacity-90">{data.ctaTagline}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/membership" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors">
                  Become a Member
                </a>
                <a href="/events" className="bg-transparent border-2 border-white hover:bg-white hover:text-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                  View Events
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;