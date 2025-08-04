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
          <h1 className="font-bold text-brand-light text-3xl sm:text-4xl md:text-5xl
                         drop-shadow-[0_0_10px_rgb(255_255_255_/_50%)]">
            Pathshala Level {data.Level}
          </h1>
          <h2 className="mt-3 text-white text-lg sm:text-xl md:text-2xl max-w-4xl mx-auto">
            {data.Title} — {data.Description}
          </h2>
      </div>
    </section>

    {/* ───── DETAIL SECTION ───── */}
    <main className="py-12 md:py-16 bg-brand-white relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-brand-dark/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Main Content - Enhanced Layout */}
          <div className="lg:col-span-8 space-y-6">
            {/* Overview Card - Enhanced */}
            <div className="bg-gradient-to-br from-brand-light to-brand-light/50 rounded-2xl shadow-soft p-6 md:p-8 border border-accent/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-brand-light" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-brand-dark">Class Overview</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <OverviewItem icon={Users} label="Age Group" value={data['Age Group']} />
                <OverviewItem icon={Clock} label="Duration" value={data.Duration} />
                <OverviewItem icon={User} label="Students" value={`${data.Students} enrolled`} />
                <OverviewItem icon={BookOpen} label="Level" value={`Level ${data.Level}`} />
                <OverviewItem icon={Star} label="Fees" value={data.Fees} />
              </div>
            </div>

            {/* Two Column Layout for Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <InfoCard title="Topics Covered" items={data['Topics Covered']} />
              <InfoCard title="Key Activities" items={data['Key Activities ']} />
            </div>

            {/* Teacher's Note - Full Width with Special Styling */}
            <div className="bg-gradient-to-r from-accent/10 via-brand-light to-accent/10 rounded-2xl shadow-soft p-6 md:p-8 border-l-4 border-accent">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Star className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-brand-dark">Teacher's Note</h3>
              </div>
              <p className="text-brand-dark/80 whitespace-pre-line text-sm md:text-base text-justify leading-relaxed">
                {data['Teachers Note']}
              </p>
            </div>

            {/* Learning Outcomes */}
            <InfoCard title="Learning Outcomes" items={data['Learning Outcome']} />
          </div>

          {/* Enhanced Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* Main CTA Card */}
              <div className="bg-brand-dark rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-brand-light mb-3">
                  Ready to Join?
                </h3>
                <p className="text-white mb-6 text-sm text-center">
                  Register for this level or contact us for more information about our Pathshala program.
                </p>
                <div className="space-y-3">
                  <a
                    href="/pathsala/register"
                    className="block bg-brand-light hover:bg-brand-white text-brand-dark hover:text-accent py-3 px-6 rounded-xl font-semibold text-center text-sm md:text-base transition-all duration-300 hover:scale-105"
                  >
                    Register Now
                  </a>
                  <a
                    href="/#feedback"
                    className="block bg-transparent border-2 border-brand-light text-brand-light hover:bg-brand-light hover:text-brand-dark py-3 px-6 rounded-xl font-semibold text-center text-sm md:text-base transition-all duration-300"
                  >
                    Ask Questions
                  </a>
                </div>
              </div>

              {/* Quick Info Card */}
              <div className="bg-brand-light rounded-xl shadow-soft p-6 border border-accent/10">
                <h4 className="font-bold text-accent mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quick Info
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-dark/70">Level:</span>
                    <span className="font-medium text-brand-dark">{data.Level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-dark/70">Duration:</span>
                    <span className="font-medium text-brand-dark">{data.Duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-dark/70">Fee:</span>
                    <span className="font-medium text-accent">{data.Fees}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
);

/* ------------ ENHANCED SUB-COMPONENTS ----------- */
function OverviewItem({ icon: Icon, label, value }:{icon:any;label:string;value:string}) {
  return (
    <div className="bg-brand-white rounded-xl p-4 shadow-soft hover:shadow-lg transition-shadow border border-accent/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="font-medium text-brand-dark text-sm">{label}</p>
          <p className="text-brand-dark/70 text-md">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, items }:{title:string; items:string}) {
  return (
    <div className="bg-brand-light rounded-xl shadow-soft p-6 border border-accent/10 hover:shadow-lg transition-shadow">
      <h3 className="text-lg md:text-xl font-bold text-brand-dark mb-4">{title}</h3>
      <div className="space-y-3">
        {items.split(',').map((i,idx)=>(
          <div key={idx} className="flex items-start gap-3 group">
            <div className="w-6 h-6 bg-accent/10 rounded-lg flex items-center justify-center mt-0.5 group-hover:bg-accent/20 transition-colors">
              <span className="w-2 h-2 bg-accent rounded-full"></span>
            </div>
            <span className="text-brand-dark/80 text-sm md:text-base text-justify leading-relaxed">
              {i.trim()}
            </span>
          </div>
        ))}
      </div>
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
}
export default PathsalaLevel;
