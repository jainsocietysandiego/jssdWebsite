"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CreditCard, DollarSign, Mail, Heart, TrendingUp } from "lucide-react";

// Constants
const DONATION_API_URL =
  "https://script.google.com/macros/s/AKfycbxADt_M879LoY1jpgiboKGcUTl1yritzQclpwAZksu1a5la-CickuIOFlIVK94F2M4Z/exec";
const SUBMIT_API_URL =
  "https://script.google.com/macros/s/AKfycbygRiXyqYnrYhSKPlaeQaP15xfhFp5aZB9Qy2JAjN-OV5-eM3LTfLwZEP5-KVscc42-vg/exec";
const CACHE_KEY = "donation-data-cache";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Types
interface DonationOption {
  id: string;
  label: string;
  amount?: number;
  highlight: boolean;
}

interface DonationData {
  donationOptions: DonationOption[];
  zelleQrUrl: string;
}

// Skeleton Component
const DonationSkeleton = () => (
  <div className="min-h-screen bg-orange-50 p-6 md:p-12 animate-pulse">
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-8 space-y-8">
      <div className="h-10 w-1/2 mx-auto rounded bg-orange-200" />

      {/* Categories Skeleton */}
      <div>
        <div className="h-6 w-1/3 mb-4 rounded bg-orange-100" />
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-gray-200">
              <div className="h-5 w-3/4 mb-2 rounded bg-orange-100" />
              <div className="h-4 w-1/2 rounded bg-orange-100" />
            </div>
          ))}
        </div>
      </div>

      {/* Form Skeleton */}
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div className="h-4 w-1/3 mb-2 rounded bg-orange-100" />
            <div className="h-10 w-full rounded bg-orange-100" />
          </div>
        ))}
      </div>

      {/* Payment Methods Skeleton */}
      <div>
        <div className="h-6 w-1/4 mb-4 rounded bg-orange-100" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 text-center">
              <div className="h-8 w-8 mx-auto mb-2 rounded bg-orange-100" />
              <div className="h-5 w-2/3 mx-auto rounded bg-orange-100" />
            </div>
          ))}
        </div>
      </div>

      <div className="h-12 w-full rounded bg-orange-200" />
    </div>
  </div>
);

const DonatePage: React.FC = () => {
  const [data, setData] = useState<DonationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [addFees, setAddFees] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<
    "paypal" | "zelle" | "cheque" | "stock" | null
  >(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
  const transformApiData = (apiData: any): DonationData => {
    const categories =
      apiData.content?.filter(
        (item: any) => item.Section === "donation_category"
      ) || [];
    const qr = apiData.content?.find(
      (item: any) => item.Section === "zelle_qr"
    );

    return {
      donationOptions: categories.map((item: any) => ({
        id: item.ID,
        label: item.Name,
        amount: item.Amount ? Number(item.Amount) : undefined,
        highlight: item.Highlight === "TRUE",
      })),
      zelleQrUrl: qr?.ImageURL || "",
    };
  };

  const loadData = async () => {
    let shouldFetch = true;
    const cached = localStorage.getItem(CACHE_KEY);

    // 1. Try local cache
    if (cached) {
      try {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setData(cachedData);
          setLoading(false);
          shouldFetch = false;
        }
      } catch (error) {
        console.error("Cache parse error:", error);
        localStorage.removeItem(CACHE_KEY);
      }
    }

    // 2. Fallback to local donate.json
    if (shouldFetch) {
      try {
        const fallback = await fetch("/donate.json");
        const fallbackJson = await fallback.json();
        const transformed = transformApiData(fallbackJson);
        setData(transformed);
        setLoading(false);
      } catch (err) {
        console.warn("Fallback JSON load failed", err);
        setError("Failed to load donation data. Please try again.");
        setLoading(false);
      }
    }

    // 3. Background fetch to update cache and optionally state
    try {
      const live = await fetch(DONATION_API_URL);
      const freshJson = await live.json();
      const transformed = transformApiData(freshJson);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: transformed, timestamp: Date.now() })
      );

      // Optional re-render if fresh != fallback
      if (JSON.stringify(transformed) !== JSON.stringify(data)) {
        setData(transformed);
      }
    } catch (err) {
      console.warn("Background fetch failed", err);
    }
  };

  loadData();
}, []);


  // Transform API data to expected format
  const transformApiData = (apiData: any): DonationData => {
    const categories =
      apiData.content?.filter(
        (item: any) => item.Section === "donation_category"
      ) || [];
    const qr = apiData.content?.find(
      (item: any) => item.Section === "zelle_qr"
    );

    return {
      donationOptions: categories.map((item: any) => ({
        id: item.ID,
        label: item.Name,
        amount: item.Amount ? Number(item.Amount) : undefined,
        highlight: item.Highlight === "TRUE",
      })),
      zelleQrUrl: qr?.ImageURL || "",
    };
  };

  const toggleCategory = (id: string) => {
    const category = data?.donationOptions.find((opt) => opt.id === id);
    const value = category?.amount ? String(category.amount) : "0";
    setSelected((prev) => ({ ...prev, [id]: prev[id] ? "" : value }));
  };

  const handleAmountChange = (id: string, value: string) => {
    setSelected((prev) => ({ ...prev, [id]: value }));
  };

  const baseTotal = Object.entries(selected)
    .filter(([, val]) => val !== "")
    .reduce(
      (sum, [key, val]) =>
        sum +
        (parseFloat(val) ||
          data?.donationOptions.find((opt) => opt.id === key)?.amount ||
          0),
      0
    );

  const totalWithFee = addFees ? baseTotal * 1.03 : baseTotal;

  const handleSubmit = async () => {
    const confirmed = window.confirm(
      "Are you sure you have completed the payment?"
    );
    if (!confirmed) return;

    const payload = {
      timestamp: new Date().toISOString(),
      ...form,
      selectedCategories: Object.keys(selected).join(" | "),
      categoryAmounts: Object.entries(selected)
        .map(([k, v]) => `${k}:${v}`)
        .join(" | "),
      baseTotal,
      add3Percent: addFees,
      finalTotal: totalWithFee.toFixed(2),
      paymentMethod,
    };

    try {
      await fetch(SUBMIT_API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      alert("Donation info recorded! Proceed with your payment method.");
    } catch (err) {
      console.error("Failed to record donation:", err);
      alert("Something went wrong while recording the donation.");
    }
  };

  const retryLoad = () => {
    setLoading(true);
    setError(null);
    localStorage.removeItem(CACHE_KEY);
    window.location.reload();
  };

  // Loading state
  if (loading) {
    return <DonationSkeleton />;
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-orange-50 p-6 md:p-12 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow max-w-md">
          <div className="text-red-600 mb-4">
            <svg
              className="h-12 w-12 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to load donation options
          </h3>
          <p className="text-gray-600 mb-4">
            {error || "Please check your connection and try again."}
          </p>
          <button
            onClick={retryLoad}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 pt-16">
      <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white h-48 sm:h-52 md:h-56 lg:h-60 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold">Make a donation</h1>
        </div>
      </section>

      <div className=" mx-auto bg-white rounded-xl shadow p-8 space-y-8">
        {/* Categories */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Please indicate category (Can select more than one)
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {data.donationOptions.map((opt) => (
              <div
                key={opt.id}
                className={`p-4 rounded-lg border transition-all ${
                  opt.highlight
                    ? "border-red-500 bg-red-50 text-red-600 font-semibold"
                    : "border-gray-200 hover:border-orange-300"
                } ${selected[opt.id] ? "bg-orange-50 border-orange-500" : ""}`}
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
                      <span className="text-red-600 ml-1 font-semibold">
                        {" "}
                        - ${opt.amount.toLocaleString()}
                      </span>
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
              <br />
              Please consider donating that much extra so that we receive the
              full amount of your donation.
            </span>
          </label>
          <div className="text-right font-semibold mt-2 text-gray-700">
            Total Amount:{" "}
            <span className="text-red-600">${totalWithFee.toFixed(2)}</span>
          </div>
        </div>

        {/* Donor Info */}
        <div className="grid md:grid-cols-2 gap-4">
          {["Full Name", "Email", "Phone Number", "Address"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1">{field}</label>
              <input
                type="text"
                className="border px-3 py-2 rounded w-full"
                value={
                  form[
                    field.toLowerCase().replace(/ /g, "") as keyof typeof form
                  ]
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    [field.toLowerCase().replace(/ /g, "")]: e.target.value,
                  })
                }
              />
            </div>
          ))}
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Choose Payment Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { method: "paypal", icon: CreditCard },
              { method: "zelle", icon: DollarSign },
              { method: "cheque", icon: Mail },
              { method: "stock", icon: TrendingUp },
            ].map(({ method, icon: Icon }) => (
              <button
                key={method}
                className={`border rounded-lg p-4 text-center transition ${
                  paymentMethod === method
                    ? "border-orange-600 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
                onClick={() => setPaymentMethod(method as any)}
              >
                <Icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <div className="text-lg font-bold capitalize">
                  {method === "stock" ? "Stock Transfer" : method}
                </div>
              </button>
            ))}
          </div>

          {paymentMethod === "paypal" && (
            <div className="mt-4 border rounded p-4 bg-gray-50">
              <form
                action="https://www.sandbox.paypal.com/donate"
                method="post"
                target="_blank"
              >
                <input
                  type="hidden"
                  name="business"
                  value="your-sandbox-paypal@email.com"
                />
                <input type="hidden" name="currency_code" value="USD" />
                <input
                  type="hidden"
                  name="amount"
                  value={totalWithFee.toFixed(2)}
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded">
                  Pay with PayPal
                </button>
              </form>
            </div>
          )}

          {paymentMethod === "zelle" && (
            <div className="mt-4 border rounded p-4 bg-gray-50 text-center">
              <p className="font-medium text-gray-700">
                Scan the Zelle QR code:
              </p>
              {data.zelleQrUrl && (
                <div className="relative w-[200px] h-[200px] mx-auto mt-2">
                  <Image
                    src={data.zelleQrUrl}
                    alt="Zelle QR"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <p className="text-sm text-gray-600 mt-2">
                or send to <strong>donate@yourdomain.org</strong>
              </p>
            </div>
          )}

          {paymentMethod === "cheque" && (
            <div className="mt-4 border rounded p-4 bg-gray-50">
              <p className="font-medium text-gray-700 mb-2">
                Mail your cheque to:
              </p>
              <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                <p className="font-medium text-gray-800">
                  Jain Center
                  <br />
                  1234 Jain Street
                  <br />
                  Your City, State ZIP
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Please make cheque payable to: <strong>"Jain Center"</strong>
              </p>
            </div>
          )}

          {paymentMethod === "stock" && (
            <div className="mt-4 border rounded p-4 bg-gray-50">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Stock Transfer Information
                  </h3>
                  <div className="bg-white p-4 rounded border-l-4 border-green-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-800">
                          Brokerage Firm:
                        </p>
                        <p className="text-gray-600">Charles Schwab & Co.</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          Account Name:
                        </p>
                        <p className="text-gray-600">Jain Center of America</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          Account Number:
                        </p>
                        <p className="text-gray-600">XXXX-XXXX-XXXX</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">DTC Number:</p>
                        <p className="text-gray-600">0164</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Instructions:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • Contact your broker to initiate the stock transfer
                    </li>
                    <li>• Provide the above account information</li>
                    <li>
                      • Please notify us at{" "}
                      <strong>donate@jaincenter.org</strong> after initiating
                      the transfer
                    </li>
                    <li>
                      • Include your name, stock symbol, and number of shares in
                      the email
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Stock donations may provide
                    additional tax benefits. Please consult your tax advisor for
                    specific guidance.
                  </p>
                </div>
              </div>
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
