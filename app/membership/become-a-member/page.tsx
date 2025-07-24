'use client'

import React, { useState } from 'react';
import { Users, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const BecomeAMember: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    familyMembers: '',
    interests: [] as string[],
    subscribeEmail: false,
    pathsalaInterest: false,
    volunteerInterest: false
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const interestOptions = [
    'Religious Events',
    'Community Service',
    'Cultural Programs',
    'Educational Activities',
    'Pathsala Teaching',
    'Event Planning',
    'Fundraising',
    'Youth Programs',
    'Senior Activities',
    'Wellness Programs'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        form.append(key, value.join(", "));
      } else {
        form.append(key, value.toString());
      }
    });

    fetch('https://script.google.com/macros/s/AKfycbywpX9zAQha4bTnmTBNksCafu6IAHe1U1oHgxWqlspDZHpZbl1oYB_v3UQCO9MKyKUaKQ/exec', {
      method: 'POST',
      mode: 'no-cors',
      body: form
    })
      .then(() => {
        setIsSubmitted(true);
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        alert("An error occurred. Please try again later.");
      });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <main>
          <div className="pt-16 min-h-screen flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="mb-6">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Joining!</h1>
                  <p className="text-lg text-gray-600 mb-6">
                    Your membership application has been successfully submitted.
                  </p>
                  <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-600">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">What's Next?</h2>
                    <p className="text-gray-700">
                      You will receive an invitation email to join our community within 1-2 days. 
                      Our membership committee will review your application and send you all the 
                      necessary information to get started.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/"
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Return to Home
                    </a>
                    <a
                      href="/events"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      View Events
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <main>
        <div className="pt-16">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Community</h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Become a member of JSSD and be part of our growing spiritual family
              </p>
            </div>
          </div>

          <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Membership Registration</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
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
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Family Information */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Family Information</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Family Members (Names and Ages)
                      </label>
                      <textarea
                        name="familyMembers"
                        value={formData.familyMembers}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Please list all family members with their names and ages..."
                      />
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Areas of Interest</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {interestOptions.map((interest) => (
                        <label key={interest} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.interests.includes(interest)}
                            onChange={() => handleInterestChange(interest)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-gray-700">{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Options</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="subscribeEmail"
                          checked={formData.subscribeEmail}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">
                          Subscribe to email updates and newsletters
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="pathsalaInterest"
                          checked={formData.pathsalaInterest}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">
                          Interested in enrolling children in Pathsala
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="volunteerInterest"
                          checked={formData.volunteerInterest}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700">
                          Interested in volunteering for community activities
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="submit"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors"
                    >
                      Submit Membership Application
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BecomeAMember;