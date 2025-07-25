'use client'

import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle, Quote } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Feedback: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'general',
    rating: 0,
    message: '',
    anonymous: false
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    { id: 'general', name: 'General Feedback' },
    { id: 'events', name: 'Events & Programs' },
    { id: 'pathsala', name: 'Pathsala Education' },
    { id: 'facilities', name: 'Facilities & Services' },
    { id: 'leadership', name: 'Leadership & Management' },
    { id: 'suggestion', name: 'Suggestions & Ideas' }
  ];

  const testimonials = [
    {
      name: 'Priya Patel',
      text: 'JSSD has been a spiritual home for our family. The Pathsala program has given our children a strong foundation in Jain values.',
      rating: 5,
      category: 'Pathsala Education'
    },
    {
      name: 'Rajesh Shah',
      text: 'The community events are beautifully organized and bring everyone together. I especially love the Paryushan celebrations.',
      rating: 5,
      category: 'Events & Programs'
    },
    {
      name: 'Dr. Meera Jain',
      text: 'The leadership team is dedicated and responsive. They have created a welcoming environment for all age groups.',
      rating: 5,
      category: 'Leadership & Management'
    },
    {
      name: 'Amit Kothari',
      text: 'The facilities are well-maintained and provide a peaceful environment for prayer and meditation.',
      rating: 4,
      category: 'Facilities & Services'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating: rating
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback submitted:', formData);
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      category: 'general',
      rating: 0,
      message: '',
      anonymous: false
    });
    setHoverRating(0);
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      <main>
        <div className="pt-16">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Share Your Feedback</h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Your thoughts and suggestions help us improve and serve our community better
              </p>
            </div>
          </div>

          <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Feedback Form */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                  {!isSubmitted ? (
                    <>
                      <div className="flex items-center mb-6">
                        <MessageSquare className="h-6 w-6 text-orange-600 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900">Submit Feedback</h2>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name {!formData.anonymous && '*'}
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required={!formData.anonymous}
                              disabled={formData.anonymous}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address {!formData.anonymous && '*'}
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required={!formData.anonymous}
                              disabled={formData.anonymous}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number (Optional)
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={formData.anonymous}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Feedback Category *
                          </label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Overall Rating *
                          </label>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => handleRatingClick(rating)}
                                onMouseEnter={() => setHoverRating(rating)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`h-8 w-8 ${
                                    rating <= (hoverRating || formData.rating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  } transition-colors`}
                                />
                              </button>
                            ))}
                            <span className="ml-3 text-gray-600">
                              {formData.rating > 0 && `${formData.rating} star${formData.rating > 1 ? 's' : ''}`}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Message *
                          </label>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Please share your thoughts, suggestions, or feedback..."
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="anonymous"
                            id="anonymous"
                            checked={formData.anonymous}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                            Submit feedback anonymously
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                        >
                          Submit Feedback
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
                      <p className="text-gray-600 mb-6">
                        Your feedback has been submitted successfully. We appreciate your input and 
                        will use it to improve our services.
                      </p>
                      <button
                        onClick={resetForm}
                        className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                      >
                        Submit Another Feedback
                      </button>
                    </div>
                  )}
                </div>

                {/* Testimonials */}
                <div>
                  <div className="flex items-center mb-6">
                    <Quote className="h-6 w-6 text-orange-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Community Testimonials</h2>
                  </div>

                  <div className="space-y-6">
                    {testimonials.map((testimonial, index) => (
                      <div key={index} className="bg-orange-50 rounded-lg p-6 border-l-4 border-orange-600">
                        <div className="flex items-center mb-3">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">{testimonial.category}</span>
                        </div>
                        <p className="text-gray-700 mb-3 italic">"{testimonial.text}"</p>
                        <p className="text-sm font-medium text-gray-900">- {testimonial.name}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Help Us Improve</h3>
                    <p className="text-orange-100">
                      Your feedback is invaluable to us. Whether it's praise, suggestions, or constructive criticism, 
                      we welcome all forms of input that help us serve our community better.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-600">
                  Common questions about our feedback process
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How long does it take to respond to feedback?
                  </h3>
                  <p className="text-gray-600">
                    We aim to respond to all feedback within 3-5 business days. For urgent matters, 
                    please contact us directly at (555) 123-4567.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Can I submit feedback anonymously?
                  </h3>
                  <p className="text-gray-600">
                    Yes, you can choose to submit feedback anonymously. However, providing your contact 
                    information helps us follow up if we need clarification or want to update you on actions taken.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What happens to my feedback?
                  </h3>
                  <p className="text-gray-600">
                    All feedback is reviewed by our leadership team. We use your input to improve our services, 
                    plan future programs, and address any concerns. You'll receive a response acknowledging your feedback.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Can I make suggestions for new programs or events?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely! We encourage community members to suggest new programs, events, or initiatives. 
                    Select "Suggestions & Ideas" as your feedback category and share your ideas with us.
                  </p>
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

export default Feedback;