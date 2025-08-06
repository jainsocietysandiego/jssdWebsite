'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CheckCircle, Heart } from 'lucide-react';

const FETCH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx33ldKE6dib3hJFA6xYw0ShWDzwV2hZNV-loY2l6SfOxqRGvvh9cgdPRmeufgdrWSrAw/exec';
const SUBMIT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxG4jWKMhoZIUQN6DYwh4KhXDEN1W1Al79dmLGC46rb8GZvBe_ZzprMJrUHAoS0kO9X/exec';

const CACHE_KEY = 'membership-data-cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

type PaymentMethod = 'paypal' | 'zelle' | 'cheque' | 'stock';

const Loading = () => (
  <div className="min-h-screen bg-brand-light flex items-center justify-center">
    <div className="text-center px-4">
      <div className="relative">
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8 relative">
          <div className="absolute inset-0 border-4 border-[rgba(234,88,12,0.1)] rounded-full"></div>
          <div className="absolute inset-1 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <div 
            className="absolute inset-2 border-4 border-brand-dark/30 border-r-transparent rounded-full"
            style={{
              animation: 'spin 1s linear infinite reverse'
            }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-accent rounded-full flex items-center justify-center animate-pulse">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full"></div>
          </div>
        </div>        
        <h3 className="text-lg md:text-xl font-semibold text-brand-dark mb-2">Jai Jinendra</h3>
        <p className="text-sm md:text-base text-accent animate-pulse">Ahimsa Parmo Dharma</p>
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>
    </div>
  </div>
);

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [zelleQrUrl, setZelleQrUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

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
        } catch {
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
        } catch {
          setLoading(false);
        }
      }
    };
    loadMembershipData();
  }, []);

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

  function getPaymentRefLabel(pm: PaymentMethod | null): string {
    switch (pm) {
      case 'zelle': return 'Zelle T Id';
      case 'cheque': return 'Cheque No';
      case 'stock': return 'Stock Transfer No';
      default: return '';
    }
  }

  const selectedPlan = membershipTypes.find(m => m.id === selectedMembership);
  const baseTotal = selectedPlan?.amount || 0;
  const totalWithFee = addFees ? baseTotal * 1.03 : baseTotal;

  // ---- FIXED TYPE-SAFE SUBMISSION LOGIC ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
      alert('Please select a membership type.');
      return;
    }
    if (paymentMethod === null) {
      alert('Please select a payment method.');
      return;
    }
    if ((paymentMethod === 'zelle' || paymentMethod === 'cheque' || paymentMethod === 'stock') && !paymentReference.trim()) {
      alert(`Please enter ${getPaymentRefLabel(paymentMethod)}.`);
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
    try {
      await fetch(SUBMIT_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setIsSubmitted(true);
    } catch {
      alert('Something went wrong. Please try again.');
    }
  };

  // ---- FIXED TYPE-SAFE CAN SUBMIT LOGIC ----
  const canSubmit =
    !!selectedPlan &&
    Object.entries(formData).every(
      ([k, v]) => typeof v === 'boolean' ? true : v !== ''
    ) &&
    paymentMethod !== null &&
    (
      paymentMethod === 'paypal' ||
      (paymentMethod === 'zelle' || paymentMethod === 'cheque' || paymentMethod === 'stock')
        ? paymentReference.trim() !== ''
        : true
    );

  if (loading) {
    return <Loading />;
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
  <div className="min-h-screen bg-white pt-[14vh] pb-10">
    {/* ───── HERO ───── */}
    <section className="relative flex items-center justify-center
                        h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden">
      <Image
        src="/images/hero-banner.jpg"
        alt="Membership Registration"
        fill
        priority
        quality={85}
        className="object-cover"
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <h1 className="font-bold text-brand-light text-3xl sm:text-4xl md:text-5xl
                       ">
          Membership Registration
        </h1>
      </div>
    </section>

    <div className="max-w-5xl mx-auto bg-brand-white rounded-xl shadow-xl p-6 md:p-8 space-y-8 border-4 border-[#FFF7ED] sm:mt-10 relative z-10">
       {/* Membership Types */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-brand-dark mb-4">Choose a Membership Plan</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {membershipTypes.map(type => (
            <label
              key={type.id}
              className={`p-4 rounded-xl border-soft transition-all cursor-pointer ${
                selectedMembership === type.id
                  ? 'bg-brand-light border-accent'
                  : 'border-accent/20 hover:border-accent/40'
              } ${type.highlight ? 'bg-yellow-50 border-yellow-400' : ''}`}
            >
              <input
                type="radio"
                name="membershipType"
                className="mr-2 accent-accent"
                checked={selectedMembership === type.id}
                onChange={() => setSelectedMembership(type.id)}
              />
              <span className="font-semibold text-brand-dark">{type.name}</span>
              <div className="text-sm text-brand-dark/70 mt-1 text-justify">{type.description}</div>
              <div className="text-accent font-bold mt-1">${type.amount.toFixed(2)}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Optional 3% */}
      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
        <label className="flex items-start space-x-2">
          <input
            type="checkbox"
            checked={addFees}
            onChange={() => setAddFees(!addFees)}
            className="mt-1 accent-accent"
          />
          <span className="text-red-600 font-medium text-sm md:text-base text-justify">
            We pay ~3% in fees for online payments. Consider covering that cost so 100% of your contribution supports the community.
          </span>
        </label>
        <div className="text-right font-semibold mt-2 text-brand-dark">
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
              <label className="block text-sm font-medium mb-1 text-brand-dark">{label}</label>
              <input
                type="text"
                name={name}
                value={(formData as any)[name]}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
              />
            </div>
          ))}
        </div>

        {/* Family Members */}
        <div>
          <label className="block text-sm font-medium mb-1 text-brand-dark">Family Members (Names & Ages)</label>
          <textarea
            name="familyMembers"
            rows={3}
            className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300 resize-none"
            value={formData.familyMembers}
            onChange={handleInputChange}
          />
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-brand-dark">Choose Payment Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['paypal', 'zelle', 'cheque', 'stock'] as PaymentMethod[]).map((method) => (
              <button
                key={method}
                type="button"
                className={`border-soft rounded-xl p-4 text-center transition-all ${
                  paymentMethod === method
                    ? 'border-accent bg-brand-light'
                    : 'border-accent/20 hover:border-accent/40'
                }`}
                onClick={() => {
                  setPaymentMethod(method);
                  setPaymentReference('');
                }}
              >
                <div className="text-sm md:text-base font-bold capitalize text-brand-dark">{method}</div>
              </button>
            ))}
          </div>

          {/* Reference Field */}
          {paymentMethod && (
            <div className="mt-4">
              {paymentMethod === 'paypal' ? (
                <div className="text-brand-dark/70 text-sm md:text-base">No additional information needed for Paypal.</div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1 text-brand-dark">
                    {getPaymentRefLabel(paymentMethod)} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={e => setPaymentReference(e.target.value)}
                    required={paymentMethod === 'zelle' || paymentMethod === 'cheque' || paymentMethod === 'stock'}
                    className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark bg-brand-light focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
                    placeholder={`Enter ${getPaymentRefLabel(paymentMethod)}`}
                  />
                </div>
              )}
            </div>
          )}

          {/* Payment method-specific info */}
          {paymentMethod === 'paypal' && (
            <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light">
              <form
                action="https://www.paypal.com/donate"
                method="post"
                target="_blank"
              >
                <input type="hidden" name="business" value="donate@yourdomain.org" />
                <input type="hidden" name="currency_code" value="USD" />
                <input type="hidden" name="amount" value={totalWithFee.toFixed(2)} />
                <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-xl transition-colors">
                  Pay with PayPal
                </button>
              </form>
            </div>
          )}

          {paymentMethod === 'zelle' && (
            <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light text-center">
              <p className="font-medium text-brand-dark">Scan the Zelle QR code:</p>
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
              <p className="text-sm text-brand-dark/70 mt-2">
                or send to <strong>donate@yourdomain.org</strong>
              </p>
            </div>
          )}

          {paymentMethod === 'cheque' && (
            <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light">
              <p className="text-brand-dark mb-2">Mail your cheque to:</p>
              <p className="mt-2 font-medium text-brand-dark">
                Jain Center<br />1234 Jain Street<br />Your City, State ZIP
              </p>
            </div>
          )}

          {paymentMethod === 'stock' && (
            <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light">
              <p className="text-brand-dark text-justify">
                Please enter your Stock Transfer No above after completing your stock donation. For transfer instructions, contact{' '}
                <a href="mailto:donate@yourdomain.org" className="underline text-accent">donate@yourdomain.org</a>.
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full btn-primary text-lg py-4 flex items-center justify-center
            ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Heart className="h-5 w-5 mr-2" />
          Confirm Details
        </button>
      </form>
    </div>
  </div>
);
}

export default MembershipPage;
