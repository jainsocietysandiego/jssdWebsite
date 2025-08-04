'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, Clock, Users, User, Star } from 'lucide-react';
import Image from 'next/image';

interface LevelData {
  Level: string;
  Title: string;
  Description: string;
  'Age Group': string;
  Duration: string;
  Students: number;
  Fees: string;
  'Topics Covered': string;
  'Key Activities ': string;
  'Teachers Note': string;
  'Learning Outcome': string;
}

const API_URL = 'https://script.google.com/macros/s/AKfycbyHVNzO5Wbr-OBUAD_KPKPazFsZWz4ak7LONoccChBmZnAmnINE6cUbcnmH_647G5urKw/exec';
const FALLBACK_JSON = '/pathsala.json';
const CACHE_TTL = 10 * 60 * 1000;

const PathsalaLevel: React.FC = () => {
  const params = useParams();
  const level = Array.isArray(params.level)
    ? params.level[0].replace('level-', '').trim()
    : params.level?.replace('level-', '').trim();

  const [data, setData] = useState<LevelData | null>(null);
  const [loading, setLoading] = useState(true);

  const cacheKey = `pathsala-level-${level}`;

  useEffect(() => {
    const loadData = async () => {
      const cached = sessionStorage.getItem(cacheKey);
      let shouldFetch = true;

      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setData(cachedData);
            setLoading(false);
            shouldFetch = false;
          }
        } catch {
          // skip cache if invalid
        }
      }

      if (!data && shouldFetch) {
        try {
          const res = await fetch(FALLBACK_JSON);
          const json = await res.json();
          const found = json.levels.find((lvl: LevelData) => String(lvl.Level).trim() === level);
          if (found) {
            setData(found);
          }
        } catch {
          console.warn('Failed to load fallback JSON.');
        }
        setLoading(false);
      }

      // background update
      try {
        const res = await fetch(API_URL);
        const json = await res.json();
        const match = json.levels.find((lvl: LevelData) => String(lvl.Level).trim() === level);
        if (match) {
          sessionStorage.setItem(cacheKey, JSON.stringify({ data: match, timestamp: Date.now() }));
          if (JSON.stringify(match) !== JSON.stringify(data)) setData(match);
        }
      } catch {
        console.warn('Failed to fetch from API');
      }
    };

    loadData();
  }, [level]);

  if (loading) return <div className="min-h-screen">Loading...</div>;
  if (!data) return <div className="min-h-screen text-center pt-20 text-red-600">Level not found.</div>;

return (
    <div className="min-h-screen bg-brand-light pt-[14vh]">
      {/* ───── HERO ───── */}
      <section className="relative flex items-center justify-center
                          h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden">
        <Image
          src="/images/hero-banner.jpg"
          alt="Pathshala Hero"
          fill
          priority
          quality={85}
          className="object-cover"
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-bold text-brand-light text-3xl sm:text-4xl md:text-5xl">
            Pathshala Level {data.Level}
          </h1>
          <h2 className="mt-2 text-white text-sm sm:text-base md:text-lg max-w-4xl mx-auto">
            {data.Title} — {data.Description}
          </h2>
        </div>
      </section>

      {/* ───── DETAIL SECTION ───── */}
      <main className="py-16 md:py-20 bg-brand-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-8">
          {/* left two-thirds */}
          <div className="lg:col-span-2 space-y-8">
            <OverviewCard data={data} />
            <InfoCard title="Topics Covered" items={data['Topics Covered']} />
            <InfoCard title="Key Activities" items={data['Key Activities ']} />
            <TextCard title="Teacher's Note" text={data['Teachers Note']} />
            <InfoCard title="Learning Outcomes" items={data['Learning Outcome']} />
          </div>

          {/* right rail */}
          <aside className="bg-brand-light rounded-xl p-6 shadow-soft h-fit">
            <h3 className="text-lg md:text-xl font-bold text-brand-dark mb-4">
              Interested in Joining?
            </h3>
            <p className="text-brand-dark/80 mb-6 text-sm md:text-base text-justify">
              Register for this level or contact us for more information about our Pathshala program.
            </p>
            <div className="space-y-3">
              <a
                href="/pathsala/register"
                className="block bg-accent hover:bg-accent-hov text-brand-light py-2 px-4 rounded-xl font-medium text-center text-sm md:text-base"
              >
                Register Now
              </a>
              <a
                href="/#feedback"
                className="block bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-brand-light py-2 px-4 rounded-xl font-medium text-center text-sm md:text-base"
              >
                Ask Questions
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ------------ SUB-COMPONENTS ----------- */
function OverviewCard({ data }: { data: LevelData }) {
  return (
    <div className="bg-brand-light rounded-xl shadow-soft p-6 md:p-8">
      <h3 className="text-xl md:text-2xl font-bold text-brand-dark mb-6">Class Overview</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <OverviewItem icon={Users} label="Age Group" value={data['Age Group']} />
        <OverviewItem icon={Clock} label="Duration" value={data.Duration} />
        <OverviewItem icon={User}  label="Students" value={`${data.Students} enrolled`} />
        <OverviewItem icon={BookOpen} label="Level" value={`Level ${data.Level}`} />
        <OverviewItem icon={Star} label="Fees" value={data.Fees} />
      </div>
    </div>
  );
}

function OverviewItem({ icon: Icon, label, value }:{icon:any;label:string;value:string}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-accent mt-1" />
      <div>
        <p className="font-medium text-brand-dark">{label}</p>
        <p className="text-brand-dark/70 text-sm">{value}</p>
      </div>
    </div>
  );
}

function InfoCard({ title, items }:{title:string; items:string}) {
  return (
    <div className="bg-brand-light rounded-xl shadow-soft p-6 md:p-8">
      <h3 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">{title}</h3>
      <ul className="list-disc list-inside space-y-1 text-brand-dark/80 text-sm md:text-base text-justify">
        {items.split(',').map((i,idx)=>(
          <li key={idx}>{i.trim()}</li>
        ))}
      </ul>
    </div>
  );
}

function TextCard({ title, text }:{title:string; text:string}) {
  return (
    <div className="bg-brand-light rounded-xl shadow-soft p-6 md:p-8">
      <h3 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">{title}</h3>
      <p className="text-brand-dark/80 whitespace-pre-line text-sm md:text-base text-justify">
        {text}
      </p>
    </div>
  );
}
export default PathsalaLevel;
