"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const API_URL =
  "https://script.google.com/macros/s/AKfycbyF2o2z99qlJJB8L7CqOewouIdDbNlt-xJJa6G1Jm5_cNYA5qlGVQReJZkik9zs8LbiGQ/exec";
const CACHE_KEY = "membership-api";
const CACHE_TTL = 10 * 60 * 1000; // 10min in ms

// -------------- Skeleton Loader Component --------------
const MembershipSkeleton = () => (
  <div className="min-h-screen">
    <Navbar />
    <main className="pt-32 animate-pulse">
      {/* Skeleton Hero Section */}
      <section className="w-full mb-4">
        <div className="w-full h-[550px] bg-gray-200" />
        <div className="mt-10 flex ml-40">
          <div className="h-12 w-56 rounded bg-red-200" />
        </div>
      </section>
      {/* Skeleton Benefits */}
      <section className="py-16 px-4 text-center bg-gray-50">
        <div className="h-10 w-72 bg-gray-200 rounded mx-auto mb-4" />
        <div className="h-6 w-1/2 bg-gray-100 rounded mx-auto mb-10" />
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="flex items-start bg-white rounded-lg p-4 shadow text-left">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 rounded bg-gray-200" />
              </div>
              <div className="flex-1">
                <div className="h-6 w-52 rounded bg-gray-200 mb-2" />
                <div className="h-4 w-full rounded bg-gray-100 mb-2" />
                <div className="h-4 w-3/4 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Skeleton Pricing Cards */}
      <section className="py-8 px-4 text-center bg-white">
        <div className="h-10 w-72 bg-gray-200 rounded mx-auto mb-4" />
        <div className="h-6 w-1/2 bg-gray-100 rounded mx-auto mb-10" />
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-white border rounded-lg p-8 shadow w-full max-w-xs mx-auto">
              <div className="h-8 w-32 rounded bg-gray-100 mb-3 mx-auto" />
              <div className="h-4 w-full rounded bg-gray-50 mb-4 mx-auto" />
              <div className="h-10 w-32 mx-auto bg-red-200 rounded mb-6" />
              <div className="h-12 w-full bg-red-100 rounded" />
            </div>
          ))}
        </div>
      </section>
      {/* Skeleton Rules Section */}
      <section className="py-16 px-4 bg-gray-50 flex flex-col items-center">
        <div className="h-10 w-72 bg-gray-200 rounded mx-auto mb-4" />
        <div className="max-w-2xl mx-auto space-y-6 text-left w-full">
          {[...Array(3)].map((_, i) => (
            <div className="h-4 w-full bg-gray-100 rounded" key={i} />
          ))}
          <div className="h-6 w-1/2 bg-gray-200 rounded mt-6" />
          <div className="h-4 w-1/2 bg-gray-100 rounded mt-2" />
          <div className="h-4 w-full bg-gray-100 rounded mt-2" />
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

// -------------- Membership Main Component --------------
const Membership = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Try cache first
    const cached = localStorage.getItem(CACHE_KEY);
    let shouldFetch = true;
    if (cached) {
      try {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setData(cachedData);
          shouldFetch = false;
        }
      } catch {}
    }
    // Always fetch to refresh cache in the background
    fetch(API_URL)
      .then((res) => res.json())
      .then((apiData) => {
        setData(apiData);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: apiData,
            timestamp: Date.now(),
          })
        );
      });
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

        {/* Membership Benefits Section */}
        <section className="py-16 px-4 text-center bg-gray-50">
          <h2 className="text-4xl font-bold mb-4">{data.benefitsTitle.mainTitle}</h2>
          <p className="text-gray-600 mb-10">{data.benefitsTitle.subTitle}</p>
          <div className="max-w-4xl mx-auto space-y-4">
            {data.benefits.map((benefit: any, index: number) => (
              <div
                key={index}
                className="flex items-start bg-white rounded-lg p-4 shadow hover:shadow-lg transition text-left"
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

        {/* Membership Types Pricing Cards */}
        <section className="py-8 px-4 text-center bg-white">
          <h2 className="text-4xl font-bold mb-4">{data.membershipTypesTitle.mainTitle}</h2>
          <p className="text-gray-600 mb-10">{data.membershipTypesTitle.subTitle}</p>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center">
            {data.membershipTypes.map((type: any, index: number) => (
              <div
                key={index}
                className="bg-white border rounded-lg p-8 shadow hover:shadow-lg transition w-full max-w-xs mx-auto"
              >
                <h3 className="text-2xl font-semibold mb-2">{type.title}</h3>
                <p className="text-gray-700 mb-4">{type.coverage}</p>
                <div className="text-3xl font-bold text-red-600 mb-6">{type.price}</div>
                <Link href="/become-a-member">
                  <button className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-white hover:text-red-600 hover:border hover:border-red-600 transition">
                    Join Now
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Who's Part of Membership Section */}
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
