import React from 'react';
import { Building, Calendar, DollarSign, Users, Target, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Jinalay: React.FC = () => {
  const progressPercentage = 65; // Current fundraising progress
  const goalAmount = 2500000; // $2.5 million goal
  const raisedAmount = 1625000; // $1.625 million raised

  const milestones = [
    { phase: 'Land Acquisition', status: 'completed', date: '2022-03-15' },
    { phase: 'Architectural Design', status: 'completed', date: '2022-08-20' },
    { phase: 'City Permits', status: 'completed', date: '2023-01-10' },
    { phase: 'Groundbreaking', status: 'completed', date: '2023-06-15' },
    { phase: 'Foundation Work', status: 'in-progress', date: '2024-01-01' },
    { phase: 'Structural Construction', status: 'upcoming', date: '2024-06-01' },
    { phase: 'Interior Work', status: 'upcoming', date: '2025-01-01' },
    { phase: 'Grand Opening', status: 'upcoming', date: '2025-08-15' }
  ];

  const donationTiers = [
    {
      amount: 1000,
      title: 'Stone Supporter',
      benefits: ['Name engraved on donor wall', 'Special recognition ceremony', 'Monthly progress updates'],
      donors: 45
    },
    {
      amount: 5000,
      title: 'Pillar Patron',
      benefits: ['Dedicated plaque', 'VIP opening ceremony invitation', 'Annual donor appreciation event'],
      donors: 28
    },
    {
      amount: 10000,
      title: 'Foundation Friend',
      benefits: ['Room dedication opportunity', 'Lifetime honorary membership', 'Personal meeting with architect'],
      donors: 15
    },
    {
      amount: 25000,
      title: 'Heritage Guardian',
      benefits: ['Major facility naming rights', 'Permanent memorial installation', 'Board consultation privilege'],
      donors: 8
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      <main>
        <div className="pt-16">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Jinalay Project</h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Building a sacred space for future generations - Our new temple complex
              </p>
            </div>
          </div>

          {/* Vision Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  The Jinalay Project represents our commitment to creating a spiritual haven that will serve 
                  our community for generations to come. This sacred space will be a center for worship, 
                  education, and cultural preservation.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <img
                    src="https://images.pexels.com/photos/161158/governor-s-island-india-temple-161158.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Jinalay architectural design"
                    className="w-full h-96 object-cover rounded-lg shadow-lg"
                  />
                </div>
                <div className="space-y-6">
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="text-2xl font-bold text-orange-600 mb-4">Project Features</h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Main prayer hall with capacity for 500 devotees</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Dedicated Pathshala classrooms and library</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Community kitchen and dining hall</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Administrative offices and meeting rooms</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Meditation garden and peaceful outdoor spaces</span>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>Modern facilities with traditional architectural design</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Progress Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Construction Progress</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Track our journey from groundbreaking to grand opening
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative">
                    <div className={`p-6 rounded-lg border-2 ${
                      milestone.status === 'completed' 
                        ? 'bg-green-50 border-green-200' 
                        : milestone.status === 'in-progress'
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`w-8 h-8 rounded-full mx-auto mb-4 flex items-center justify-center ${
                        milestone.status === 'completed' 
                          ? 'bg-green-600 text-white' 
                          : milestone.status === 'in-progress'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-400 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{milestone.phase}</h3>
                      <p className="text-sm text-gray-600 text-center">
                        {new Date(milestone.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <div className={`mt-3 text-xs font-medium text-center px-3 py-1 rounded-full ${
                        milestone.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : milestone.status === 'in-progress'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {milestone.status.replace('-', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Current Status</h3>
                  <p className="text-gray-600">Foundation work is currently underway</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-orange-50 rounded-lg">
                    <Building className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Construction Phase</h4>
                    <p className="text-gray-600">Foundation & Structural</p>
                  </div>
                  <div className="text-center p-6 bg-orange-50 rounded-lg">
                    <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Expected Completion</h4>
                    <p className="text-gray-600">August 2025</p>
                  </div>
                  <div className="text-center p-6 bg-orange-50 rounded-lg">
                    <Users className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Capacity</h4>
                    <p className="text-gray-600">500 Devotees</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Fundraising Progress */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Fundraising Progress</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Together, we're building something extraordinary for our community
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">${raisedAmount.toLocaleString()}</div>
                    <div className="text-gray-600">Raised</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">${goalAmount.toLocaleString()}</div>
                    <div className="text-gray-600">Goal</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="bg-gradient-to-r from-orange-600 to-orange-700 h-6 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-6 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{progressPercentage}%</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">${(goalAmount - raisedAmount).toLocaleString()}</div>
                    <div className="text-gray-600">Remaining</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">96</div>
                    <div className="text-gray-600">Donors</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">12 months</div>
                    <div className="text-gray-600">To completion</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <a
                  href="/contribute"
                  className="inline-flex items-center bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Contribute to Jinalay Project
                </a>
              </div>
            </div>
          </section>

          {/* Donation Tiers */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Donation Tiers</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Choose a level of support that reflects your commitment to our community
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {donationTiers.map((tier, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-600">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-orange-600 mb-2">${tier.amount.toLocaleString()}</div>
                      <h3 className="text-xl font-semibold text-gray-900">{tier.title}</h3>
                      <p className="text-sm text-gray-600 mt-2">{tier.donors} donors</p>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {tier.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700 text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <a
                      href="/contribute"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors text-center block"
                    >
                      Donate ${tier.amount.toLocaleString()}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Impact Statement */}
          <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-6">Building for the Future</h2>
              <p className="text-xl opacity-90 max-w-4xl mx-auto mb-8">
                The Jinalay Project is more than just a building - it's a foundation for preserving our 
                sacred traditions, educating our children, and strengthening our community bonds for 
                generations to come.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">500+</div>
                  <div className="text-orange-100">Families Served</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">100+</div>
                  <div className="text-orange-100">Pathshala Students</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">50+</div>
                  <div className="text-orange-100">Annual Events</div>
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

export default Jinalay;