import React from 'react';
import { Heart, Users, BookOpen, Home } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="pt-16">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About JSSD</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Discover our rich history, mission, and vision for the Jain community in San Diego
          </p>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  The Jain Society of San Diego was founded in 1999 with a simple yet profound mission: 
                  to create a spiritual home for the Jain community in Southern California. What began 
                  as a small group of families gathering for prayers has grown into a vibrant organization 
                  serving over 500 members.
                </p>
                <p>
                  Our journey has been marked by dedication to preserving the timeless teachings of 
                  the Tirthankaras while adapting to the modern world. We've established educational 
                  programs, cultural events, and community services that honor our heritage while 
                  embracing the diverse community we serve.
                </p>
                <p>
                  Today, JSSD stands as a beacon of Jain values in San Diego, continuing to inspire 
                  generations through the principles of Ahimsa, Satya, and Dharma.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-orange-100 p-8 rounded-lg">
                <img
                  src="https://images.pexels.com/photos/8369648/pexels-photo-8369648.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Community gathering"
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <div className="text-center p-6 bg-orange-50 rounded-lg">
              <div className="bg-orange-600 text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Compassion</h3>
              <p className="text-gray-600">
                Living with kindness and empathy towards all beings
              </p>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-lg">
              <div className="bg-orange-600 text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-600">
                Building strong bonds and supporting each other
              </p>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-lg">
              <div className="bg-orange-600 text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Education</h3>
              <p className="text-gray-600">
                Sharing knowledge and wisdom across generations
              </p>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-lg">
              <div className="bg-orange-600 text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Home className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tradition</h3>
              <p className="text-gray-600">
                Preserving our rich cultural heritage
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-8 rounded-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-xl opacity-90">
                To be a leading spiritual and cultural center that inspires the practice of Jain principles
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Spiritual Growth</h3>
                <p className="opacity-90">
                  Foster spiritual development through regular prayers, meditation, and study
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Cultural Preservation</h3>
                <p className="opacity-90">
                  Maintain and celebrate Jain traditions, festivals, and customs
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Community Service</h3>
                <p className="opacity-90">
                  Serve the broader community through charitable activities and social causes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Organizational Structure</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              JSSD is governed by a constitution and managed by dedicated volunteers who are elected by our members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-orange-600 mb-6">Executive Committee</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-semibold">President</span>
                  <span className="text-gray-600">2-year term</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-semibold">Vice President</span>
                  <span className="text-gray-600">2-year term</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-semibold">Secretary</span>
                  <span className="text-gray-600">2-year term</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Treasurer</span>
                  <span className="text-gray-600">2-year term</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-orange-600 mb-6">Trustee Committee</h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  The Trustee Committee provides oversight and guidance to ensure JSSD operates 
                  in accordance with its constitution and mission.
                </p>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Key Responsibilities:</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Financial oversight and accountability</li>
                    <li>• Strategic planning and direction</li>
                    <li>• Policy development and implementation</li>
                    <li>• Community representation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;