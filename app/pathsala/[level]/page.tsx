'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, Clock, Users, User } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import axios from 'axios';

// Corrected LevelData interface based on the API response structure
interface LevelData {
  Level: string;
  Title: string;
  Description: string;
  'Age Group': string;
  Duration: string;
  Students: number;
  'Topics Covered': string;
  'Key Activities ': string; // Note the trailing space in the key from the API
  'Teachers Note': string;
  'Learning Outcome': string;
}

const API_URL = 'https://script.google.com/macros/s/AKfycbyHVNzO5Wbr-OBUAD_KPKPazFsZWz4ak7LONoccChBmZnAmnINE6cUbcnmH_647G5urKw/exec';

const PathsalaLevel: React.FC = () => {
  const params = useParams();
  // Strip the 'level-' prefix from the level parameter
  const level = Array.isArray(params.level) ? params.level[0].replace('level-', '').trim() : params.level?.replace('level-', '').trim();

  const [data, setData] = useState<LevelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Level parameter from URL (stripped):', level); // Log level parameter

    const stored = sessionStorage.getItem(`pathsala-level-${level}`);
    if (stored) {
      setData(JSON.parse(stored));
      setLoading(false);
    } else {
      axios.get(API_URL)
        .then((res) => {
          console.log("API Response:", res.data); // <-- Log the raw response here
          
          // Check if the levels exist in the API data
          const found = res.data.levels.find((lvl: LevelData) => {
            // Log both values being compared
            console.log('Comparing level from URL:', level, 'with API level:', lvl.Level); // Log level comparison

            // Convert both `level` and `lvl.Level` to strings before comparing
            return String(lvl.Level).trim() === level; // Compare the level from the URL with the API data
          });

          if (found) {
            setData(found);
          } else {
            console.log('No matching level found.');
            setData(null); // Set to null if no matching level is found
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Fetch error:', err);
          setLoading(false);
        });
    }
  }, [level]);

  if (loading) return <div className="min-h-screen">Loading...</div>;
  if (!data) return <div className="min-h-screen">Level not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      <main className="pt-16">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Pathshala Level {data.Level}</h1>
          <h2 className="text-2xl mb-4">{data.Title}</h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">{data.Description}</p>
        </div>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Class Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <OverviewItem icon={Users} label="Age Group" value={data['Age Group']} />
                  <OverviewItem icon={Clock} label="Duration" value={data.Duration} />
                  <OverviewItem icon={User} label="Students" value={`${data.Students} enrolled`} />
                  <OverviewItem icon={BookOpen} label="Level" value={`Level ${data.Level}`} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Topics Covered</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  {data['Topics Covered'].split(',').map((item, idx) => (
                    <li key={idx}>{item.trim()}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Activities</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  {data['Key Activities '].split(',').map((item, idx) => (
                    <li key={idx}>{item.trim()}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Teacher's Note</h3>
                <p className="text-gray-700 whitespace-pre-line">{data['Teachers Note']}</p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Learning Outcomes</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  {data['Learning Outcome'].split(',').map((item, idx) => (
                    <li key={idx}>{item.trim()}</li>
                  ))}
                </ul>
              </div>
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
                <a href="/feedback" className="block bg-white hover:bg-gray-50 text-orange-600 border border-orange-600 py-2 px-4 rounded-lg font-medium text-center">
                  Ask Questions
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

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

export default PathsalaLevel;
