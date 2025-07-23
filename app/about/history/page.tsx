'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface SheetEntry {
  Section: string;
  Label: string;
  Content: string;
}

const HistoryPage: React.FC = () => {
  const [data, setData] = useState<SheetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const getContent = (section: string, label: string) =>
    data.find(entry => entry.Section === section && entry.Label === label)?.Content || '';

  const getParagraphs = () =>
    (data.find(entry => entry.Section === 'description')?.Content || '')
      .split(/\n\s*\n/)
      .filter(Boolean);

  const getPhases = () =>
    data.filter(entry => entry.Section === 'phase');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('https://script.google.com/macros/s/AKfycbw_x_gsRrQ3MEn1ZJBDGs8qhv6u0Uf4Ms_eGrzCetAOH4vwSawGVgkT5vGByArv040b/exec'); // Replace with your actual Apps Script URL
        setData(res.data.content || []);
      } catch (error) {
        console.error('Error fetching history content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />

      <main className="pt-16">
        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center text-xl">
            Loading History...
          </div>
        ) : (
          <>
            {/* Banner */}
            <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
              <div className="max-w-7xl mx-auto px-4 text-center">
                <h1 className="text-5xl font-bold">
                  {getContent('banner', 'Title') || 'Our History'}
                </h1>
              </div>
            </section>

            {/* Paragraph Description */}
            <section className="py-16 bg-white border border-shadow-md border-colour-gray rounded-xl ">
              <div className="max-w-5xl mx-auto px-4 space-y-6 text-gray-800 text-lg leading-relaxed text-justify">
                {getParagraphs().map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </section>

            {/* Phases Section */}
            <section className="py-16 bg-orange-50">
              <div className="max-w-5xl mx-auto px-4 space-y-10">
                {getPhases().map((phase, idx) => (
                  <div key={idx}>
                    <h3 className="text-xl font-bold text-orange-700 mb-2">
                      {phase.Label}
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed">
                      {phase.Content}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HistoryPage;
