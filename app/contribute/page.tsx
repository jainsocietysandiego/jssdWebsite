'use client'

import React, { useState } from 'react';
import { Heart, CreditCard, Calendar, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Contribute: React.FC = () => {
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donationCategory, setDonationCategory] = useState<string>('general');

  const predefinedAmounts = [25, 50, 100, 250, 500, 1000];

  const categories = [
    { id: 'general', name: 'General Fund', description: 'Support overall operations and community programs' },
    { id: 'annadan', name: 'Annadan', description: 'Food donation for community events and festivals' },
    { id: 'pathsala', name: 'Pathsala Education', description: 'Support educational programs and materials' },
    { id: 'jinalay', name: 'Jinalay Project', description: 'Contribute to the new temple construction' },
    { id: 'events', name: 'Community Events', description: 'Fund cultural and religious celebrations' },
    { id: 'maintenance', name: 'Facility Maintenance', description: 'Keep our community center in excellent condition' }
  ];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(0);
  };

  const getFinalAmount = () => {
    return customAmount ? parseFloat(customAmount) : selectedAmount;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      <main>
        <div className="pt-16">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Support Our Community</h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Your generous contributions help us preserve Jain traditions and serve our community
              </p>
            </div>
          </div>

          <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Make a Donation</h2>

                <div className="space-y-8">
                  {/* Donation Type */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Donation Type</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setDonationType('one-time')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          donationType === 'one-time'
                            ? 'border-orange-600 bg-orange-50 text-orange-600'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <CreditCard className="h-6 w-6 mx-auto mb-2" />
                        <p className="font-medium">One-time Donation</p>
                      </button>
                      <button
                        onClick={() => setDonationType('monthly')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          donationType === 'monthly'
                            ? 'border-orange-600 bg-orange-50 text-orange-600'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <Calendar className="h-6 w-6 mx-auto mb-2" />
                        <p className="font-medium">Monthly Donation</p>
                      </button>
                    </div>
                  </div>

                  {/* Donation Category */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Donation Category</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setDonationCategory(category.id)}
                          className={`p-4 rounded-lg border-2 text-left transition-colors ${
                            donationCategory === category.id
                              ? 'border-orange-600 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <h4 className="font-medium text-gray-900 mb-1">{category.name}</h4>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount Selection */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Amount</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-4">
                      {predefinedAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleAmountSelect(amount)}
                          className={`p-3 rounded-lg border-2 font-medium transition-colors ${
                            selectedAmount === amount
                              ? 'border-orange-600 bg-orange-50 text-orange-600'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Enter custom amount"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Donor Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Donor Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Any specific wishes or instructions for your donation..."
                    />
                  </div>

                  {/* Anonymous Donation */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymous"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                      Make this donation anonymous
                    </label>
                  </div>

                  {/* Donation Summary */}
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Donation Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Donation Type:</span>
                        <span className="font-medium">{donationType === 'one-time' ? 'One-time' : 'Monthly'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">
                          {categories.find(c => c.id === donationCategory)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-xl text-orange-600">
                          ${getFinalAmount() || 0}
                          {donationType === 'monthly' && '/month'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center"
                    disabled={!getFinalAmount()}
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Donate ${getFinalAmount() || 0}
                    {donationType === 'monthly' && '/month'}
                  </button>

                  <p className="text-sm text-gray-600 text-center">
                    Your donation is secure and will be processed through our trusted payment gateway. 
                    You will receive a tax-deductible receipt via email.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Impact Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Impact</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  See how your contributions make a difference in our community
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="bg-orange-100 text-orange-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold">$25</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pathsala Materials</h3>
                  <p className="text-gray-600">Provides educational materials for one student for a month</p>
                </div>

                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="bg-orange-100 text-orange-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold">$100</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Event</h3>
                  <p className="text-gray-600">Helps organize and host one community festival or celebration</p>
                </div>

                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="bg-orange-100 text-orange-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold">$500</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Facility Maintenance</h3>
                  <p className="text-gray-600">Covers monthly maintenance costs for our community center</p>
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

export default Contribute;