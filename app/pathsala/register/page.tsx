'use client';
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Heart } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

const LEVELS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyHVNzO5Wbr-OBUAD_KPKPazFsZWz4ak7LONoccChBmZnAmnINE6cUbcnmH_647G5urKw/exec";
const ZELLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzIHxb91BTRhLhjOr4an8hcgHBzjOOFWRDPiJgGMlfDEpxGA3yksX0RGjwqE3luzNNDlw/exec";
const SUBMIT_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzFbArhMgfdf8gxmChe9W-LYTmbZi-L2H540l9gYwyogXV4EseAfuuxA4qTYB2AbQH5/exec";
const MEMBERS_FETCH_URL =
  "https://script.google.com/macros/s/AKfycbwr6UVIctMfibH5HYHPYdPaO0-bW6SdD5emN9L1juoquxpm0embyiS0HLfTR8swJVI_/exec";

// === PUT YOUR ACTUAL SITE KEY HERE ===
const RECAPTCHA_SITE_KEY = "6LdGip0rAAAAAKsHaqNZGhLnKNCQjmqYqOnIWI9G";

const cacheFetch = async (
  key: string,
  fetcher: () => Promise<any>,
  maxAgeMs = 15 * 60 * 1000
) => {
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

const Loading = () => (
  <div className="min-h-screen bg-brand-light flex items-center justify-center">
    <div className="text-center px-4">
      <div className="relative">
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8 relative">
          <div className="absolute inset-0 border-4 border-[rgba(234,88,12,0.1)] rounded-full"></div>
          <div className="absolute inset-1 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-brand-dark/30 border-r-transparent rounded-full" style={{ animation: "spin 1s linear infinite reverse" }}></div>
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

type PaymentMethod = "paypal" | "zelle" | "cheque" | "stock" | null;

const PathshalaRegister: React.FC = () => {
  const [isMember, setIsMember] = useState<"" | "yes" | "no">("");
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [addFees, setAddFees] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [zelleQrUrl, setZelleQrUrl] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memberNames, setMemberNames] = useState<string[]>([]);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [formData, setFormData] = useState({
    memberName: "",
    studentName: "",
    studentAge: "",
  });

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(MEMBERS_FETCH_URL);
        const json = await res.json();
        setMemberNames(json.names || []);
      } catch (err) {
        setMemberNames([]);
      }
    }
    fetchMembers();
  }, []);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const levelsRes = await cacheFetch("jc_levels_cache", async () => {
          const res = await fetch(LEVELS_SCRIPT_URL);
          return (await res.json()).levels;
        });
        setLevels(levelsRes || []);
        const qrRes = await cacheFetch(
          "jc_zelleqr_cache",
          async () => {
            const res = await fetch(ZELLE_SCRIPT_URL);
            return (await res.json()).content;
          },
          60 * 60 * 1000
        );
        const zelleItem = (qrRes || []).find(
          (i: any) => String(i.Section || "").toLowerCase() === "zelle_qr"
        );
        if (zelleItem && zelleItem.ImageURL) setZelleQrUrl(zelleItem.ImageURL);
      } catch (e) {
        setLevels([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const selectedPlan = levels.find(
    (lvl) => String(lvl.Level) === String(selectedLevel)
  );
  const baseTotal = selectedPlan?.Fees ? Number(selectedPlan.Fees) : 0;
  const totalWithFee = addFees
    ? Math.round(baseTotal * 1.03 * 100) / 100
    : baseTotal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  function getPaymentRefLabel(pm: PaymentMethod): string {
    switch (pm) {
      case "zelle":
        return "Zelle T Id";
      case "cheque":
        return "Cheque No";
      case "stock":
        return "Stock Transfer No";
      default:
        return "";
    }
  }

  const canSubmit =
    isMember === "yes" &&
    !!formData.memberName.trim() &&
    !!formData.studentName.trim() &&
    !!selectedLevel &&
    paymentMethod !== null &&
    captchaToken &&
    (paymentMethod === "paypal" ||
      (["zelle", "cheque", "stock"].includes(paymentMethod || "")
        ? paymentReference.trim() !== ""
        : true));

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isMember !== "yes") {
      alert("You must be a member to register.");
      return;
    }
    if (!formData.memberName.trim()) {
      alert("Member Name is required.");
      return;
    }
    if (!formData.studentName.trim()) {
      alert("Student Name is required.");
      return;
    }
    if (!selectedLevel) {
      alert("Please select a Pathshala level.");
      return;
    }
    if (paymentMethod === null) {
      alert("Please select a payment method.");
      return;
    }
    if (
      (paymentMethod === "zelle" || paymentMethod === "cheque" || paymentMethod === "stock") &&
      !paymentReference.trim()
    ) {
      alert(`Please enter ${getPaymentRefLabel(paymentMethod)}.`);
      return;
    }
    if (!captchaToken) {
      alert("Please complete the captcha.");
      return;
    }
    const payload = {
      timestamp: new Date().toISOString(),
      memberName: formData.memberName,
      studentName: formData.studentName,
      studentAge: formData.studentAge,
      selectedLevel,
      levelTitle: selectedPlan?.Title,
      levelDescription: selectedPlan?.Description,
      baseTotal,
      add3Percent: addFees,
      finalTotal: totalWithFee.toFixed(2),
      paymentMethod,
      paymentReference,
      captchaToken, // includes captcha token in the payload!
    };
    try {
      await fetch(SUBMIT_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setIsSubmitted(true);
    } catch (e) {
      alert("Submission failed");
    }
  };

  if (loading) return <Loading />;

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-lg w-full">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Thank You for Registering!
          </h1>
          <p className="text-gray-700 mb-4">
            Your Pathshala registration has been submitted successfully.
          </p>
          <p className="text-gray-600">
            You will receive a confirmation email soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[8vh] sm:pt-[12vh] pb-10">
      {/* ───── HERO ───── */}
      <section
        className="relative flex items-center justify-center
                          h-40 sm:h-48 md:h-56 lg:h-60 overflow-hidden"
      >
        <Image
          src="/images/hero-banner.jpg"
          alt="Pathshala Registration"
          fill
          priority
          quality={85}
          className="object-cover"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-bold text-brand-light text-3xl sm:text-4xl md:text-5xl">
            Pathshala Registration
          </h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto bg-brand-white rounded-xl shadow-xl p-6 md:p-8 space-y-8 border-4 border-[#FFF7ED] sm:mt-10 relative z-10">
        {/* Membership Question */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-4 text-brand-dark">
            Are you a member?<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex gap-5">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="member"
                value="yes"
                checked={isMember === "yes"}
                onChange={() => setIsMember("yes")}
                className="accent-accent"
              />
              <span className="font-medium text-md text-brand-dark">Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="member"
                value="no"
                checked={isMember === "no"}
                onChange={() => setIsMember("no")}
                className="accent-accent"
              />
              <span className="font-medium text-md text-brand-dark">No</span>
            </label>
          </div>
        </div>

        {isMember === "no" && (
          <div className="mt-8 flex flex-col items-center justify-center">
            <div className="bg-yellow-100 border border-yellow-300 rounded-xl px-6 py-8 max-w-xl text-center">
              <div className="font-bold text-lg mb-2 text-red-700">
                You must be a member to register for Pathshala.
              </div>
              <p className="text-brand-dark mb-4">
                Please complete your membership registration to enroll your
                child.
              </p>
              <Link
                href="/membership/become-a-member"
                className="btn-primary px-6 py-3 text-lg font-semibold rounded-xl transition-all hover:bg-accent/90 bg-accent text-white"
              >
                Become a Member
              </Link>
            </div>
          </div>
        )}

        {/* Main registration form only if member = yes */}
        {isMember === "yes" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member Name Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1 text-brand-dark">
                Member Name <span className="text-red-500">*</span>
              </label>
              <select
                name="memberName"
                value={formData.memberName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
              >
                <option value="">-- Select Member --</option>
                {memberNames.map((name, idx) => (
                  <option key={idx} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Name and Age */}
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
                <label className="block text-sm font-medium mb-1 text-brand-dark">
                  Student Age
                </label>
                <input
                  type="text"
                  name="studentAge"
                  value={formData.studentAge}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
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
                {levels.map((lvl) => (
                  <option key={lvl.Level} value={lvl.Level}>{lvl.Level}</option>
                ))}
              </select>
              {selectedPlan && (
                <div className="mt-2 text-sm text-brand-dark bg-brand-light p-3 rounded-xl border-soft">
                  <b>Description:</b> {selectedPlan.Description || "-"}
                  <br />
                  <b>Fee:</b> ${selectedPlan.Fees}
                </div>
              )}
            </div>

            {/* Captcha */}
            <div>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
                theme="light"
              />
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
                  We pay ~3% in fees for online payments. Consider covering that
                  cost so 100% of your contribution supports the community.
                </span>
              </label>
              <div className="text-right font-semibold mt-2 text-brand-dark">
                Total:{" "}
                <span className="text-red-600">${totalWithFee.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method + Reference */}
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-brand-dark">
                Choose Payment Method <span className="text-red-500">*</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {["paypal", "zelle", "cheque", "stock"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    className={`border-soft rounded-xl p-4 text-center transition-all ${
                      paymentMethod === method
                        ? "border-accent bg-brand-light"
                        : "border-accent/20 hover:border-accent/40"
                    }`}
                    onClick={() => {
                      setPaymentMethod(method as PaymentMethod);
                      setPaymentReference("");
                    }}
                  >
                    <div className="text-sm md:text-base font-bold capitalize text-brand-dark">
                      {method}
                    </div>
                  </button>
                ))}
              </div>

              {paymentMethod && paymentMethod !== "paypal" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1 text-brand-dark">
                    {getPaymentRefLabel(paymentMethod)}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={e => setPaymentReference(e.target.value)}
                    required={
                      paymentMethod === "zelle" ||
                      paymentMethod === "cheque" ||
                      paymentMethod === "stock"
                    }
                    className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark bg-brand-light focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
                    placeholder={`Enter ${getPaymentRefLabel(paymentMethod)}`}
                  />
                </div>
              )}

              {paymentMethod === "zelle" && (
                <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light text-center">
                  <p className="font-medium text-brand-dark">Scan the Zelle QR code:</p>
                  {zelleQrUrl && (
                    <div className="relative w-[200px] h-[200px] mx-auto mt-2">
                      <Image src={zelleQrUrl} alt="Zelle QR" fill className="object-contain"/>
                    </div>
                  )}
                  <p className="text-sm text-brand-dark/70 mt-2">
                    or send to <strong>donate@yourdomain.org</strong>
                  </p>
                </div>
              )}

              {paymentMethod === "paypal" && (
                <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light">
                  <form
                    action="https://www.sandbox.paypal.com/donate"
                    method="post"
                    target="_blank"
                  >
                    <input
                      type="hidden"
                      name="business"
                      value="your-paypal-email@example.com"
                    />
                    <input type="hidden" name="currency_code" value="USD" />
                    <input
                      type="hidden"
                      name="amount"
                      value={totalWithFee.toFixed(2)}
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-xl transition-colors">
                      Pay with PayPal
                    </button>
                  </form>
                </div>
              )}

              {paymentMethod === "cheque" && (
                <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light">
                  <p className="text-brand-dark mb-2">Mail your cheque to:</p>
                  <p className="mt-2 font-medium text-brand-dark">
                    Jain Center<br />1234 Jain Street<br />Your City, State ZIP
                  </p>
                </div>
              )}

              {paymentMethod === "stock" && (
                <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light">
                  <p className="text-brand-dark text-justify">
                    Please enter your Stock Transfer No above after completing your stock donation. For transfer instructions, contact{" "}
                    <a href="mailto:donate@yourdomain.org" className="underline text-accent">donate@yourdomain.org</a>.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full btn-primary text-lg py-4 flex items-center justify-center mt-6
                ${!canSubmit ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Heart className="h-5 w-5 mr-2" />
              Submit Pathshala Registration
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PathshalaRegister;
