'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";

// -------------------- TYPES --------------------
type Newsletter = {
  Date: string;
  Month: string;
  'PDF File Name': string;
  'Newsletter URL (PDF)': string;
  [key: string]: any;
};

const NEWSLETTERS_API = "https://script.google.com/macros/s/AKfycbw1eyzoi3VZiTYtYPvw-kRuCzkZn2EHzveDCqo2Fi4VZmtUvFjifWPdvUdQA5UbMhL-/exec";
const CACHE_KEY = "newsletter-api-v1";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function toPreviewUrl(url: string): string {
  let match = url.match(/\/d\/([a-zA-Z0-9\-_]+)/);
  if (!match) {
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9\-_]+)/);
    const fileId = idMatch ? idMatch[1] : null;
    return fileId
      ? `https://drive.google.com/file/d/${fileId}/preview`
      : url;
  }
  return `https://drive.google.com/file/d/${match[1]}/preview`;
}

function getCurrentAndPrevious(newsletters: Newsletter[]): [Newsletter | null, Newsletter[]] {
  if (!newsletters?.length) return [null, []];

  const sorted = [...newsletters]
    .map(n => ({ ...n, dateObj: new Date(n.Date) }))
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();

  let current: (typeof sorted)[0] | null = null;
  for (const n of sorted) {
    const d = n.dateObj as Date;
    if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) {
      current = n;
      break;
    }
  }
  if (!current) {
    current = sorted.find(n => n.dateObj.getTime() <= now.getTime()) || sorted[0];
  }

  const prev = sorted
    .filter(n => n.dateObj.getTime() < now.getTime() && (current ? n.Date !== current.Date : true))
    .map(({ dateObj, ...rest }) => rest);

  const cur = current
    ? Object.fromEntries(Object.entries(current).filter(([k]) => k !== "dateObj")) as Newsletter
    : null;

  return [cur, prev];
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

const NewsletterPage: React.FC = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [current, setCurrent] = useState<Newsletter | null>(null);
  const [previous, setPrevious] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let didCancel = false;

    const applyAndSplit = (data: Newsletter[]) => {
      setNewsletters(data);
      const [curr, prev] = getCurrentAndPrevious(data);
      setCurrent(curr);
      setPrevious(prev);
      setLoading(false);
    };

    const checkLocalCache = () => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            applyAndSplit(data);
            return true;
          }
        } catch {
          return false;
        }
      }
      return false;
    };

    const fetchLatest = async () => {
      try {
        const res = await fetch(NEWSLETTERS_API);
        const rows = await res.json();
        if (!didCancel && rows?.length) {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: rows,
            timestamp: Date.now()
          }));
          applyAndSplit(rows);
        }
      } catch (e) {
        console.error("Failed to fetch from API", e);
        setLoading(false);
      }
    };

    if (!checkLocalCache()) {
      fetchLatest();
    } else {
      fetchLatest(); // background refresh
    }

    return () => { didCancel = true; };
  }, []);

  if (loading && newsletters.length === 0) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-brand-light pt-[14vh]">
      <section className="relative flex items-center justify-center
                          h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden">
        <Image
          src="/images/hero-banner.jpg"
          alt="Newsletter hero"
          fill
          priority
          quality={85}
          className="object-cover"
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-bold text-brand-light text-3xl sm:text-4xl md:text-5xl
                         ">
            Newsletter
          </h1>
          <p className="mt-2 text-white text-sm sm:text-base md:text-lg">
            Read the latest and previous editions
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto pt-20 px-2 pb-24">      
          <>
            <section className="mb-20">
              <div className="text-xl md:text-2xl font-bold text-accent mb-5">
                Present Newsletter
              </div>
              {!current ? (
                <div className="rounded-2xl bg-brand-light py-14 text-center text-brand-dark/60 text-lg md:text-2xl font-semibold shadow-soft">
                  No newsletter available for this month.
                </div>
              ) : (
                <div className="p-6 md:p-8 bg-brand-white rounded-3xl shadow-soft">
                  <div className="font-extrabold text-2xl md:text-3xl lg:text-4xl text-brand-dark text-center mb-2">
                    {current['PDF File Name']}
                  </div>
                  <div className="text-lg md:text-xl mb-3 text-center text-accent font-semibold">
                    {current.Month}
                  </div>
                  <div className="flex flex-col items-center mt-2 mb-4">
                    <iframe
                      src={toPreviewUrl(current['Newsletter URL (PDF)'])}
                      title={current['PDF File Name']}
                      className="rounded-xl border-soft shadow-soft"
                      width="100%"
                      height="700"
                      style={{ minHeight: 700, maxWidth: 1100 }}
                      allow="autoplay"
                    />
                  </div>
                  <div className="text-center mt-3">
                    <a
                      className="text-accent font-bold underline text-sm md:text-lg"
                      href={toPreviewUrl(current['Newsletter URL (PDF)'])}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Download the Newsletter PDF
                    </a>
                  </div>
                </div>
              )}
            </section>

            <section>
              <div className="text-xl md:text-2xl font-bold text-accent mb-5">
                Previous Newsletters
              </div>
              <ul className="space-y-6">
                {previous.length === 0 &&
                  <li className="text-brand-dark/60 text-base md:text-xl px-3">No previous newsletters yet.</li>}
                {previous.map(n => (
                  <li
                    key={n.Month + n.Date}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 bg-brand-white rounded-xl shadow-soft px-6 py-4 border-l-4 border-accent hover:scale-[1.013] transition"
                  >
                    <a
                      href={toPreviewUrl(n['Newsletter URL (PDF)'])}
                      className="text-accent underline text-lg md:text-xl lg:text-2xl font-bold truncate"
                      target="_blank"
                      rel="noopener noreferrer"
                      title={n['PDF File Name']}
                    >
                      {n['PDF File Name']}
                    </a>
                    <span className="ml-2 text-brand-dark/70 text-sm md:text-lg font-medium">
                      ({n.Month})
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </>        
      </main>
    </div>
  );
};

export default NewsletterPage;
