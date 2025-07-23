'use client';
// MailingListForm.tsx
import React, { useState } from 'react';

const MailingListForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    fetch('https://script.google.com/macros/s/AKfycby-eBSyd_f7PnB8eOWGLVZTFVkOtKwn34R9qqeTzy-_ZFK2L0KugF9pV2iTN-Eu-aGGVw/exec', {
      method: 'POST',
      body: JSON.stringify(formData),
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(() => {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', email: '' });
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        setStatus('error');
        alert("An error occurred. Please try again later.");
      });
  };

  return (
    <section className="bg-orange-50 py-16 px-4 rounded-xl shadow-lg">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Join our Mailing List</h2>
        <p className="text-gray-600 mb-8">
          Join the Jain Center mailing list to receive updates on local events, ongoing activities, spiritual sayings, and news.
        </p>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="bg-orange-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-orange-700 shadow-md"
          >
            {status === 'submitting' ? 'Submitting...' : 'Subscribe'}
          </button>
        </form>
        {status === 'success' && <p className="text-green-600 mt-4">🎉 Subscribed successfully!</p>}
        {status === 'error' && <p className="text-red-600 mt-4">⚠️ Something went wrong. Try again.</p>}
      </div>
    </section>
  );
};

export default MailingListForm;
