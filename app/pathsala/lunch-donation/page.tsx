'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CreditCard, DollarSign, Mail, TrendingUp, Heart, CheckCircle } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';  // Added captcha import


// Endpoints
const ZELLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzIHxb91BTRhLhjOr4an8hcgHBzjOOFWRDPiJgGMlfDEpxGA3ysX0RGjwqE3luzNNDlw/exec';
const SUBMIT_API_URL = 'https://script.google.com/macros/s/AKfycbzWIqCs1aQm3u6w9_JNHQ1LNa7DFFhkzORarM7NNXh6OJ0z-8eLe_xbyydz7JRE1L_6-w/exec';
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

// Fetch/caching for the Zelle QR
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

// === Use your actual reCAPTCHA v2 site key (same as previous page) ===
const RECAPTCHA_SITE_KEY = '6LdGip0rAAAAAKsHaqNZGhLnKNCQjmqYqOnIWI9G';


export default function LunchDonationPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [addFees, setAddFees] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [zelleQrUrl, setZelleQrUrl] = useState('');
  
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Fetch Zelle QR code
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
    captchaToken !== null &&  // Captcha must be solved
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
      captchaToken,  // Passing captcha token to backend
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

  // On captcha change handler
  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light p-6">
        <div className="bg-brand-white rounded-xl shadow-soft p-8 text-center max-w-lg w-full">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-xl md:text-2xl font-bold text-brand-dark mb-2">Thank You for Registering!</h1>
          <p className="text-brand-dark/80 mb-4 text-sm md:text-base">Your donation/registration has been submitted.</p>
          <p className="text-brand-dark/70 text-sm md:text-base">You will receive a confirmation email soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[8vh] sm:pt-[12vh]">
      {/* ───── HERO BANNER ───── */}
      <section className="relative flex items-center justify-center h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden">
        <Image
          src="/images/hero-banner.jpg"
          alt="Make a Donation"
          fill
          priority
          quality={85}
          className="object-cover"
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-bold text-brand-light text-3xl sm:text-4xl md:text-5xl">
            Lunch Donation Registration
          </h1>
        </div>
      </section>

      {/* ───── MAIN FORM ───── */}
      <section className="bg-brand-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-brand-white rounded-xl shadow-xl p-6 md:p-8 space-y-8 border-4 border-[#FFF7ED] sm:mt-10 relative z-10">

            {/* 3% Fee Notice */}
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={addFees}
                  onChange={() => setAddFees(v => !v)}
                  className="mt-1 accent-accent"
                />
                <span className="text-red-600 font-medium text-sm md:text-base">
                  Jain Center pays up to 3% as commission. Consider covering that so we receive the full donation.
                </span>
              </label>
              <div className="text-right font-semibold mt-2 text-brand-dark">
                Total: <span className="text-red-600">${totalWithFee.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
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
                    <label className="block text-sm font-medium mb-1 text-brand-dark">{label}</label>
                    <input
                      type="text"
                      name={name}
                      value={(formData as any)[name]}
                      onChange={handleInputChange}
                      required={required}
                      className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark bg-brand-white focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
                    />
                  </div>
                ))}
              </div>

              {/* Children Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-semibold text-brand-dark">Children Information</h2>
                  <button
                    type="button"
                    onClick={addChild}
                    className="bg-accent hover:bg-accent-hov text-brand-light px-4 py-2 rounded-xl font-medium text-sm transition-colors"
                  >
                    Add Child
                  </button>
                </div>

                {children.length === 0 && (
                  <p className="text-sm text-brand-dark/70 mb-4">No children added yet. At least one child is required.</p>
                )}

                {children.map((child, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4 border border-accent/20 rounded-xl bg-brand-white p-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1 text-brand-dark">Child Full Name</label>
                      <input
                        type="text"
                        value={child.fullName}
                        onChange={e => handleChildChange(idx, 'fullName', e.target.value)}
                        required
                        className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark bg-brand-light focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-brand-dark">Child Age</label>
                      <input
                        type="text"
                        value={child.age}
                        onChange={e => handleChildChange(idx, 'age', e.target.value)}
                        required
                        className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark bg-brand-light focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeChild(idx)}
                        className="w-full bg-accent border-4 border-accent hover:bg-white hover:text-accent hover:border-4 text-white px-3 py-3 rounded-xl font-medium text-sm transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* CAPTCHA here - before Payment Method */}
              <div className="mt-4">
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={handleCaptchaChange}
                  theme="light"
                />
              </div>

              {/* Payment Method Selection */}
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-brand-dark">Choose Payment Method</h2>
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
                      className={`border-soft rounded-xl p-4 text-center transition-all ${
                        paymentMethod === method ? "border-accent bg-accent/10" : "border-accent/20 hover:border-accent/40"
                      }`}
                      onClick={() => { setPaymentMethod(method as PaymentMethod); setPaymentReference(""); }}
                    >
                      <Icon className="h-8 w-8 mx-auto mb-2 text-accent" />
                      <div className="text-sm md:text-base font-semibold text-brand-dark">{label}</div>
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
                      className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark bg-brand-white focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
                      placeholder={`Enter ${getPaymentRefLabel(paymentMethod)}`}
                    />
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div className="mt-4 border-soft rounded-xl p-4 bg-brand-white">
                    <form
                      action="https://www.sandbox.paypal.com/donate"
                      method="post"
                      target="_blank"
                    >
                      <input type="hidden" name="business" value="your-sandbox-paypal@email.com" />
                      <input type="hidden" name="currency_code" value="USD" />
                      <input type="hidden" name="amount" value={totalWithFee.toFixed(2)} />
                      <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl transition-colors font-medium">
                        Pay with PayPal
                      </button>
                    </form>
                  </div>
                )}

                {paymentMethod === "zelle" && (
                  <div className="mt-4 border-soft rounded-xl p-4 bg-brand-white text-center">
                    <p className="font-medium text-brand-dark mb-4">Scan the Zelle QR code:</p>
                    {zelleQrUrl ? (
                      <div className="relative w-[200px] h-[200px] mx-auto mt-2">
                        <Image src={zelleQrUrl} alt="Zelle QR" fill className="object-contain" />
                      </div>
                    ) : (
                      <p className="text-brand-dark/60 mt-2">Zelle QR code not available.</p>
                    )}
                    <p className="text-sm text-brand-dark/80 mt-4">
                      or send to <strong>donate@yourdomain.org</strong>
                    </p>
                  </div>
                )}

                {paymentMethod === "cheque" && (
                  <div className="mt-4 border-soft rounded-xl p-4 bg-brand-white">
                    <p className="text-brand-dark mb-2">Mail your cheque to:</p>
                    <div className="bg-brand-light p-3 rounded-xl border-l-4 border-accent">
                      <p className="font-medium text-brand-dark">
                        Jain Center
                        <br />1234 Jain Street
                        <br />Your City, State ZIP
                      </p>
                    </div>
                    <p className="text-sm text-brand-dark/80 mt-2">
                      Please make cheque payable to: <strong>"Jain Center"</strong>
                    </p>
                  </div>
                )}

                {paymentMethod === "stock" && (
                  <div className="mt-4 border-soft rounded-xl p-4 bg-brand-white">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-brand-dark mb-2">Stock Transfer Information</h3>
                        <div className="bg-brand-light p-4 rounded-xl border-l-4 border-green-500">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-brand-dark">Brokerage Firm:</p>
                              <p className="text-brand-dark/80">{stockInstructions.brokerage}</p>
                            </div>
                            <div>
                              <p className="font-medium text-brand-dark">Account Name:</p>
                              <p className="text-brand-dark/80">{stockInstructions.accountName}</p>
                            </div>
                            <div>
                              <p className="font-medium text-brand-dark">Account Number:</p>
                              <p className="text-brand-dark/80">{stockInstructions.accountNumber}</p>
                            </div>
                            <div>
                              <p className="font-medium text-brand-dark">DTC Number:</p>
                              <p className="text-brand-dark/80">{stockInstructions.dtc}</p>
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
                className={`w-full btn-primary text-lg py-4 rounded-xl flex items-center justify-center ${
                  (!canSubmit || submitting) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Heart className="h-5 w-5 mr-2" />
                {submitting ? "Submitting..." : "Submit Donation Info"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
