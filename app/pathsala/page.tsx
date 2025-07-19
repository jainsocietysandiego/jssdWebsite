import React from 'react';
import Link from 'next/link';
import { BookOpen, Users, Clock, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Pathsala: React.FC = () => {
  const levels = [
    {
      level: "1",
      title: 'Foundation Level',
      description: 'Introduction to Jain principles and basic prayers',
      ageGroup: '5-7 years',
      duration: '1 hour',
      students: 15
    },
    {
      level: 2,
      title: 'Elementary Level',
      description: 'Stories of Tirthankaras and basic Jain history',
      ageGroup: '8-9 years',
      duration: '1.5 hours',
      students: 18
    },
    {
      level: 3,
      title: 'Intermediate Level',
      description: 'Understanding of Five Vratas and Jain philosophy',
      ageGroup: '10-11 years',
      duration: '1.5 hours',
      students: 20
    },
    {
      level: 4,
      title: 'Advanced Basics',
      description: 'Deeper study of Jain scriptures and practices',
      ageGroup: '12-13 years',
      duration: '2 hours',
      students: 16
    },
    {
      level: 5,
      title: 'Philosophy Level',
      description: 'Advanced Jain philosophy and ethical discussions',
      ageGroup: '14-15 years',
      duration: '2 hours',
      students: 12
    },
    {
      level: 6,
      title: 'Leadership Level',
      description: 'Training for community leadership and service',
      ageGroup: '16-17 years',
      duration: '2 hours',
      students: 8
    },
    {
      level: 7,
      title: 'Advanced Studies',
      description: 'In-depth scripture study and teaching preparation',
      ageGroup: '18+ years',
      duration: '2.5 hours',
      students: 6
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      <main>
        <div className="pt-16">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Pathshala Program</h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Nurturing young minds with Jain values, philosophy, and cultural heritage
              </p>
            </div>
          </div>

          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">About Our Pathshala</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Our Pathshala program is designed to provide comprehensive Jain education from 
                  childhood through young adulthood. Each level builds upon the previous, creating 
                  a strong foundation in Jain principles, philosophy, and practices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {levels.map((level) => (
                  <div key={level.level} className="bg-white rounded-lg shadow-lg border border-orange-100 hover:shadow-xl transition-shadow">
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

                      <Link
                        href={`/pathsala/level-${level.level}`}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center block"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-orange-50 rounded-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-orange-600 text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <BookOpen className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Comprehensive Curriculum</h3>
                    <p className="text-gray-600">
                      Age-appropriate lessons covering Jain philosophy, history, and practices
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-600 text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Experienced Teachers</h3>
                    <p className="text-gray-600">
                      Dedicated volunteer teachers with deep knowledge of Jain traditions
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-600 text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Star className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Cultural Activities</h3>
                    <p className="text-gray-600">
                      Festivals, competitions, and cultural programs to enhance learning
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

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
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-medium">Day</span>
                        <span className="text-gray-600">Every Sunday</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-medium">Time</span>
                        <span className="text-gray-600">10:00 AM - 12:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-medium">Location</span>
                        <span className="text-gray-600">JSSD Community Center</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Annual Fee</span>
                        <span className="text-gray-600">$100 per student</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Register</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3 mt-1">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Complete Application</h4>
                          <p className="text-gray-600 text-sm">Fill out the registration form with student details</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3 mt-1">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Submit Payment</h4>
                          <p className="text-gray-600 text-sm">Pay the annual fee through our secure payment portal</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3 mt-1">
                          3
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Receive Confirmation</h4>
                          <p className="text-gray-600 text-sm">Get confirmation email with class details and materials list</p>
                        </div>
                      </div>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pathsala;