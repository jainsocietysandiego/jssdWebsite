'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CreditCard, DollarSign, Mail, TrendingUp, Heart, CheckCircle } from 'lucide-react';

// Endpoints
const ZELLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzIHxb91BTRhLhjOr4an8hcgHBzjOOFWRDPiJgGMlfDEpxGA3yksX0RGjwqE3luzNNDlw/exec';
const SUBMIT_API_URL = 'https://script.google.com/macros/s/AKfycbzWIqCs1aQm3u6w9_JNHQ1LNa7DFFhkzORarM7NNXh6OJ0z-8eLe_xbyydz7JRE1L_6-w/exec'; // <--- Replace with your Apps Script deployed endpoint
const LUNCH_DONATION_BASE_FEE = 50;

const stockInstructions = {
  brokerage: "Charles Schwab & Co.",
  accountName: "Jain Center of America",
  accountNumber: "XXXX-XXXX-XXXX",
  dtc: "0164"
};

type PaymentMethod = 'paypal' | 'zelle' | 'cheque' | 'stock';

interface ChildInfo {
  fullName: string;
  age: string;
}

const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: ''
};

// Fetch/caching for the Zelle QR (matches registration page)
const cacheFetch = async (key: string, fetcher: () => Promise<any>, maxAgeMs = 60*60*1000) => {
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

export default function LunchDonationPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [addFees, setAddFees] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [zelleQrUrl, setZelleQrUrl] = useState('');

  // Fetch Zelle QR code (caches 1 hour)
  useEffect(() => {
    async function fetchQr() {
      try {
        const qrRes = await cacheFetch('jc_zelleqr_cache', async () => {
          const res = await fetch(ZELLE_SCRIPT_URL);
          return (await res.json()).content;
        }, 60 * 60 * 1000);
        const zelleItem = (qrRes || []).find((i: any) => String(i.Section || '').toLowerCase() === 'zelle_qr');
        if (zelleItem && zelleItem.ImageURL) setZelleQrUrl(zelleItem.ImageURL);
      } catch {
        setZelleQrUrl('');
      }
    }
    fetchQr();
  }, []);

  const canSubmit =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.address.trim() &&
    formData.city.trim() &&
    formData.state.trim() &&
    formData.zipCode.trim() &&
    children.length > 0 &&
    children.every(c => c.fullName.trim() && c.age.trim()) &&
    paymentMethod !== null &&
    (
      paymentMethod === "paypal" ||
      (["zelle", "cheque", "stock"].includes(paymentMethod!)
        ? paymentReference.trim() !== ""
        : true)
    );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleChildChange(index: number, field: keyof ChildInfo, value: string) {
    setChildren(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addChild() {
    setChildren(prev => [...prev, { fullName: '', age: '' }]);
  }

  function removeChild(index: number) {
    setChildren(prev => prev.filter((_, i) => i !== index));
  }

  function getPaymentRefLabel(pm: PaymentMethod | null): string {
    switch (pm) {
      case "zelle": return "Zelle T Id";
      case "cheque": return "Cheque No";
      case "stock": return "Stock Transfer No";
      default: return "";
    }
  }

  const baseTotal = LUNCH_DONATION_BASE_FEE;
  const totalWithFee = addFees ? +(baseTotal * 1.03).toFixed(2) : baseTotal;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    const childrenPayload = children.map(c => ({
      fullName: c.fullName,
      age: c.age
    }));

    const payload = {
      timestamp: new Date().toISOString(),
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      children: childrenPayload,
      baseTotal,
      add3Percent: addFees,
      finalTotal: totalWithFee,
      paymentMethod,
      paymentReference,
    };

    try {
      await fetch(SUBMIT_API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setIsSubmitted(true);
    } catch (err) {
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-lg w-full">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Registering!</h1>
          <p className="text-gray-700 mb-4">Your donation/registration has been submitted.</p>
          <p className="text-gray-600 mb-4">You will receive a confirmation email soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pt-10 pb-10">
      <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white h-40 md:h-60 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Lunch Donation Registration</h1>
        </div>
      </section>
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8 mt-8 space-y-8">
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={addFees}
              onChange={() => setAddFees(v => !v)}
              className="mt-1 accent-accent"
            />
            <span className="text-red-600 font-medium">
              Jain Center pays up to 3% as commission. Consider covering that so we receive the full donation.
            </span>
          </label>
          <div className="text-right font-semibold mt-2 text-brand-dark">
            Total: <span className="text-red-600">${totalWithFee.toFixed(2)}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'fullName', label: 'Full Name', required: true },
              { name: 'email', label: 'Email', required: true },
              { name: 'phone', label: 'Phone', required: true },
              { name: 'address', label: 'Address', required: true },
              { name: 'city', label: 'City', required: true },
              { name: 'state', label: 'State', required: true },
              { name: 'zipCode', label: 'ZIP Code', required: true },
            ].map(({ name, label, required }) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  type="text"
                  name={name}
                  value={(formData as any)[name]}
                  onChange={handleInputChange}
                  required={required}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold">Children</h2>
              <button
                type="button"
                onClick={addChild}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1 rounded"
              >
                Add Child
              </button>
            </div>
            {children.length === 0 && (
              <p className="text-sm text-gray-600">No children added yet. At least one child is required.</p>
            )}
            {children.map((child, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-3 border rounded bg-yellow-50 p-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Child Full Name</label>
                  <input
                    type="text"
                    value={child.fullName}
                    onChange={e => handleChildChange(idx, 'fullName', e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Child Age</label>
                  <input
                    type="text"
                    value={child.age}
                    onChange={e => handleChildChange(idx, 'age', e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeChild(idx)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded w-full"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* PAYMENT METHOD */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-brand-dark">Choose Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { method: "paypal", label: "PayPal", icon: CreditCard },
                { method: "zelle", label: "Zelle", icon: DollarSign },
                { method: "cheque", label: "Cheque", icon: Mail },
                { method: "stock", label: "Stock Transfer", icon: TrendingUp },
              ].map(({ method, label, icon: Icon }) => (
                <button
                  type="button"
                  key={method}
                  className={`border-soft rounded-xl p-4 text-center transition 
                    ${paymentMethod === method
                    ? "border-orange-600 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"}`}
                  onClick={() => { setPaymentMethod(method as PaymentMethod); setPaymentReference(""); }}
                >
                  <Icon className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <div className="text-sm md:text-base font-bold capitalize text-brand-dark">
                    {label}
                  </div>
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
                  required
                  className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  placeholder={`Enter ${getPaymentRefLabel(paymentMethod)}`}
                />
              </div>
            )}
            {paymentMethod === "paypal" && (
              <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light">
                <form
                  action="https://www.sandbox.paypal.com/donate"
                  method="post"
                  target="_blank"
                  onSubmit={() => setTimeout(() => setIsSubmitted(true), 1000)}
                >
                  <input type="hidden" name="business" value="your-sandbox-paypal@email.com" />
                  <input type="hidden" name="currency_code" value="USD" />
                  <input type="hidden" name="amount" value={totalWithFee.toFixed(2)} />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-xl transition-colors mt-2">
                    Pay with PayPal
                  </button>
                </form>
              </div>
            )}
            {paymentMethod === "zelle" && (
              <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light text-center">
                <p className="font-medium text-brand-dark">
                  Scan the Zelle QR code:
                </p>
                {zelleQrUrl ? (
                  <div className="relative w-[200px] h-[200px] mx-auto mt-2">
                    <Image src={zelleQrUrl} alt="Zelle QR" fill className="object-contain" />
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2">Zelle QR code not available.</p>
                )}
                <p className="text-sm text-brand-dark/70 mt-2">
                  or send to <strong>donate@yourdomain.org</strong>
                </p>
              </div>
            )}
            {paymentMethod === "cheque" && (
              <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light">
                <p className="font-medium text-brand-dark mb-2">Mail your cheque to:</p>
                <div className="bg-brand-white p-3 rounded-xl border-l-4 border-accent">
                  <p className="font-medium text-brand-dark">
                    Jain Center
                    <br />1234 Jain Street
                    <br />Your City, State ZIP
                  </p>
                </div>
                <p className="text-sm text-brand-dark/70 mt-2">
                  Please make cheque payable to: <strong>"Jain Center"</strong>
                </p>
              </div>
            )}
            {paymentMethod === "stock" && (
              <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-brand-dark mb-2">Stock Transfer Information</h3>
                    <div className="bg-brand-white p-4 rounded-xl border-l-4 border-green-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-brand-dark">Brokerage Firm:</p>
                          <p className="text-brand-dark/70">{stockInstructions.brokerage}</p>
                        </div>
                        <div>
                          <p className="font-medium text-brand-dark">Account Name:</p>
                          <p className="text-brand-dark/70">{stockInstructions.accountName}</p>
                        </div>
                        <div>
                          <p className="font-medium text-brand-dark">Account Number:</p>
                          <p className="text-brand-dark/70">{stockInstructions.accountNumber}</p>
                        </div>
                        <div>
                          <p className="font-medium text-brand-dark">DTC Number:</p>
                          <p className="text-brand-dark/70">{stockInstructions.dtc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Instructions:</h4>
                    <ul className="text-sm text-blue-700 space-y-1 text-justify">
                      <li>• Contact your broker to initiate the stock transfer</li>
                      <li>• Provide the above account information</li>
                      <li>• Please notify us at <strong>donate@jaincenter.org</strong> after initiating the transfer</li>
                      <li>• Include your name, stock symbol, and number of shares in the email</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                    <p className="text-sm text-yellow-800 text-justify">
                      <strong>Note:</strong> Stock donations may provide additional tax benefits. Please consult your tax advisor for specific guidance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className={`w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded font-semibold text-lg flex items-center justify-center${(!canSubmit || submitting) ? " opacity-50 cursor-not-allowed" : ""}`}
          >
            <Heart className="h-5 w-5 mr-2" />
            {submitting ? "Submitting..." : "Submit Donation Info"}
          </button>
        </form>
      </div>
    </div>
  );
}
