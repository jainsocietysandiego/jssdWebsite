"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CreditCard, DollarSign, Mail, TrendingUp, Heart } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

type PaymentMethod = "paypal" | "zelle" | "cheque" | "stock";

const DONATION_API_URL =
  "https://script.google.com/macros/s/AKfycbxADt_M879LoY1jpgiboKGcUTl1yritzQclpwAZksu1a5la-CickuIOFlIVK94F2M4Z/exec";
const SUBMIT_API_URL =
  "https://script.google.com/macros/s/AKfycby8IC3GqnT8wZTB9BZMf_UipMYtIYU4tMq4-BCGNbV5iEZ2y9NlC8-5H5tMGKIwHuQ4_Q/exec";
const CACHE_KEY = "donation-data-cache";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

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

const Loading = () => (
  <div className="min-h-screen bg-brand-light flex items-center justify-center">
    <div className="text-center px-4">
      <div className="relative">
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8 relative">
          <div className="absolute inset-0 border-4 border-[rgba(234,88,12,0.1)] rounded-full"></div>
          <div className="absolute inset-1 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <div
            className="absolute inset-2 border-4 border-brand-dark/30 border-r-transparent rounded-full"
            style={{ animation: "spin 1s linear infinite reverse" }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-accent rounded-full flex items-center justify-center animate-pulse">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full"></div>
          </div>
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-brand-dark mb-2">Jai Jinendra</h3>
        <p className="text-sm md:text-base text-accent animate-pulse">Ahimsa Parmo Dharma</p>
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  </div>
);

const DonatePage = () => {
  const [data, setData] = useState<DonationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [addFees, setAddFees] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    // Load cached or live data for donation options and Zelle QR
    const transform = (apiData: any): DonationData => {
      const categories =
        apiData?.content?.filter(
          (item: any) => item.Section === "donation_category"
        ) || [];
      const qr = apiData?.content?.find(
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

    const load = async () => {
      let shouldFetch = true;
      const cachedRaw = localStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw);
          if (Date.now() - cached.timestamp < CACHE_TTL) {
            setData(cached.data);
            setLoading(false);
            shouldFetch = false;
          }
        } catch {
          localStorage.removeItem(CACHE_KEY);
        }
      }
      if (shouldFetch) {
        try {
          const fallback = await fetch("/donate.json");
          const fallbackData = await fallback.json();
          setData(transform(fallbackData));
          setLoading(false);
        } catch {
          setError("Failed to load donation data.");
          setLoading(false);
        }
      }
      try {
        const live = await fetch(DONATION_API_URL);
        const liveData = await live.json();
        const transformedData = transform(liveData);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: transformedData, timestamp: Date.now() })
        );
        if (JSON.stringify(transformedData) !== JSON.stringify(data)) {
          setData(transformedData);
        }
      } catch {
        // Ignore live refresh fail
      }
    };
    load();
  }, []);

  const toggleCategory = (id: string) => {
    setSelected((s) => {
      const newS = { ...s };
      if (newS[id]) delete newS[id];
      else {
        const cat = data?.donationOptions.find((x) => x.id === id);
        newS[id] = cat?.amount ? cat.amount.toString() : "";
      }
      return newS;
    });
  };
  const handleAmountChange = (id: string, val: string) => {
    setSelected((s) => ({ ...s, [id]: val }));
  };

  const baseTotal = Object.entries(selected).reduce(
    (acc, [_, val]) => acc + (parseFloat(val) || 0),
    0
  );
  const totalWithFees = addFees ? +(baseTotal * 1.03).toFixed(2) : baseTotal;

  function onInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  const getPaymentRefLabel = (pm: PaymentMethod | null) => {
    switch (pm) {
      case "paypal": return "";
      case "zelle": return "Zelle T Id";
      case "cheque": return "Cheque No";
      case "stock": return "Stock Transfer No";
      default: return "";
    }
  };

  const canSubmit =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    Object.values(selected).some((val) => parseFloat(val) > 0) &&
    paymentMethod !== null &&
    (paymentMethod === "paypal" ||
      (["zelle", "cheque", "stock"].includes(paymentMethod) && paymentReference.trim() !== "")) &&
    captchaToken !== null;

  async function handleSubmit() {
    if (!canSubmit) return;

    if (!window.confirm("Confirm all information is accurate and payment completed?")) {
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      ...form,
      selectedCategories: Object.keys(selected).join(" | "),
      categoryAmounts: Object.entries(selected)
        .map(([k, v]) => `${k}:${v}`)
        .join(" | "),
      baseTotal,
      addFees,
      finalTotal: totalWithFees,
      paymentMethod,
      paymentReference,
      captchaToken,
    };

    try {
      await fetch(SUBMIT_API_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      alert("Thank you! Your donation has been recorded.");
      window.location.reload();
    } catch {
      alert("An error occurred during submission. Please try again later.");
    }
  }

  if (loading)
    return <Loading />;

  if (error || !data)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-orange-50">
        <div className="bg-white rounded-lg p-8 max-w-md text-center shadow">
          <p className="text-red-600 font-semibold mb-4">Error loading donation information.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white pt-[8vh] sm:pt-[12vh] pb-10">
      <section className="relative flex items-center justify-center
                                    h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden">
                  <Image
                    src="/images/hero-banner.jpg"
                    alt="Pathshala Program"
                    fill
                    priority
                    quality={85}
                    className="object-cover"
                  />
                  <div className="relative z-10 text-center px-4">
                    <h1 className="font-bold text-brand-light text-3xl sm:text-4xl md:text-5xl">
                      Make a Donation
                    </h1>
                    <p className="mt-2 max-w-4xl mx-auto text-white text-sm sm:text-base md:text-lg text-center">
                      Participate in our sacred seva by making a dharmic donation to our spiritual mission
                    </p>
                  </div>
                </section>
      

      <div className="max-w-5xl mx-auto bg-brand-white rounded-xl shadow-xl p-6 md:p-8 space-y-8 border-4 border-[#FFF7ED] mt-10 relative z-10">
        {/* Categories */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-brand-dark mb-4">Please indicate category (can select more than one)</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {data.donationOptions.map((option) => {
              const isSelected = !!selected[option.id];
              return (
                <div
                  key={option.id}
                  className={`p-4 rounded-xl border-soft border transition ${
                    isSelected ? "bg-brand-light border-accent" : "border-accent/20 hover:border-accent/40"
                  } ${option.highlight ? "bg-yellow-50 border-yellow-400 text-yellow-800 font-semibold" : ""}`}
                >
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-accent"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setSelected((prev) => {
                            const copy = { ...prev };
                            delete copy[option.id];
                            return copy;
                          });
                        } else {
                          setSelected((prev) => ({
                            ...prev,
                            [option.id]: option.amount ? option.amount.toString() : "",
                          }));
                        }
                      }}
                    />
                    <span className="ml-2 flex-1 text-sm md:text-base">
                      {option.label} {option.amount && <>- ${option.amount}</>}
                    </span>
                  </label>
                  {isSelected && !option.amount && (
                    <input
                      type="number"
                      min={1}
                      className="mt-2 w-full border-soft rounded p-2 text-sm"
                      placeholder={`Enter amount for ${option.label}`}
                      value={selected[option.id]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelected((prev) => ({ ...prev, [option.id]: val }));
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Fees */}
        <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-xl">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="accent-accent"
              checked={addFees}
              onChange={() => setAddFees((v) => !v)}
            />
            <span className="ml-2 text-sm md:text-base text-justify">
              Jain Center pays ~3% commission on donations via card, please consider adding that amount to your donation.
            </span>
          </label>
          <div className="mt-2 text-right font-semibold text-brand-dark">
            Total Donation: <span className="text-red-600">${totalWithFees.toFixed(2)}</span>
          </div>
        </div>

        {/* Donor Info */}
        <div className="grid md:grid-cols-2 gap-4">
          {["name", "email", "phone", "address"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-brand-dark mb-1 capitalize">{field}</label>
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={(form as any)[field]}
                onChange={(e) => onInputChange(e)}
                className="w-full px-4 py-2 border-soft rounded focus:ring-2 focus:ring-accent focus:border-accent focus:outline-none"
                required
              />
            </div>
          ))}
        </div>

        {/* Captcha */}
        <div>
          <ReCAPTCHA
            sitekey={"6LdGip0rAAAAAKsHaqNZGhLnKNCQjmqYqOnIWI9G"} // Google's test key (you may replace with live)
            onChange={(token) => {
              setCaptchaToken(token);
            }}
          />
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-brand-dark mb-4">Choose a Payment Method</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { method: "paypal", icon: CreditCard },
              { method: "zelle", icon: DollarSign },
              { method: "cheque", icon: Mail },
              { method: "stock", icon: TrendingUp },
            ].map(({ method, icon: Icon }) => (
              <button
                key={method}
                type="button"
                onClick={() => {
                  setPaymentMethod(method as PaymentMethod);
                  setPaymentReference("");
                }}
                className={`flex flex-col items-center rounded border p-4 cursor-pointer ${
                  paymentMethod === method ? "border-accent bg-accent/20" : "border-soft hover:border-accent/50"
                }`}
              >
                <Icon className="text-accent mb-2" />
                <span className="capitalize text-brand-dark">{method}</span>
              </button>
            ))}
          </div>
          {paymentMethod && paymentMethod !== "paypal" && (
            <div className="mt-4">
              <label className="block mb-1 text-brand-dark font-medium">
                {getPaymentRefLabel(paymentMethod)} <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full px-4 py-2 border-soft rounded focus:ring-2 focus:ring-accent focus:border-accent focus:outline-none"
                placeholder={`Enter ${getPaymentRefLabel(paymentMethod)}`}
                required
              />
            </div>
          )}
          {paymentMethod === "paypal" && (
            <div className="mt-4">
              <form
                action="https://www.sandbox.paypal.com/cgi-bin/webscr"
                method="post"
                target="_blank"
              >
                <input type="hidden" name="cmd" value="_donations" />
                <input type="hidden" name="business" value="your-paypal-email@example.com" />
                <input type="hidden" name="currency_code" value="USD" />
                <input type="hidden" name="amount" value={totalWithFees.toFixed(2)} />
                <button className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700 mt-2">
                  Pay with PayPal
                </button>
              </form>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-3 rounded text-white text-lg font-semibold mt-8 ${
            canSubmit ? "bg-accent hover:bg-accent/90" : "bg-accent/50 cursor-not-allowed"
          }`}
        >
          <Heart className="inline-block mr-2" /> Submit Donation Info
        </button>
      </div>
    </div>
  );
};

export default DonatePage;
