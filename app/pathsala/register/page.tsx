'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CheckCircle, Heart } from 'lucide-react';

// Endpoints
const LEVELS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyHVNzO5Wbr-OBUAD_KPKPazFsZWz4ak7LONoccChBmZnAmnINE6cUbcnmH_647G5urKw/exec';
const ZELLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzIHxb91BTRhLhjOr4an8hcgHBzjOOFWRDPiJgGMlfDEpxGA3yksX0RGjwqE3luzNNDlw/exec';
const SUBMIT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwmQV4RCUlqxdsjAmSHjHBT-k16BhnC9IZwPhSrwpbrSmIvfjNCXD1QNrUZpoNdlN7r/exec';

const cacheFetch = async (key: string, fetcher: () => Promise<any>, maxAgeMs = 15 * 60 * 1000) => {
  const now = Date.now();
  try {
    const cachedRaw = localStorage.getItem(key);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (now - cached.timestamp < maxAgeMs) return cached.data;
    }
    const data = await fetcher();
    localStorage.setItem(key, JSON.stringify({ timestamp: now, data }));
    return data;
  } catch {
    return await fetcher();
  }
};

const Skeleton = ({ height = 38, className = '' }) => (
  <div className={`bg-gray-200 rounded animate-pulse mb-2 ${className}`} style={{ height, marginBottom: 8 }} />
);

type PaymentMethod = 'paypal' | 'zelle' | 'cheque' | 'stock' | null;

const PathshalaRegister: React.FC = () => {
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [addFees, setAddFees] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [zelleQrUrl, setZelleQrUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    studentName: '',
    studentAge: '',
    fatherName: '',
    fatherEmail: '',
    fatherPhone: '',
    motherName: '',
    motherEmail: '',
    motherPhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const levelsRes = await cacheFetch('jc_levels_cache', async () => {
          const res = await fetch(LEVELS_SCRIPT_URL);
          return (await res.json()).levels;
        });
        setLevels(levelsRes || []);
        const qrRes = await cacheFetch('jc_zelleqr_cache', async () => {
          const res = await fetch(ZELLE_SCRIPT_URL);
          return (await res.json()).content;
        }, 60 * 60 * 1000);
        const zelleItem = (qrRes || []).find((i: any) => String(i.Section || '').toLowerCase() === 'zelle_qr');
        if (zelleItem && zelleItem.ImageURL) setZelleQrUrl(zelleItem.ImageURL);
      } catch (e) {
        setLevels([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const selectedPlan = levels.find(lvl => String(lvl.Level) === String(selectedLevel));
  const baseTotal = selectedPlan?.Fees ? Number(selectedPlan.Fees) : 0;
  const totalWithFee = addFees ? Math.round(baseTotal * 1.03 * 100) / 100 : baseTotal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Instead of requiring both, just require at least one parent contact
  const hasParentContact =
    !!formData.fatherEmail.trim() || !!formData.fatherPhone.trim() ||
    !!formData.motherEmail.trim() || !!formData.motherPhone.trim();

  // Payment reference label per method
  function getPaymentRefLabel(pm: PaymentMethod): string {
    switch (pm) {
      case 'zelle': return 'Zelle T Id';
      case 'cheque': return 'Cheque No';
      case 'stock': return 'Stock Transfer No';
      default: return '';
    }
  }

  // Only essential fields for canSubmit
  const canSubmit =
    !!formData.studentName.trim() &&
    !!selectedLevel &&
    hasParentContact &&
    paymentMethod !== null &&
    (
      paymentMethod === 'paypal' ||
      (['zelle', 'cheque', 'stock'].includes(paymentMethod || '') ? paymentReference.trim() !== '' : true)
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentName.trim()) {
      alert('Student Name is required.');
      return;
    }
    if (!selectedLevel) {
      alert('Please select a Pathshala level.');
      return;
    }
    if (!hasParentContact) {
      alert('Please provide at least one parent email or phone.');
      return;
    }
    if (paymentMethod === null) {
      alert('Please select a payment method.');
      return;
    }
    if (
      (paymentMethod === 'zelle' || paymentMethod === 'cheque' || paymentMethod === 'stock') &&
      !paymentReference.trim()
    ) {
      alert(`Please enter ${getPaymentRefLabel(paymentMethod)}.`);
      return;
    }
    const payload = {
      timestamp: new Date().toISOString(),
      ...formData,
      selectedLevel: selectedLevel,
      levelTitle: selectedPlan?.Title,
      levelDescription: selectedPlan?.Description,
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
    } catch (e) {
      alert('Submission failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 space-y-3 w-full max-w-2xl">
          <Skeleton height={28} className="w-2/3 mx-auto" />
          <Skeleton height={36} className="w-1/2" />
          <Skeleton height={36} className="w-1/2" />
          <Skeleton height={36} className="w-full" />
          <Skeleton height={36} className="w-3/4" />
          <Skeleton height={32} className="w-full" />
          <Skeleton height={44} className="w-1/2" />
          <Skeleton height={56} className="w-full" />
        </div>
      </div>
    );
  }
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-lg w-full">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Registering!</h1>
          <p className="text-gray-700 mb-4">Your Pathshala registration has been submitted successfully.</p>
          <p className="text-gray-600">You will receive a confirmation email soon.</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-brand-light pt-[14vh] pb-16">
    {/* ───── HERO ───── */}
    <section className="relative flex items-center justify-center
                        h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden">
      <Image
        src="/images/hero-banner.jpg"
        alt="Pathshala Registration"
        fill
        priority
        quality={85}
        className="object-cover"
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <h1 className="font-bold text-brand-light text-3xl sm:text-4xl md:text-5xl
                       ">
          Pathshala Registration
        </h1>
      </div>
    </section>

    <div className="max-w-5xl mx-auto bg-brand-white rounded-xl shadow-soft p-6 md:p-8 space-y-8 -mt-8 relative z-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-brand-dark">
              Student Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="studentName" 
              value={formData.studentName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-brand-dark">Student Age</label>
            <input 
              type="text" 
              name="studentAge" 
              value={formData.studentAge}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300" 
            />
          </div>
        </div>

        {/* Father & Mother Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-brand-dark">Father's Name</label>
            <input 
              type="text" 
              name="fatherName" 
              value={formData.fatherName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-brand-dark">Father's Email</label>
            <input 
              type="email" 
              name="fatherEmail" 
              value={formData.fatherEmail}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-brand-dark">Father's Phone</label>
            <input 
              type="tel" 
              name="fatherPhone" 
              value={formData.fatherPhone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-brand-dark">Mother's Name</label>
            <input 
              type="text" 
              name="motherName" 
              value={formData.motherName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-brand-dark">Mother's Email</label>
            <input 
              type="email" 
              name="motherEmail" 
              value={formData.motherEmail}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-brand-dark">Mother's Phone</label>
            <input 
              type="tel" 
              name="motherPhone" 
              value={formData.motherPhone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300" 
            />
          </div>
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-brand-dark">Address</label>
            <input 
              type="text" 
              name="address" 
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-brand-dark">City</label>
            <input 
              type="text" 
              name="city" 
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-brand-dark">State</label>
            <input 
              type="text" 
              name="state" 
              value={formData.state}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-brand-dark">ZIP Code</label>
            <input 
              type="text" 
              name="zipCode" 
              value={formData.zipCode}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300" 
            />
          </div>
        </div>

        {/* Level Selection */}
        <div>
          <label className="block text-lg font-semibold mb-2 text-brand-dark">
            Select Pathshala Level <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border-soft px-4 py-3 rounded-xl text-sm md:text-base text-brand-dark  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            required
          >
            <option value="">-- Select a Level --</option>
            {levels.map(lvl => (
              <option key={lvl.Level} value={lvl.Level}>{lvl.Level}</option>
            ))}
          </select>
          {selectedPlan && (
            <div className="mt-2 text-sm text-brand-dark bg-brand-light p-3 rounded-xl border-soft">
              <b>Description:</b> {selectedPlan.Description || '-'}<br />
              <b>Fee:</b> ${selectedPlan.Fees}
            </div>
          )}
        </div>

        {/* 3% Fee Option + Total */}
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

        {/* Payment Method + Reference */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-brand-dark">
            Choose Payment Method <span className="text-red-500">*</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['paypal', 'zelle', 'cheque', 'stock'].map((method) => (
              <button
                key={method}
                type="button"
                className={`border-soft rounded-xl p-4 text-center transition-all ${
                  paymentMethod === method 
                    ? 'border-accent bg-brand-light' 
                    : 'border-accent/20 hover:border-accent/40'
                }`}
                onClick={() => {
                  setPaymentMethod(method as PaymentMethod);
                  setPaymentReference('');
                }}
              >
                <div className="text-sm md:text-base font-bold capitalize text-brand-dark">{method}</div>
              </button>
            ))}
          </div>

          {paymentMethod && paymentMethod !== 'paypal' && (
            <div className="mt-4">
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

          {/* Payment details */}
          {paymentMethod === 'zelle' && (
            <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light text-center">
              <p className="font-medium text-brand-dark">Scan the Zelle QR code:</p>
              {zelleQrUrl && (
                <div className="relative w-[200px] h-[200px] mx-auto mt-2">
                  <Image src={zelleQrUrl} alt="Zelle QR" fill className="object-contain" />
                </div>
              )}
              <p className="text-sm text-brand-dark/70 mt-2">
                or send to <strong>donate@yourdomain.org</strong>
              </p>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light">
              <form action="https://www.sandbox.paypal.com/donate"
                method="post" target="_blank">
                <input type="hidden" name="business" value="your-paypal-email@example.com" />
                <input type="hidden" name="currency_code" value="USD" />
                <input type="hidden" name="amount" value={totalWithFee.toFixed(2)} />
                <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-xl transition-colors">
                  Pay with PayPal
                </button>
              </form>
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
          className={`w-full btn-primary text-lg py-4 flex items-center justify-center mt-6
            ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Heart className="h-5 w-5 mr-2" />
          Submit Pathshala Registration
        </button>
      </form>
    </div>
  </div>
);

};

export default PathshalaRegister;
