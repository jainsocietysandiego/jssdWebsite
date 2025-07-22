'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Clock, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface LevelData {
  Level: string;
  Title: string;
  Description: string;
  'Age Group': string;
  Duration: string;
  Students: number;
  'Topics Covered': string;
  'Key Activities ': string;
  'Teachers Note': string;
  'Learning Outcome': string;
}

const API_URL =
  'https://script.google.com/macros/s/AKfycbyHVNzO5Wbr-OBUAD_KPKPazFsZWz4ak7LONoccChBmZnAmnINE6cUbcnmH_647G5urKw/exec';
const LOCAL_JSON_URL = '/pathsala.json';
const CACHE_KEY = 'pathshala-api';
const CACHE_TTL = 10 * 60 * 1000;

const Pathsala: React.FC = () => {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAndCacheFromAPI = async () => {
      try {
        const res = await fetch(API_URL);
        const apiData = await res.json();
        if (apiData?.levels) {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: apiData.levels, timestamp: Date.now() })
          );
          setLevels(apiData.levels);
        }
      } catch (e) {
        console.error('Failed to fetch from API:', e);
      }
    };

    const loadData = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setLevels(cachedData);
            setLoading(false);
            fetchAndCacheFromAPI(); // Background refresh
            return;
          }
        } catch {
          console.warn('Corrupted cache, fallback to JSON');
        }
      }

      // Fallback to static JSON
      try {
        const res = await fetch(LOCAL_JSON_URL);
        const fallbackData = await res.json();
        if (fallbackData?.levels) {
          setLevels(fallbackData.levels);
        } else {
          setError('Fallback data invalid.');
        }
      } catch (e) {
        console.error('Error loading local fallback JSON:', e);
        setError('Failed to load data.');
      }

      setLoading(false);
      fetchAndCacheFromAPI(); // Background refresh
    };

    loadData();
  }, []);

  if (loading) return <div className="min-h-screen">Loading...</div>;
  if (error) return <div className="min-h-screen text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      <main>
        <div className="pt-16">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Pathshala Program</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Nurturing young minds with Jain values, philosophy, and cultural heritage
            </p>
          </div>

          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">About Our Pathshala</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Our Pathshala program provides comprehensive Jain education from childhood through young adulthood. Each level builds upon the previous, creating a strong foundation in Jain principles and practices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {levels.map((level) => (
                  <div
                    key={level.Level}
                    className="bg-white rounded-lg shadow-lg border border-orange-100 hover:shadow-xl transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-orange-600">Level {level.Level}</h3>
                        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                          {level['Age Group']}
                        </div>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">{level.Title}</h4>
                      <p className="text-gray-600 mb-4">{level.Description}</p>
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{level.Duration} per session</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{level.Students} students enrolled</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          sessionStorage.setItem(
                            `pathsala-level-${level.Level}`,
                            JSON.stringify(level)
                          );
                          router.push(`/pathsala/level-${level.Level}`);
                        }}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-orange-50 rounded-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: BookOpen,
                      title: 'Comprehensive Curriculum',
                      desc: 'Age-appropriate lessons on Jain philosophy, history, and practices',
                    },
                    {
                      icon: Users,
                      title: 'Experienced Teachers',
                      desc: 'Volunteer teachers with deep knowledge of Jain traditions',
                    },
                    {
                      icon: Star,
                      title: 'Cultural Activities',
                      desc: 'Festivals, competitions, and cultural programs to enhance learning',
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="bg-orange-600 text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <item.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pathsala;
