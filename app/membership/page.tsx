"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Star, Mail, BookOpen  } from "lucide-react";

// ─── constants ─────────────────────────────────────────────────────
const API_URL =
  "https://script.google.com/macros/s/AKfycbw7YLZDjEJUGfdXkXzcljCsB-Hv0qZ-b_m7xUSeBKwfwGAnemt-sqVAUw9z4L5EjkX0/exec";
const LOCAL_JSON_PATH = "/membership.json";
const CACHE_KEY = "membership-api";
const CACHE_TTL = 10 * 60 * 1_000; // 10 min

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

// ─── component ─────────────────────────────────────────────────────
const Membership = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      /* 1️⃣ try cache */
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data: d, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) setData(d);
        } catch {/* ignore */}
      }

      /* 2️⃣ fallback json (if nothing yet) */
      if (!data) {
        try {
          const res = await fetch(LOCAL_JSON_PATH);
          if (res.ok) setData(await res.json());
        } catch {/* ignore */}
      }

      /* 3️⃣ background refresh */
      try {
        const fresh = await (await fetch(API_URL)).json();
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: fresh, timestamp: Date.now() })
        );
        setData(fresh);
      } catch {/* ignore */}
    };
    load();
  }, []);

  if (!data) return <Loading />;

return (
  <div className="min-h-screen bg-brand-light">
    <main className="pt-[8vh] sm:pt-[12vh]">

      {/* ── HERO WITHOUT CTA ── */}      
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
                      Become a Member
                    </h1>
                    <p className="mt-2 max-w-4xl mx-auto text-white text-sm sm:text-base md:text-lg text-center">
                      Become part of our spiritual family dedicated to preserving Jain traditions
                    </p>
                  </div>
                </section>

      {/* ── MAIN CONTENT WITH TWO COLUMN LAYOUT ── */}
      <section className="py-12 md:py-16 bg-brand-white relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-dark/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Main Content - Benefits Section */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* ── BENEFITS ── */}
              <div>
                <h2 className="text-accent font-bold text-2xl sm:text-3xl md:text-4xl mb-4">
                  {data.benefitsTitle.mainTitle}
                </h2>
                <p className="text-brand-dark mb-8 text-sm md:text-base">
                  {data.benefitsTitle.subTitle}
                </p>

                <div className="space-y-6">
                  {data.benefits.map((b: any, i: number) => (
                    <div key={i} className="bg-brand-light p-6 rounded-xl shadow-soft text-left flex gap-4 hover:shadow-lg transition-shadow">
                      <img src="/hand-icon.png" alt="" className="w-12 h-14 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-brand-dark mb-2 text-lg">{b.title}</h3>
                        <p className="text-brand-dark/80 text-sm md:text-base text-justify leading-relaxed">{b.description}</p>
                        {b.subpoints && (
                          <ul className="list-disc list-inside mt-3 text-brand-dark/80 text-sm md:text-base space-y-1">
                            {b.subpoints.map((p: string, j: number) => <li key={j}>{p}</li>)}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── MEMBERSHIP TYPES ── */}
               <div>
                <h2 className="text-accent font-bold text-2xl sm:text-3xl md:text-4xl mb-4">
                  {data.membershipTypesTitle.mainTitle}
                </h2>
                <p className="text-brand-dark mb-8 text-sm md:text-base">
                  {data.membershipTypesTitle.subTitle}
                </p>

                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                  {data.membershipTypes.map((t: any, i: number) => (
                    <div key={i} className="bg-brand-light p-6 rounded-xl shadow-soft border border-accent/10 flex flex-col hover:shadow-lg transition-shadow h-full">
                      <h3 className="text-brand-dark font-semibold text-xl mb-2">{t.title}</h3>
                      <p className="text-brand-dark/80 text-sm mb-4 flex-grow line-clamp-4">{t.coverage}</p>
                      <div className="text-3xl font-bold text-accent">${t.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── RULES ── */}
              <div className="bg-gradient-to-r from-accent/10 via-brand-light to-accent/10 rounded-2xl shadow-soft p-6 md:p-8 border-l-4 border-accent">
                <h2 className="text-accent font-bold text-2xl sm:text-3xl md:text-4xl mb-6">
                  {data.ruleTitle}
                </h2>
                <div className="space-y-4 text-justify text-brand-dark text-sm md:text-base">
                  {data.membershipRules.map((r: string, i: number) => (
                    <p key={i} className="leading-relaxed">{r}</p>
                  ))}

                  <p className="font-semibold mt-6">{data.note}</p>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>{data.noteRule.noteRule1}</li>
                    <li>{data.noteRule.noteRule2}</li>
                  </ol>

                  <p className="mt-6">
                    {data.query} <span className="text-accent font-medium">{data.contactEmail}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Sidebar - Sticky Registration Card */}
            <aside className="lg:col-span-4">
  <div className="sticky top-8 space-y-6">
    {/* Main Membership CTA */}
    <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl shadow-xl p-6 text-center relative overflow-hidden">
      
      <div className="relative z-10">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">
          Join Our Community
        </h3>
        <p className="text-white/90 mb-6 text-sm leading-relaxed">
          Unlock exclusive benefits, connect with like-minded members, and be part of something bigger.
        </p>
        <Link href="/membership/become-a-member">
          <button className="w-full bg-white hover:bg-gray-50 text-orange-600 hover:text-orange-700 py-3 px-6 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:scale-105 shadow-lg">
            Become a Member
          </button>
        </Link>
      </div>
    </div>

{/* Pathshala Quick Access */}
<div className="bg-brand-light rounded-xl shadow-soft p-6 border-soft">
  <div className="flex items-center gap-3 mb-4">
    <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
      <BookOpen className="h-6 w-6 text-accent" />
    </div>
    <div>
      <h4 className="font-bold text-brand-dark">Pathshala Program</h4>
      <p className="text-accent text-xs">Educational Excellence</p>
    </div>
  </div>
  <p className="text-brand-dark/70 text-sm mb-4 leading-relaxed">
    Explore our structured learning programs designed to nurture knowledge and skills.
  </p>
  <a
    href="/pathsala/register"
    className="block w-full bg-accent hover:bg-[#B45309] text-brand-light py-2.5 px-4 rounded-lg font-medium text-center text-sm transition-all duration-300 hover:scale-105 shadow-soft"
  >
    Register for Pathshala
  </a>
</div>

{/* Contact & Support */}
<div className="bg-brand-white rounded-xl shadow-soft p-6 border-soft">
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
      <Mail className="h-5 w-5 text-accent" />
    </div>
    <h4 className="font-bold text-brand-dark">Need Assistance?</h4>
  </div>
  <p className="text-brand-dark/70 text-sm mb-4 leading-relaxed">
    Questions about membership or programs? Our team is here to help you every step of the way.
  </p>
  <div className="space-y-2">
    <a 
      href={`mailto:${data.contactEmail}`}
      className="block w-full bg-accent hover:bg-[#B45309] text-brand-light py-2.5 px-4 rounded-lg font-medium text-center text-sm transition-all duration-300"
    >
      Send Email
    </a>
  </div>
</div>


  </div>
</aside>

          </div>
        </div>
      </section>
    </main>
  </div>
);
}

export default Membership;
