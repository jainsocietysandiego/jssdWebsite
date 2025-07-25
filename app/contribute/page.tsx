// NOTE: Final version with conditional input fields only for categories without preset amount

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CreditCard, DollarSign, Mail, Heart } from 'lucide-react';


const DonatePage: React.FC = () => {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [addFees, setAddFees] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'zelle' | 'cheque' | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [donationOptions, setDonationOptions] = useState<any[]>([]);
const [zelleQrUrl, setZelleQrUrl] = useState('');
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch('https://script.google.com/macros/s/AKfycbxADt_M879LoY1jpgiboKGcUTl1yritzQclpwAZksu1a5la-CickuIOFlIVK94F2M4Z/exec');
      const json = await res.json();

      const categories = json.content.filter((item: any) => item.Section === 'donation_category');
      const qr = json.content.find((item: any) => item.Section === 'zelle_qr');

      setDonationOptions(
        categories.map((item: any) => ({
          id: item.ID,
          label: item.Name,
          amount: item.Amount ? Number(item.Amount) : undefined,
          highlight: item.Highlight === 'TRUE',
        }))
      );

      if (qr?.ImageURL) setZelleQrUrl(qr.ImageURL);
    } catch (err) {
      console.error('Error fetching donation data:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const toggleCategory = (id: string) => {
    const category = donationOptions.find((opt) => opt.id === id);
    const value = category?.amount ? String(category.amount) : '0';
    setSelected((prev) => ({ ...prev, [id]: prev[id] ? '' : value }));
  };

  const handleAmountChange = (id: string, value: string) => {
    setSelected((prev) => ({ ...prev, [id]: value }));
  };

  const baseTotal = Object.entries(selected)
    .filter(([, val]) => val !== '')
    .reduce(
      (sum, [key, val]) => sum + (parseFloat(val) || donationOptions.find((opt) => opt.id === key)?.amount || 0),
      0
    );

  const totalWithFee = addFees ? baseTotal * 1.03 : baseTotal;

  const handleSubmit = async () => {
  const confirmed = window.confirm("Are you sure you have completed the payment?");
  if (!confirmed) return;

  const payload = {
    timestamp: new Date().toISOString(),
    ...form,
    selectedCategories: Object.keys(selected).join(' | '),
    categoryAmounts: Object.entries(selected)
      .map(([k, v]) => `${k}:${v}`)
      .join(' | '),
    baseTotal,
    add3Percent: addFees,
    finalTotal: totalWithFee.toFixed(2),
    paymentMethod,
  };

  try {
    await fetch('https://script.google.com/macros/s/AKfycbygRiXyqYnrYhSKPlaeQaP15xfhFp5aZB9Qy2JAjN-OV5-eM3LTfLwZEP5-KVscc42-vg/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    alert('Donation info recorded! Proceed with your payment method.');
  } catch (err) {
    console.error('Failed to record donation:', err);
    alert('Something went wrong while recording the donation.');
  }
};


  return (
    <div className="min-h-screen bg-orange-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-8 space-y-8">
        <h1 className="text-3xl font-bold text-orange-700 text-center">Make a Donation</h1>

        {/* Categories */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Please indicate category (Can select more than one)</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {donationOptions.map((opt) => (
              <div
                key={opt.id}
                className={`p-4 rounded-lg border transition-all ${
                  opt.highlight ? 'border-red-500 bg-red-50 text-red-600 font-semibold' : 'border-gray-200 hover:border-orange-300'
                } ${selected[opt.id] ? 'bg-orange-50 border-orange-500' : ''}`}
              >
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={!!selected[opt.id]}
                    onChange={() => toggleCategory(opt.id)}
                  />
                  <span className="flex-1">
                    {opt.label}
                    {opt.amount && (
                      <span className="text-red-600 ml-1 font-semibold"> - ${opt.amount.toLocaleString()}</span>
                    )}
                  </span>
                </label>
                {selected[opt.id] && !opt.amount && (
                  <input
                    type="number"
                    placeholder={`Enter amount for ${opt.label}`}
                    className="mt-3 w-full border border-gray-300 rounded px-3 py-2"
                    value={selected[opt.id]}
                    onChange={(e) => handleAmountChange(opt.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3% Credit Card Fees */}
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={addFees}
              onChange={() => setAddFees(!addFees)}
              className="mt-1"
            />
            <span className="text-red-600 font-medium">
              Jain Center pays up to 3% of the donation as commission.
              <br />Please consider donating that much extra so that we receive the full amount of your donation.
            </span>
          </label>
          <div className="text-right font-semibold mt-2 text-gray-700">
            Total Amount: <span className="text-red-600">${totalWithFee.toFixed(2)}</span>
          </div>
        </div>

        {/* Donor Info */}
        <div className="grid md:grid-cols-2 gap-4">
          {['Full Name', 'Email', 'Phone Number', 'Address'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1">{field}</label>
              <input
                type="text"
                className="border px-3 py-2 rounded w-full"
                value={form[field.toLowerCase().replace(/ /g, '') as keyof typeof form]}
                onChange={(e) =>
                  setForm({ ...form, [field.toLowerCase().replace(/ /g, '')]: e.target.value })
                }
              />
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
                className={`border rounded-lg p-4 text-center transition ${
                  paymentMethod === method ? 'border-orange-600 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                }`}
                onClick={() => setPaymentMethod(method as any)}
              >
                <div className="text-lg font-bold capitalize">{method}</div>
              </button>
            ))}
          </div>

          {paymentMethod === 'paypal' && (
            <div className="mt-4 border rounded p-4 bg-gray-50">
              <form
                action="https://www.sandbox.paypal.com/donate"
                method="post"
                target="_blank"
              >
                <input type="hidden" name="business" value="your-sandbox-paypal@email.com" />
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
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded font-semibold text-lg flex items-center justify-center"
        >
          <Heart className="h-5 w-5 mr-2" />
          Submit Donation Info
        </button>
      </div>
    </div>
  );
};

export default DonatePage;