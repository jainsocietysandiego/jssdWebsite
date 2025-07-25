'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, Clock, Users, User, Star } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <main className="pt-16">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Pathshala Level {data.Level}</h1>
          <h2 className="text-2xl mb-4">{data.Title}</h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">{data.Description}</p>
        </div>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <OverviewCard data={data} />
              <InfoCard title="Topics Covered" items={data['Topics Covered']} />
              <InfoCard title="Key Activities" items={data['Key Activities ']} />
              <TextCard title="Teacher's Note" text={data['Teachers Note']} />
              <InfoCard title="Learning Outcomes" items={data['Learning Outcome']} />
            </div>

            <div className="bg-orange-50 rounded-lg p-6 h-fit">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Interested in Joining?</h3>
              <p className="text-gray-600 mb-4">
                Register for this level or contact us for more information about our Pathshala program.
              </p>
              <div className="space-y-3">
                <a href="/membership" className="block bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium text-center">
                  Register Now
                </a>
                <a href="/#feedback" className="block bg-white hover:bg-gray-50 text-orange-600 border border-orange-600 py-2 px-4 rounded-lg font-medium text-center">
                  Ask Questions
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

function OverviewCard({ data }: { data: LevelData }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Class Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewItem icon={Users} label="Age Group" value={data['Age Group']} />
        <OverviewItem icon={Clock} label="Duration" value={data.Duration} />
        <OverviewItem icon={User} label="Students" value={`${data.Students} enrolled`} />
        <OverviewItem icon={BookOpen} label="Level" value={`Level ${data.Level}`} />
        <OverviewItem icon={Star} label="Fees" value={data.Fees} />
      </div>
    </div>
  );
}

function OverviewItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center">
      <Icon className="h-6 w-6 text-orange-600 mr-3" />
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-gray-600">{value}</p>
      </div>
    </div>
  );
}

function InfoCard({ title, items }: { title: string; items: string }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">{title}</h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2">
        {items.split(',').map((item, idx) => (
          <li key={idx}>{item.trim()}</li>
        ))}
      </ul>
    </div>
  );
}

function TextCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">{title}</h3>
      <p className="text-gray-700 whitespace-pre-line">{text}</p>
    </div>
  );
}

export default PathsalaLevel;
