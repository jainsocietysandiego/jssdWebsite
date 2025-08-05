"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── constants ─────────────────────────────────────────────────────
const API_URL =
  "https://script.google.com/macros/s/AKfycbw7YLZDjEJUGfdXkXzcljCsB-Hv0qZ-b_m7xUSeBKwfwGAnemt-sqVAUw9z4L5EjkX0/exec";
const LOCAL_JSON_PATH = "/membership.json";
const CACHE_KEY = "membership-api";
const CACHE_TTL = 10 * 60 * 1_000; // 10 min

// ─── skeleton ──────────────────────────────────────────────────────
const MembershipSkeleton = () => (
  <div className="min-h-screen bg-brand-light animate-pulse">
    <div className="pt-[14vh] space-y-8">
      <div className="h-48 bg-brand-dark/20" />
      <div className="h-6 w-1/2 bg-brand-dark/10 rounded mx-auto" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-brand-dark/5 rounded-xl" />
        ))}
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

  if (!data) return <MembershipSkeleton />;

 return (
    <div className="min-h-screen bg-brand-light">
      <main className="pt-[14vh]">

        {/* ── HERO WITH CTA ON TOP``` */}
        <section className="relative flex items-center justify-center
                            h-56 sm:h-64 md:h-72 lg:h-80 overflow-hidden">
          <Image
            src="/images/hero-banner.png"
            alt="Membership hero"
            fill
            priority
            quality={85}
            className="object-cover"
          />
          
          <div className="relative z-10 text-center px-4">
            <h1 className="font-bold text-brand-light
                           text-3xl sm:text-4xl md:text-5xl mb-4
                           
                           [text-shadow:_0_0_10px_rgb(255_255_255_/_50%),_0_0_20px_rgb(255_255_255_/_30%),_0_0_40px_rgb(255_255_255_/_20%)]">
            Become a Member
            </h1>
            <p className="mt-2 max-w-3xl mx-auto text-brand-light/90 mb-8
                          text-sm sm:text-base md:text-lg text-justify">
              {data.heroSection.subHeading}
            </p>
            <Link href="/membership/become-a-member">
              <button className="bg-brand-light hover:bg-brand-white text-brand-dark hover:text-accent md:px-12 py-4 rounded-xl font-bold text-lg md:text-xl transition-all duration-300 hover:scale-105 shadow-lg">
                {data.heroSection.buttonText}
              </button>
            </Link>
          </div>
        </section>

        {/* ── BENEFITS ── */}
        <section className="py-16 bg-brand-white">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-accent font-bold text-2xl sm:text-3xl md:text-4xl mb-4">
              {data.benefitsTitle.mainTitle}
            </h2>
            <p className="text-brand-dark mb-10 text-sm md:text-base">
              {data.benefitsTitle.subTitle}
            </p>

            <div className="space-y-6">
              {data.benefits.map((b: any, i: number) => (
                <div key={i} className="bg-brand-light p-6 rounded-xl shadow-soft text-left flex gap-4">
                  <img src="/hand-icon.png" alt="" className="w-12 h-14 " />
                  <div>
                    <h3 className="font-semibold text-brand-dark mb-1">{b.title}</h3>
                    <p className="text-brand-dark/80 text-sm md:text-base text-justify">{b.description}</p>
                    {b.subpoints && (
                      <ul className="list-disc list-inside mt-2 text-brand-dark/80 text-sm md:text-base space-y-1">
                        {b.subpoints.map((p: string, j: number) => <li key={j}>{p}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MEMBERSHIP TYPES ── */}
        <section className="py-16 bg-brand-light">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-accent font-bold text-2xl sm:text-3xl md:text-4xl mb-4">
              {data.membershipTypesTitle.mainTitle}
            </h2>
            <p className="text-brand-dark mb-10 text-sm md:text-base">
              {data.membershipTypesTitle.subTitle}
            </p>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {data.membershipTypes.map((t: any, i: number) => (
                <div key={i} className="bg-brand-white p-8 rounded-xl shadow-soft border-soft flex flex-col">
                  <h3 className="text-brand-dark font-semibold text-xl mb-1">{t.title}</h3>
                  <p className="text-brand-dark/80 text-sm mb-4">{t.coverage}</p>
                  <div className="text-3xl font-bold text-accent mb-6">${t.price}</div>
                  <Link href="/membership/become-a-member" className="mt-auto">
                    <button className="w-full bg-transparent border-2 border-accent hover:bg-accent hover:text-brand-light text-accent px-4 py-2 rounded-xl transition-colors font-semibold text-sm">
                      Join Now
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RULES ── */}
        <section className="py-16 bg-brand-white">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-accent font-bold text-2xl sm:text-3xl md:text-4xl mb-8">
              {data.ruleTitle}
            </h2>
            <div className="space-y-4 text-justify text-brand-dark text-sm md:text-base">
              {data.membershipRules.map((r: string, i: number) => <p key={i}>{r}</p>)}

              <p className="font-semibold mt-6">{data.note}</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>{data.noteRule.noteRule1}</li>
                <li>{data.noteRule.noteRule2}</li>
              </ol>

              <p className="mt-6">
                {data.query} <span className="text-accent">{data.contactEmail}</span>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Membership;
