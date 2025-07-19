'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Clock, Star, X } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface LevelData {
  level: string;
  title: string;
  description: string;
  ageGroup: string;
  duration: string;
  students: number;
  topicsCovered: string;
  keyActivities: string;
  teachersNote: string;
  learningOutcome: string;
}

const Pathsala: React.FC = () => {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);

  useEffect(() => {
    axios
      .get('https://script.google.com/macros/s/AKfycbxGGp07f15g5nmWvEhKuYwXufkp0bfTKO40mDeiAbXoyFo83JyFNer3vK0_KKeNY7sUgA/exec') // Add your API endpoint here
      .then((res) => {
        setLevels(res.data.levels || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching levels:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="pt-16 text-center">Loading Pathshala Levels...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      <main>
        <div className="pt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Pathshala Program</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Nurturing young minds with Jain values, philosophy, and cultural heritage
          </p>
        </div>
      </div>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About Our Pathshala</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our Pathshala program provides comprehensive Jain education from childhood through young adulthood.
              Each level builds upon the previous, creating a strong foundation in Jain principles and practices.
            </p>
          </div>

          {/* Levels Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {levels.map((level) => (
              <div
                key={level.level}
                className="bg-white rounded-lg shadow-lg border border-orange-100 hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-orange-600">Level {level.level}</h3>
                    <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      {level.ageGroup}
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">{level.title}</h4>
                  <p className="text-gray-600 mb-4">{level.description}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{level.duration} per session</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{level.students} students enrolled</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedLevel(level)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Highlights Section */}
          <div className="bg-orange-50 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: BookOpen, title: 'Comprehensive Curriculum', desc: 'Age-appropriate lessons on Jain philosophy, history, and practices' },
                { icon: Users, title: 'Experienced Teachers', desc: 'Volunteer teachers with deep knowledge of Jain traditions' },
                { icon: Star, title: 'Cultural Activities', desc: 'Festivals, competitions, and cultural programs to enhance learning' }
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

      {/* Registration Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Information</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Join our Pathsala program and give your child the gift of Jain education
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Schedule & Timing</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Day', value: 'Every Sunday' },
                    { label: 'Time', value: '10:00 AM - 12:00 PM' },
                    { label: 'Location', value: 'JSSD Community Center' },
                    { label: 'Annual Fee', value: '$100 per student' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b pb-2">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-gray-600">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Register</h3>
                <div className="space-y-4">
                  {['Complete Application', 'Submit Payment', 'Receive Confirmation'].map((step, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3 mt-1">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{step}</h4>
                        <p className="text-gray-600 text-sm">
                          {idx === 0 && 'Fill out the registration form with student details'}
                          {idx === 1 && 'Pay the annual fee through our secure payment portal'}
                          {idx === 2 && 'Get confirmation email with class details and materials list'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Link
                    href="/membership"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors text-center block"
                  >
                    Register Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedLevel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-11/12 md:w-3/4 lg:w-2/3 relative">
            <button
              onClick={() => setSelectedLevel(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedLevel.title} — Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Topics Covered", data: selectedLevel.topicsCovered },
                { title: "Key Activities", data: selectedLevel.keyActivities },
                { title: "Teacher's Note", data: selectedLevel.teachersNote },
                { title: "Learning Outcome", data: selectedLevel.learningOutcome }
              ].map((section, idx) => (
                <div key={idx}>
                  <h3 className="font-bold text-orange-600 mb-2">{section.title}</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {section.data.split(',').map((item, subIdx) => (
                      <li key={subIdx}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
     </main>
      <Footer />
    </div>
  );
};

export default Pathsala;
