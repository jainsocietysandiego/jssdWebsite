"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

// Constants
const API_URL =
  "https://script.google.com/macros/s/AKfycbzPvcWT8omIA992X5wAktnx5HFukyFoau_E-WL3WeIIVtoyoIo28OBTdaSWB_QSMQlX/exec";
const LOCAL_JSON_PATH = "/membership.json";
const CACHE_KEY = "membership-api";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Skeleton Component
const MembershipSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 animate-pulse">
    <Navbar />
    <div className="pt-16">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-center py-6">
        <div className="h-10 w-1/2 mx-auto rounded bg-orange-300" />
      </div>
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gray-200" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center px-4 max-w-4xl w-full">
            <div className="h-12 md:h-20 w-3/4 mx-auto mb-6 rounded bg-orange-200" />
            <div className="h-6 w-1/2 mx-auto mb-8 rounded bg-orange-100" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="h-10 w-36 rounded bg-orange-200" />
              <div className="h-10 w-44 rounded bg-orange-200" />
              <div className="h-10 w-52 rounded bg-orange-200" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 text-center bg-gray-50">
        <div className="h-10 w-1/2 mx-auto rounded bg-orange-100 mb-4" />
        <div className="h-6 w-1/4 mx-auto mb-6 rounded bg-orange-200" />
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow w-full max-w-xs mx-auto">
              <div className="h-12 w-12 rounded-full bg-orange-200 mx-auto mb-4" />
              <div className="h-6 w-3/4 mx-auto mb-2 rounded bg-orange-300" />
              <div className="h-4 w-2/3 mx-auto rounded bg-orange-300" />
            </div>
          ))}
        </div>
      </section>
    </div>
    <Footer />
  </div>
);

// Main Component
const Membership = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      let shouldFetch = true;

      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setData(cachedData);
            shouldFetch = false;
          }
        } catch {
          // Invalid JSON, skip cache
        }
      }

      if (!data && shouldFetch) {
        // Load from local JSON as fallback
        try {
          const res = await fetch(LOCAL_JSON_PATH);
          if (res.ok) {
            const fallbackData = await res.json();
            setData(fallbackData);
          }
        } catch {
          console.error("Failed to load fallback JSON.");
        }
      }

      // Always fetch in background to update cache
      try {
        const res = await fetch(API_URL);
        const freshData = await res.json();
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: freshData, timestamp: Date.now() })
        );
        if (JSON.stringify(freshData) !== JSON.stringify(data)) {
          setData(freshData);
        }
      } catch {
        console.warn("Background fetch failed");
      }
    };

    loadData();
  }, []);

  if (!data) return <MembershipSkeleton />;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32">
        {/* Hero Section */}
        <section className="w-full mb-4">
          <img
            src="/Membership-banner.jpg"
            alt="Membership Hero"
            className="w-full h-[550px]"
          />
          <div className="mt-10 flex ml-40">
            <Link href="/membership/become-a-member">
              <button className="text-lg font-semibold border-2 border-red-600 bg-red-700 text-white px-6 py-2 rounded hover:bg-white hover:text-red-600 hover:border-red-600 transition">
                {data.heroSection.buttonText}
              </button>
            </Link>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-4 text-center bg-gray-50">
          <h2 className="text-4xl font-bold mb-4">{data.benefitsTitle.mainTitle}</h2>
          <p className="text-gray-600 mb-10">{data.benefitsTitle.subTitle}</p>
          <div className="max-w-4xl mx-auto space-y-4">
            {data.benefits.map((benefit: any, index: number) => (
              <div
                key={index}
                className="flex items-start bg-white rounded-lg p-4 shadow text-left"
              >
                <div className="flex-shrink-0 mr-4">
                  <img src="/hand-icon.png" alt="Benefit Icon" className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-gray-700">{benefit.description}</p>
                  {benefit.subpoints && (
                    <ul className="list-disc list-inside text-gray-700 mt-2">
                      {benefit.subpoints.map((point: string, i: number) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Membership Types */}
        <section className="py-8 px-4 text-center bg-white">
          <h2 className="text-4xl font-bold mb-4">{data.membershipTypesTitle.mainTitle}</h2>
          <p className="text-gray-600 mb-10">{data.membershipTypesTitle.subTitle}</p>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center">
            {data.membershipTypes.map((type: any, index: number) => (
              <div
                key={index}
                className="bg-white border rounded-lg p-8 shadow w-full max-w-xs mx-auto"
              >
                <h3 className="text-2xl font-semibold mb-2">{type.title}</h3>
                <p className="text-gray-700 mb-4">{type.coverage}</p>
                <div className="text-3xl font-bold text-red-600 mb-6">${type.price}</div>
                <Link href="/membership/become-a-member">
                  <button className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-white hover:text-red-600 hover:border hover:border-red-600 transition">
                    Join Now
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Rules Section */}
        <section className="py-16 px-4 bg-gray-50 flex flex-col items-center">
          <h2 className="text-4xl font-bold mb-4">{data.ruleTitle}</h2>
          <div className="max-w-2xl mx-auto space-y-6 text-left">
            {data.membershipRules.map((rule: string, index: number) => (
              <p key={index} className="text-gray-700">{rule}</p>
            ))}
            <p className="text-lg font-semibold mt-6">{data.note}</p>
            <ul className="list-decimal list-inside text-gray-700 mt-2">
              <li>{data.noteRule.noteRule1}</li>
              <li>{data.noteRule.noteRule2}</li>
            </ul>
            <p className="text-gray-700 mt-6">
              {data.query} <span className="text-red-600">{data.contactEmail}</span>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Membership;
