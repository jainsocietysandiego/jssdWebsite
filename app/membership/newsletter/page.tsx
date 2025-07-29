'use client';
import React, { useState, useEffect } from "react";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

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

const NewsletterSkeleton = () => (
  <div className="py-32 min-h-[60vh] flex flex-col items-center gap-10 animate-pulse">
    <div className="bg-orange-100 h-14 w-80 rounded-lg" />
    <div className="bg-orange-200 h-10 w-3/4 max-w-lg rounded-lg" />
    <div className="bg-orange-50 h-[420px] w-full max-w-3xl rounded-2xl" />
    <div className="bg-orange-100 h-10 w-48 rounded" />
    <div className="bg-orange-50 h-28 w-full max-w-xl rounded-xl" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-amber-100">
      <main className="max-w-5xl mx-auto pt-28 px-2 pb-24">
        <header className="mb-12">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-2xl shadow px-8 py-8 text-center border-b-4 border-amber-300">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow">
              Newsletter
            </h1>
            <p className="mt-3 text-2xl font-medium opacity-95">
              Read the latest and previous editions
            </p>
          </div>
        </header>

        {loading ? <NewsletterSkeleton /> : (
          <>
            <section className="mb-20">
              <div className="text-2xl font-bold text-amber-700 mb-5 tracking-wide">
                Present Newsletter
              </div>
              {!current ? (
                <div className="rounded-2xl bg-orange-100 py-14 text-center text-gray-500 text-2xl font-semibold shadow-lg">
                  No newsletter available for this month.
                </div>
              ) : (
                <div className="p-8 bg-white/90 rounded-3xl shadow-2xl">
                  <div className="font-extrabold text-3xl md:text-4xl text-orange-900 text-center mb-2 tracking-tight drop-shadow">
                    {current['PDF File Name']}
                  </div>
                  <div className="text-xl mb-3 text-center text-orange-700 font-semibold">
                    {current.Month}
                  </div>
                  <div className="flex flex-col items-center mt-2 mb-4">
                    <iframe
                      src={toPreviewUrl(current['Newsletter URL (PDF)'])}
                      title={current['PDF File Name']}
                      className="rounded-lg border shadow-lg"
                      width="100%"
                      height="700"
                      style={{ minHeight: 700, maxWidth: 1100 }}
                      allow="autoplay"
                    />
                  </div>
                  <div className="text-center mt-3">
                    <a
                      className="text-orange-700 font-bold underline text-lg"
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
              <div className="text-2xl font-bold text-amber-700 mb-5 tracking-wide">
                Previous Newsletters
              </div>
              <ul className="space-y-7">
                {previous.length === 0 &&
                  <li className="text-gray-400 text-xl font-medium px-3">No previous newsletters yet.</li>}
                {previous.map(n => (
                  <li
                    key={n.Month + n.Date}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white/85 rounded-xl shadow-md px-6 py-4 border-l-4 border-orange-300 hover:scale-[1.013] transition"
                  >
                    <a
                      href={toPreviewUrl(n['Newsletter URL (PDF)'])}
                      className="text-orange-700 underline text-xl md:text-2xl font-bold truncate"
                      target="_blank"
                      rel="noopener noreferrer"
                      title={n['PDF File Name']}
                    >
                      {n['PDF File Name']}
                    </a>
                    <span className="ml-2 text-gray-500 text-lg font-medium">
                      ({n.Month})
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default NewsletterPage;
