'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CheckCircle, Heart } from 'lucide-react';

const FETCH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx33ldKE6dib3hJFA6xYw0ShWDzwV2hZNV-loY2l6SfOxqRGvvh9cgdPRmeufgdrWSrAw/exec';
const SUBMIT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxG4jWKMhoZIUQN6DYwh4KhXDEN1W1Al79dmLGC46rb8GZvBe_ZzprMJrUHAoS0kO9X/exec';

const CACHE_KEY = 'membership-data-cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const MembershipPage: React.FC = () => {
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
    volunteerInterest: false,
  });

  const [membershipTypes, setMembershipTypes] = useState<any[]>([]);
  const [selectedMembership, setSelectedMembership] = useState<string>('');
  const [addFees, setAddFees] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'zelle' | 'cheque' | 'stock' | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [zelleQrUrl, setZelleQrUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  console.log(paymentReference);

  // Fetch + cache membership data on mount
  useEffect(() => {
    const loadMembershipData = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      let shouldFetch = true;

      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setMembershipTypes(cachedData.membershipTypes);
            setZelleQrUrl(cachedData.zelleQrUrl);
            setLoading(false);
            shouldFetch = false;
          }
        } catch (err) {
          localStorage.removeItem(CACHE_KEY);
        }
      }

      if (shouldFetch) {
        try {
          const res = await fetch(FETCH_SCRIPT_URL);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const json = await res.json();

          const memberships = json.content.filter((item: any) => item.Section === 'membership_type');
          const qr = json.content.find((item: any) => item.Section === 'zelle_qr');

          const transformedData = {
            membershipTypes: memberships.map((item: any) => ({
              id: item.ID,
              name: item.Name,
              amount: Number(item.Amount),
              description: item.Description,
              highlight: item.Highlight === 'TRUE',
            })),
            zelleQrUrl: qr?.ImageURL || '',
          };

          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: transformedData, timestamp: Date.now() }));

          setMembershipTypes(transformedData.membershipTypes);
          setZelleQrUrl(transformedData.zelleQrUrl);
          setLoading(false);
        } catch (err) {
          setLoading(false);
        }
      }
    };
    loadMembershipData();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, type, value, checked } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  // Payment Reference label logic
  const getPaymentRefLabel = () => {
    if (paymentMethod === 'zelle') return 'Zelle T Id';
    if (paymentMethod === 'cheque') return 'Cheque No';
    if (paymentMethod === 'stock') return 'Stock Transfer No';
    return '';
  };

  // Plan & amount logic
  const selectedPlan = membershipTypes.find(m => m.id === selectedMembership);
  const baseTotal = selectedPlan?.amount || 0;
  const totalWithFee = addFees ? baseTotal * 1.03 : baseTotal;

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
      alert('Please select a membership type.');
      return;
    }
    if (!paymentMethod) {
      alert('Please select a payment method.');
      return;
    }
    if (
      paymentMethod !== 'paypal' &&
      !paymentReference.trim()
    ) {
      alert(`Please enter ${getPaymentRefLabel()}.`);
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      ...formData,
      interests: formData.interests.join(', '),
      selectedMembership: selectedPlan.name,
      baseTotal,
      add3Percent: addFees,
      finalTotal: totalWithFee.toFixed(2),
      paymentMethod,
      paymentReference,
    };
    console.log('Submitting payload:', payload);

    try {
      await fetch(SUBMIT_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setIsSubmitted(true);
    } catch (error) {
      alert('Something went wrong. Please try again.');
    }
  };

  // Validation for enabling the submit button:
  const canSubmit =
    selectedPlan &&
    Object.entries(formData).every(([k, v]) =>
      typeof v === 'boolean' ? true : v !== ''
    ) &&
    paymentMethod &&
    (paymentMethod === 'paypal' || paymentReference.trim() !== '');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-lg w-full">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Joining!</h1>
          <p className="text-gray-700 mb-4">Your membership registration has been submitted successfully.</p>
          <p className="text-gray-600">You will receive a confirmation email soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pt-16">
      <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white h-48 sm:h-52 md:h-56 lg:h-60 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold">Membership Registration</h1>
        </div>
      </section>
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl p-8 space-y-10">
        {/* Membership Types */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Choose a Membership Plan</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {membershipTypes.map(type => (
              <label
                key={type.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedMembership === type.id
                    ? 'bg-orange-50 border-orange-500'
                    : 'border-gray-200 hover:border-orange-300'
                } ${type.highlight ? 'bg-yellow-50 border-yellow-400' : ''}`}
              >
                <input
                  type="radio"
                  name="membershipType"
                  className="mr-2"
                  checked={selectedMembership === type.id}
                  onChange={() => setSelectedMembership(type.id)}
                />
                <span className="font-semibold">{type.name}</span>
                <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                <div className="text-orange-600 font-bold mt-1">${type.amount.toFixed(2)}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Optional 3% */}
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={addFees}
              onChange={() => setAddFees(!addFees)}
              className="mt-1"
            />
            <span className="text-red-600 font-medium">
              We pay ~3% in fees for online payments. Consider covering that cost so 100% of your contribution supports the community.
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
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>

          {/* Family Members */}
          <div>
            <label className="block text-sm font-medium mb-1">Family Members (Names & Ages)</label>
            <textarea
              name="familyMembers"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              value={formData.familyMembers}
              onChange={handleInputChange}
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium mb-2">Areas of Interest</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'Religious Events', 'Community Service', 'Cultural Programs',
                'Educational Activities', 'Pathsala Teaching', 'Event Planning',
                'Fundraising', 'Youth Programs', 'Senior Activities', 'Wellness Programs',
              ].map((interest) => (
                <label key={interest} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleInterestChange(interest)}
                    className="mr-2"
                  />
                  <span>{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Choose Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['paypal', 'zelle', 'cheque', 'stock'].map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`border rounded-lg p-4 text-center transition ${
                    paymentMethod === method
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  onClick={() => {
                    setPaymentMethod(method as any);
                    setPaymentReference(''); // Reset when changing method
                  }}
                >
                  <div className="text-lg font-bold capitalize">{method}</div>
                </button>
              ))}
            </div>

            {/* Conditional Reference Field */}
            {paymentMethod && (
              <div className="mt-4">
                {paymentMethod === 'paypal' ? (
                  <div className="text-gray-600">No additional information needed for Paypal.</div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1">{getPaymentRefLabel()} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={e => setPaymentReference(e.target.value)}
                      required={paymentMethod !== 'paypal'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder={`Enter ${getPaymentRefLabel()}`}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Payment method-specific info */}
            {paymentMethod === 'paypal' && (
              <div className="mt-4 border rounded p-4 bg-gray-50">
                <form
                  action="https://www.paypal.com/donate"
                  method="post"
                  target="_blank"
                >
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
                {zelleQrUrl && (
                  <div className="relative w-[200px] h-[200px] mx-auto mt-2">
                    <Image
                      src={zelleQrUrl}
                      alt="Zelle QR"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-2">or send to <strong>donate@yourdomain.org</strong></p>
              </div>
            )}

            {paymentMethod === 'cheque' && (
              <div className="mt-4 border rounded p-4 bg-gray-50">
                <p>Mail your cheque to:</p>
                <p className="mt-2 font-medium text-gray-700">
                    Jain Center<br />1234 Jain Street<br />Your City, State ZIP
                </p>
              </div>
            )}

            {paymentMethod === 'stock' && (
              <div className="mt-4 border rounded p-4 bg-gray-50">
                <p>
                  Please enter your Stock Transfer No above after completing your stock donation. For transfer instructions, contact <a href="mailto:donate@yourdomain.org" className="underline text-orange-700">donate@yourdomain.org</a>.
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded font-semibold text-lg flex items-center justify-center
              ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className="h-5 w-5 mr-2" />
            Confirm Details
          </button>
        </form>
      </div>
    </div>
  );
};

export default MembershipPage;
