'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Image from 'next/image';

interface Member {
  Section: string;
  Name: string;
  Role: string;
  Email: string;
  Extension: string;
  'Term End': string;
  'Image Name': string;
  ImageURL?: string;
}

interface SheetEntry {
  Section: string;
  Name: string;
  Role: string;
  Email: string;
  Extension: string;
  'Term End': string;
  'Image Name': string;
  ImageURL?: string;
}

const SECTION_LABELS: Record<string, string> = {
  top_members: 'Executive Committee & Board of Directors',
  executive_committee: 'Executive Committee',
  past_president: 'Immediate Past President',
  board_of_directors: 'Board of Directors',
  jaina_directors: 'JAINA Directors',
};

const BODPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [bannerTitle, setBannerTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get('https://script.google.com/macros/s/AKfycbyNPC97PyE0Uye8dzZ-5sDKe6IGuPlUsSf2WY4dW1kxrYtLEYfnXV0gND2B3qMW9Bsz/exec'); // Replace with Apps Script URL
        const data: SheetEntry[] = res.data.content || [];

        setBannerTitle(
          data.find((row) => row.Section === 'banner')?.Name || 'Executive Committee & BOD'
        );

        setIntro(
          data.find((row) => row.Section === 'intro')?.Name || ''
        );

        const people = data.filter((row) =>
          Object.keys(SECTION_LABELS).includes(row.Section)
        ) as Member[];

        setMembers(people);
      } catch (err) {
        console.error('Failed to fetch EC & BOD data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const renderSection = (sectionKey: string) => {
    const people = members.filter((m) => m.Section === sectionKey);
    if (people.length === 0) return null;

    return (
      <section key={sectionKey} className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-orange-700 border-b border-orange-200 mb-6 pb-2">
          {SECTION_LABELS[sectionKey]}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {people.map((person, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md p-4 flex gap-4 items-start"
            >
            <div className="relative w-20 h-20 min-w-[80px] rounded-full overflow-hidden border">
            <Image
                src={person.ImageURL?.trim() || ''}
                alt={person.Name}
                fill
                className="object-cover"
                onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.Name)}&background=F97316&color=fff&rounded=true`;
                }}
            />
            </div>


              <div>
                <h3 className="text-lg font-bold text-gray-900">{person.Name}</h3>
                <p className="text-sm text-orange-700 font-semibold mb-1">
                  {person.Role}
                </p>
                <p className="text-sm text-gray-700 break-words">{person.Email}</p>
                <p className="text-sm text-gray-500">Extension: {person.Extension}</p>
                <p className="text-sm text-gray-500">Term Ends: {new Date(person['Term End']).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />

      <main className="pt-16">
        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center text-xl">
            Loading Executive Committee & BOD...
          </div>
        ) : (
          <>
            {/* Banner */}
            <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
              <div className="max-w-7xl mx-auto px-4 text-center">
                <h1 className="text-5xl font-bold">{bannerTitle}</h1>
              </div>
            </section>

            {/* Intro */}
            <section className="py-12 bg-white">
              <div className="max-w-7xl mx-auto px-4">
                <p className="text-lg text-gray-700 leading-relaxed text-justify whitespace-pre-line">{intro}</p>
              </div>
            </section>

            {/* Dynamic Sections */}
            <div className="max-w-7xl mx-auto px-4">
              {Object.keys(SECTION_LABELS).map(renderSection)}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BODPage;
