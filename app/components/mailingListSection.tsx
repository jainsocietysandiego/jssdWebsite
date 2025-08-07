'use client';

import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const RECAPTCHA_SITE_KEY = "6LdGip0rAAAAAKsHaqNZGhLnKNCQjmqYqOnIWI9G"; // Your actual site key

const MailingListForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      alert("Please complete the CAPTCHA.");
      return;
    }

    setStatus('submitting');

    const body = new URLSearchParams();
    body.append('firstName', formData.firstName);
    body.append('lastName', formData.lastName);
    body.append('email', formData.email);

    try {
      await fetch('https://script.google.com/macros/s/AKfycbyBNKnyPDc36tAdOn_KIrONyOUzKgpx9Fud5IXyzUP6_mf6LEbU-OTHh0SqZYbCcrAqZQ/exec', {
        method: 'POST',
        body,
        mode: 'no-cors'
      });

      setStatus('success');
      setFormData({ firstName: '', lastName: '', email: '' });
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('success'); // Still mark as success due to no-cors
    }

    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setCaptchaToken(null);
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
            autoComplete="email"
          />
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500"
            autoComplete="given-name"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500"
            autoComplete="family-name"
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="bg-orange-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-orange-700 shadow-md"
          >
            {status === 'submitting' ? 'Submitting...' : 'Subscribe'}
          </button>
        </form>

        <div className="mt-4 flex justify-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={(token) => setCaptchaToken(token)}
            theme="light"
          />
        </div>

        {status === 'success' && (
          <p className="text-green-600 mt-4">
            🎉 Subscribed successfully! Please check your email to join the list. If you have already subscribed then you won't receive any email.
          </p>
        )}
      </div>
    </section>
  );
};

export default MailingListForm;
