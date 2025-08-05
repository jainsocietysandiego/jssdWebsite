'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = 'https://script.google.com/macros/s/AKfycbzOgd6mTokqLfy8wp70t6IjTnxEa4kQDi9Oh0ereFAiK_5CxohBUNCZKSo444DX4zYZ/exec'; // From Apps Script deploy

interface MonthData {
  month: string;
  imageUrl: string;
}

interface ApiResponse {
  currentMonth: string;
  months: MonthData[];
  panchangPdf: string;
}

const CalendarCarousel: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!data?.months.length) return;

    // Set initial slide to current month
    const startIndex = data.months.findIndex(
      m => m.month.toLowerCase() === data.currentMonth.toLowerCase()
    );
    if (startIndex >= 0) setCurrentIndex(startIndex);
  }, [data]);

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? 0 : prev - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev >= data!.months.length - 1 ? prev : prev + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center pt-[14vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
            <div className="absolute inset-2 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-brand-dark text-lg">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light pt-[14vh]">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center
                            h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden">
        <Image
          src="/images/hero-banner.jpg"
          alt="Calendar hero"
          fill
          priority
          quality={85}
          className="object-cover"
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-bold text-brand-light text-3xl sm:text-4xl md:text-5xl
                         drop-shadow-[0_0_10px_rgb(255_255_255_/_50%)]
                         [text-shadow:_0_0_10px_rgb(255_255_255_/_50%),_0_0_20px_rgb(255_255_255_/_30%)]">
            Panchang
          </h1>          
        </div>
      </section>

      {/* Calendar Carousel */}
      <section className="py-16 bg-brand-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative bg-brand-light rounded-2xl shadow-soft p-6 md:p-8">
            
            {/* Main Image Display */}
            <div className="relative w-full h-[70vh] bg-brand-white rounded-xl overflow-hidden shadow-soft">
              <Image
                src={data.months[currentIndex]?.imageUrl?.trim() || ''}
                alt={data.months[currentIndex]?.month || 'Calendar month'}
                fill
                className="object-contain p-4"
                priority
              />
            </div>

            {/* Month Title */}
            <h3 className="mt-6 text-xl md:text-3xl font-bold text-accent text-center">
              {data.months[currentIndex]?.month}
            </h3>

            {/* Navigation and Pagination Controls */}
            <div className="flex items-center justify-center gap-4 mt-2 sm:mt-8">
              {/* Left Arrow */}
              <button 
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-white hover:bg-accent text-accent hover:text-white
                           rounded-full shadow-soft border border-accent/20 
                           flex items-center justify-center transition-all duration-300
                           hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent/50
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-brand-white disabled:hover:text-accent"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2 sm:gap-3">
                {data.months.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-accent scale-125 shadow-lg' 
                        : 'bg-white border sm:border-2 border-accent hover:bg-accent/60'
                    }`}
                    aria-label={`Go to ${data.months[index].month}`}
                  />
                ))}
              </div>

              {/* Right Arrow */}
              <button 
                onClick={goToNext}
                disabled={currentIndex >= data.months.length - 1}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-white hover:bg-accent text-accent hover:text-white
                           rounded-full shadow-soft border border-accent/20
                           flex items-center justify-center transition-all duration-300
                           hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent/50
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-brand-white disabled:hover:text-accent"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Centered Download Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => window.open(data.panchangPdf, '_blank')}
            className="btn-primary px-8 py-4 rounded-xl font-semibold text-sm md:text-lg"
          >
            Download Panchang
          </button>
        </div>
      </section>
    </div>
  );
};

export default CalendarCarousel;
