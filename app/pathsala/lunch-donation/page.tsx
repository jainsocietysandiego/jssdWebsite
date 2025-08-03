'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, Heart } from 'lucide-react';

const SUBMIT_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbx_NqV0nsolC6iX8o3pUZBJaJrdMeXJWBSAJKwQzPjS_sJ0GFBTOr87xSOQTky9gx86/exec';

const LunchDonationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    interests: [] as string[],
    subscribeEmail: false,
    pathsalaInterest: false,
    volunteerInterest: false,
  });

  const [children, setChildren] = useState<{ fullName: string; age: string }[]>([]);

  const [addFees, setAddFees] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'zelle' | 'cheque' | null>(null);
  const [zelleQrUrl, setZelleQrUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Set your QR code URL here if needed
  // Example: setZelleQrUrl('your-zelle-qr-code-url-here');

  // For total amount, since no membership type, use a fixed or user-input value here.
  // For demonstration, let's set a fixed donation amount of $50.
  const baseTotal = 50;
  const totalWithFee = addFees ? baseTotal * 1.03 : baseTotal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, type, value, checked } = target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleInterestChange = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleChildChange = (
    index: number,
    field: 'fullName' | 'age',
    value: string
  ) => {
    setChildren((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addChild = () => {
    setChildren((prev) => [...prev, { fullName: '', age: '' }]);
  };

  const removeChild = (index: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      alert('Please enter your full name.');
      return;
    }

    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (!child.fullName.trim()) {
        alert(`Please enter full name for child #${index + 1}.`);
        return;
      }
      if (!child.age.trim()) {
        alert(`Please enter age for child #${index + 1}.`);
        return;
      }
    }

    const payload = {
      timestamp: new Date().toISOString(),
      ...formData,
      children: children.map((c) => `Name: ${c.fullName}, Age: ${c.age}`).join('; '),
      interests: formData.interests.join(', '),
      baseTotal,
      add3Percent: addFees,
      finalTotal: totalWithFee.toFixed(2),
      paymentMethod,
    };

    try {
      await fetch(SUBMIT_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-lg w-full">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Joining!</h1>
          <p className="text-gray-700 mb-4">Your registration has been submitted successfully.</p>
          <p className="text-gray-600">You will receive a confirmation email soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pt-16">
      <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white h-48 sm:h-52 md:h-56 lg:h-60 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold">Lunch Donation Registration</h1>
        </div>
      </section>
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl p-8 space-y-10">
        {/* Optional 3% fee section */}
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={addFees}
              onChange={() => setAddFees(!addFees)}
              className="mt-1"
            />
            <span className="text-red-600 font-medium">
              We pay ~3% in fees for online payments. Consider covering that cost so 100% of your
              contribution supports the community.
            </span>
          </label>
          <div className="text-right font-semibold mt-2 text-gray-700">
            Total: <span className="text-red-600">${totalWithFee.toFixed(2)}</span>
          </div>
        </div>

        {/* Personal Info Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'fullName', label: 'Full Name' },
              { name: 'email', label: 'Email' },
              { name: 'phone', label: 'Phone' },
              { name: 'address', label: 'Address' },
              { name: 'city', label: 'City' },
              { name: 'state', label: 'State' },
              { name: 'zipCode', label: 'ZIP Code' },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  type="text"
                  name={name}
                  value={(formData as any)[name]}
                  onChange={handleInputChange}
                  required={name === 'fullName' || name === 'email' || name === 'phone'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>

          {/* Add Child Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Children</h2>
            <button
              type="button"
              onClick={addChild}
              className="mb-4 inline-block bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
            >
              Add Child
            </button>

            {children.length === 0 && (
              <p className="text-sm text-gray-600">No children added yet.</p>
            )}

            {children.map((child, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4 border p-4 rounded bg-yellow-50"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Child Full Name</label>
                  <input
                    type="text"
                    value={child.fullName}
                    onChange={(e) => handleChildChange(idx, 'fullName', e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Child Age</label>
                  <input
                    type="text"
                    value={child.age}
                    onChange={(e) => handleChildChange(idx, 'age', e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeChild(idx)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Choose Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['paypal', 'zelle', 'cheque'].map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`border rounded-lg p-4 text-center transition ${
                    paymentMethod === method
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  onClick={() => setPaymentMethod(method as any)}
                >
                  <div className="text-lg font-bold capitalize">{method}</div>
                </button>
              ))}
            </div>

            {paymentMethod === 'paypal' && (
              <div className="mt-4 border rounded p-4 bg-gray-50">
                <form action="https://www.paypal.com/donate" method="post" target="_blank">
                  <input type="hidden" name="business" value="donate@yourdomain.org" />
                  <input type="hidden" name="currency_code" value="USD" />
                  <input type="hidden" name="amount" value={totalWithFee.toFixed(2)} />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded">
                    Pay with PayPal
                  </button>
                </form>
              </div>
            )}

            {paymentMethod === 'zelle' && (
              <div className="mt-4 border rounded p-4 bg-gray-50 text-center">
                <p className="font-medium text-gray-700">Scan the Zelle QR code:</p>
                {zelleQrUrl ? (
                  <div className="relative w-[200px] h-[200px] mx-auto mt-2">
                    <Image src={zelleQrUrl} alt="Zelle QR" fill className="object-contain" />
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2">Zelle QR code not available.</p>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  or send to <strong>donate@yourdomain.org</strong>
                </p>
              </div>
            )}

            {paymentMethod === 'cheque' && (
              <div className="mt-4 border rounded p-4 bg-gray-50">
                <p>Mail your cheque to:</p>
                <p className="mt-2 font-medium text-gray-700">
                  Jain Center
                  <br />
                  1234 Jain Street
                  <br />
                  Your City, State ZIP
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded font-semibold text-lg flex items-center justify-center"
          >
            <Heart className="h-5 w-5 mr-2" />
            Submit Form
          </button>
        </form>
      </div>
    </div>
  );
};

export default LunchDonationPage;
