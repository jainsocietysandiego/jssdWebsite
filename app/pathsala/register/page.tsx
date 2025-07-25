'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CheckCircle, Heart } from 'lucide-react';

// External endpoints
const LEVELS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyHVNzO5Wbr-OBUAD_KPKPazFsZWz4ak7LONoccChBmZnAmnINE6cUbcnmH_647G5urKw/exec';
const ZELLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzIHxb91BTRhLhjOr4an8hcgHBzjOOFWRDPiJgGMlfDEpxGA3yksX0RGjwqE3luzNNDlw/exec';
const SUBMIT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwI3rHapQJgBJg1vV-DX6qSAeeMFnhjqx1GmVulizdSIPMZoikv3Vl5KvL5qJbcshfr/exec';

// Helper for localStorage cache
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
    // Fallback: just fetch
    return await fetcher();
  }
};

const Skeleton = ({ height = 38, className = '' }) => (
  <div className={`bg-gray-200 rounded animate-pulse mb-2 ${className}`}
       style={{ height, marginBottom: 8 }} />
);

const PathshalaRegister: React.FC = () => {
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [addFees, setAddFees] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'zelle' | 'cheque' | null>(null);
  const [zelleQrUrl, setZelleQrUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Father & Mother contact split!
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

  // --- USER EXPERIENCE: Skeleton and Caching ---
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        // Levels with cache (~15 min)
        const levelsRes = await cacheFetch('jc_levels_cache', async () => {
          const res = await fetch(LEVELS_SCRIPT_URL);
          return (await res.json()).levels;
        });
        setLevels(levelsRes || []);

        // Zelle QR with cache (~1 hour)
        const qrRes = await cacheFetch('jc_zelleqr_cache', async () => {
          const res = await fetch(ZELLE_SCRIPT_URL);
          return (await res.json()).content;
        }, 60 * 60 * 1000);
        const zelleItem =
          (qrRes || []).find((i: any) => String(i.Section || '').toLowerCase() === 'zelle_qr');
        if (zelleItem && zelleItem.ImageURL) setZelleQrUrl(zelleItem.ImageURL);
      } catch (e) {
        // fallback: just show no data
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

  // Custom validation for unique emails/phones (father ≠ mother)
  const validateEmailsPhones = () => {
    if (
      !formData.fatherEmail || !formData.motherEmail ||
      !formData.fatherPhone || !formData.motherPhone
    ) return false;
    if (formData.fatherEmail === formData.motherEmail) return false;
    if (formData.fatherPhone === formData.motherPhone) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLevel) {
      alert('Please select a Pathshala level.');
      return;
    }
    if (!formData.studentName) {
      alert('Please fill Student Name');
      return;
    }
    if (!validateEmailsPhones()) {
      alert('Father and mother must have different email and phone numbers, and all must be filled.');
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

  // --- SKELETON LOADING UI ---
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
  // --- SUCCESS UI ---
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

  // --- MAIN FORM UI ---
  return (
    <div className="min-h-screen bg-orange-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8 space-y-10">
        <h1 className="text-3xl font-bold text-orange-700 text-center">Pathshala Registration</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Student Name</label>
              <input type="text" name="studentName" value={formData.studentName}
                onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Student Age</label>
              <input type="text" name="studentAge" value={formData.studentAge}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          {/* Father & Mother Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Father's Name</label>
              <input type="text" name="fatherName" value={formData.fatherName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Father's Email</label>
              <input type="email" name="fatherEmail" value={formData.fatherEmail}
                onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Father's Phone</label>
              <input type="tel" name="fatherPhone" value={formData.fatherPhone}
                onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mother's Name</label>
              <input type="text" name="motherName" value={formData.motherName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mother's Email</label>
              <input type="email" name="motherEmail" value={formData.motherEmail}
                onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mother's Phone</label>
              <input type="tel" name="motherPhone" value={formData.motherPhone}
                onChange={handleInputChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          {/* Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input type="text" name="address" value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input type="text" name="city" value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input type="text" name="state" value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ZIP Code</label>
              <input type="text" name="zipCode" value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          {/* Level Selection */}
          <div>
            <label className="block text-lg font-semibold mb-2">Select Pathshala Level</label>
            <select
              className="w-full border px-4 py-2 rounded-lg"
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
              <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                <b>Description:</b> {selectedPlan.Description || '-'}<br />
                <b>Fee:</b> ${selectedPlan.Fees}
              </div>
            )}
          </div>
          {/* 3% Fee Option + Total */}
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
          {/* Payment Method */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Choose Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['paypal', 'zelle', 'cheque'].map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`border rounded-lg p-4 text-center transition ${paymentMethod === method ? 'border-orange-600 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}
                  onClick={() => setPaymentMethod(method as any)}
                >
                  <div className="text-lg font-bold capitalize">{method}</div>
                </button>
              ))}
            </div>
            {paymentMethod === 'zelle' && (
              <div className="mt-4 border rounded p-4 bg-gray-50 text-center">
                <p className="font-medium text-gray-700">Scan the Zelle QR code:</p>
                {zelleQrUrl && (
                  <div className="relative w-[200px] h-[200px] mx-auto mt-2">
                    <Image src={zelleQrUrl} alt="Zelle QR" fill className="object-contain" />
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  or send to <strong>donate@yourdomain.org</strong>
                </p>
              </div>
            )}
            {paymentMethod === 'paypal' && (
              <div className="mt-4 border rounded p-4 bg-gray-50">
                <form action="https://www.sandbox.paypal.com/donate"
                  method="post" target="_blank">
                  <input type="hidden" name="business" value="your-paypal-email@example.com" />
                  <input type="hidden" name="currency_code" value="USD" />
                  <input type="hidden" name="amount" value={totalWithFee.toFixed(2)} />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded">
                    Pay with PayPal
                  </button>
                </form>
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
          </div>
          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded font-semibold text-lg flex items-center justify-center mt-6"
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
