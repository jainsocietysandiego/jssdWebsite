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

const CalendarCarousel: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate optimal container dimensions
  useEffect(() => {
    const calculateDimensions = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calendar aspect ratio (typical calendar is wider than it is tall)
      const calendarAspectRatio = 11 / 8.5; // Standard calendar proportions
      
      if (viewportWidth >= 768) {
        // Desktop: Use much more of the viewport for larger calendar display
        const maxWidth = Math.min(viewportWidth * 0.95, 1400);
        const maxHeight = viewportHeight * 0.85;
        
        // Calculate dimensions based on aspect ratio constraints
        const widthBasedHeight = maxWidth / calendarAspectRatio;
        const heightBasedWidth = maxHeight * calendarAspectRatio;
        
        if (widthBasedHeight <= maxHeight) {
          // Width is the limiting factor
          setContainerDimensions({ width: maxWidth, height: widthBasedHeight });
        } else {
          // Height is the limiting factor
          setContainerDimensions({ width: heightBasedWidth, height: maxHeight });
        }
      } else {
        // Mobile: Optimize for mobile viewing
        const maxWidth = viewportWidth * 0.95;
        const maxHeight = viewportHeight * 0.65;
        
        const widthBasedHeight = maxWidth / calendarAspectRatio;
        const heightBasedWidth = maxHeight * calendarAspectRatio;
        
        if (widthBasedHeight <= maxHeight) {
          setContainerDimensions({ width: maxWidth, height: widthBasedHeight });
        } else {
          setContainerDimensions({ width: heightBasedWidth, height: maxHeight });
        }
      }
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

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
      <Loading />
    );
  }

  return (
    <div className="min-h-screen bg-brand-light pt-[8vh] sm:pt-[12vh]">
      {/* Hero Section */}
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
                      Panchang
                    </h1>
                    <p className="mt-2 max-w-4xl mx-auto text-white text-sm sm:text-base md:text-lg text-center">
                      Know the divine tithis, festival timings, and spiritual observances for dharmic living
                    </p>
                  </div>
                </section>
      

      {/* Calendar Carousel */}
      <section className="py-8 md:py-16 bg-brand-white">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <div className="relative bg-brand-light rounded-2xl shadow-soft p-3 md:p-8">
            
            {/* Main Image Display - Dynamic Container */}
            <div className="flex justify-center items-center">
              <div 
                ref={containerRef}
                className="relative bg-brand-white rounded-xl overflow-hidden shadow-soft"
                style={{
                  width: containerDimensions.width || 'auto',
                  height: containerDimensions.height || 'auto',
                  minWidth: '300px',
                  minHeight: '200px'
                }}
              >
                <Image
                  src={data.months[currentIndex]?.imageUrl?.trim() || ''}
                  alt={data.months[currentIndex]?.month || 'Calendar month'}
                  fill
                  className="object-contain"
                  priority
                  sizes="(min-width: 1024px) 1200px, (min-width: 768px) 85vw, 95vw"
                />
              </div>
            </div>

            {/* Month Title */}
            <h3 className="mt-4 md:mt-6 text-lg md:text-3xl font-bold text-accent text-center">
              {data.months[currentIndex]?.month}
            </h3>

            {/* Navigation and Pagination Controls */}
            <div className="flex items-center justify-center gap-3 md:gap-4 mt-1 md:mt-4">
              {/* Left Arrow */}
              <button 
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="w-10 h-10 md:w-12 md:h-12 bg-brand-white hover:bg-accent text-accent hover:text-white
                           rounded-full shadow-soft border border-accent/20 
                           flex items-center justify-center transition-all duration-300
                           hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent/50
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 
                           disabled:hover:bg-brand-white disabled:hover:text-accent"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2 md:gap-3 px-2">
                {data.months.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-accent scale-125 shadow-lg' 
                        : 'bg-white border md:border-2 border-accent hover:bg-accent/60'
                    }`}
                    aria-label={`Go to ${data.months[index].month}`}
                  />
                ))}
              </div>

              {/* Right Arrow */}
              <button 
                onClick={goToNext}
                disabled={currentIndex >= data.months.length - 1}
                className="w-10 h-10 md:w-12 md:h-12 bg-brand-white hover:bg-accent text-accent hover:text-white
                           rounded-full shadow-soft border border-accent/20
                           flex items-center justify-center transition-all duration-300
                           hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent/50
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 
                           disabled:hover:bg-brand-white disabled:hover:text-accent"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Centered Download Button */}
        <div className="flex justify-center mt-6 md:mt-8 px-4">
          <button
            onClick={() => window.open(data.panchangPdf, '_blank')}
            className="btn-primary px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-lg
                     w-full max-w-xs md:max-w-none md:w-auto"
          >
            Download Panchang
          </button>
        </div>
      </section>
    </div>
  );
};

export default CalendarCarousel;