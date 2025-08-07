'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Heart } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

const FETCH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx33ldKE6dib3hJFA6xYw0ShWDzwV2hZNV-loY2l6SfOxqRGvvh9cgdPRmeufgdrWSrAw/exec';
const SUBMIT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxF0DPusGE0Ve8I4XimnrAeEHv7pfXeZgeLhjdCbCUiI0shJYKQOFRbTRhUGW7dFS1w/exec';

// === Your actual reCAPTCHA site key here ===
const RECAPTCHA_SITE_KEY = '6LdGip0rAAAAAKsHaqNZGhLnKNCQjmqYqOnIWI9G';

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
            style={{ animation: 'spin 1s linear infinite reverse' }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-accent rounded-full flex items-center justify-center animate-pulse">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full"></div>
          </div>
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-brand-dark mb-2">Jai Jinendra</h3>
        <p className="text-sm md:text-base text-accent animate-pulse">Ahimsa Parmo Dharma</p>
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  </div>
);

type MemberOption = { label: string; value: string }; // value format: "Name||Email"

const MembershipPage: React.FC = () => {
  const [isMember, setIsMember] = useState<'' | 'yes' | 'no'>('');
  const [allMembersData, setAllMembersData] = useState<any[]>([]);
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<any[]>([]);
  const [selectedMembership, setSelectedMembership] = useState<string>('');
  const [addFees, setAddFees] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [zelleQrUrl, setZelleQrUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    familyMembers: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch(FETCH_SCRIPT_URL);
        const json = await res.json();
        const memberships = json.content.filter((item: any) => item.Section === 'membership_type');
        const qr = json.content.find((item: any) => item.Section === 'zelle_qr');
        setMembershipTypes(memberships.map((item: any) => ({ id: item.ID, name: item.Name, amount: Number(item.Amount), description: item.Description, highlight: item.Highlight === 'TRUE' })));
        setZelleQrUrl(qr?.ImageURL || '');

        const membersRes = await fetch(SUBMIT_SCRIPT_URL);
        const membersJson = await membersRes.json();
        const membersRows: any[] = Array.isArray(membersJson) ? membersJson : (membersJson.data || []);

        const seen = new Set();
        const uniqueMembers = membersRows.filter(row => {
          const key = [
            String(row['Full Name'] || row.fullName || row.fullname || '').trim().toLowerCase(),
            String(row['Email'] || row.email || '').trim().toLowerCase(),
            String(row['Phone'] || row.phone || '').trim().toLowerCase(),
            String(row['Address'] || row.address || '').trim().toLowerCase(),
            String(row['City'] || row.city || '').trim().toLowerCase(),
            String(row['State'] || row.state || '').trim().toLowerCase(),
            String(row['Zip Code'] || row.zipCode || row.zipcode || '').trim().toLowerCase(),
          ].join('|');
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        const options: MemberOption[] = uniqueMembers.map(row => {
          const name = String(row['Full Name'] || row.fullName || row.fullname || '').trim();
          const email = String(row['Email'] || row.email || '').trim();
          return {
            label: email ? `${name} - ${email}` : name,
            value: `${name}||${email}`,
          };
        }).filter(opt => opt.label.length > 0);

        setMemberOptions(options);
        setAllMembersData(uniqueMembers);
      } catch (e) {
        console.error('Error loading data:', e);
        setMembershipTypes([]);
        setZelleQrUrl('');
        setMemberOptions([]);
        setAllMembersData([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  // Autofill personal info when selecting member from dropdown (only if isMember === 'yes')
  useEffect(() => {
    if (isMember !== 'yes') return;

    if (!formData.fullName) {
      // Clear all personal info if no member selected
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        familyMembers: '',
      });
      return;
    }

    // formData.fullName is "Name||Email"
    const [selectedName, selectedEmail] = formData.fullName.split('||');

    // Find matching record by name & email
    const found = allMembersData.find(row => {
      const name = String(row['Full Name'] || row.fullName || row.fullname || '').trim();
      const email = String(row['Email'] || row.email || '').trim();
      return name === selectedName && email === selectedEmail;
    });

    if (found) {
      setFormData({
        fullName: formData.fullName, // keep unique value string
        email: String(found['Email'] || ''),
        phone: String(found['Phone'] || ''),
        address: String(found['Address'] || ''),
        city: String(found['City'] || ''),
        state: String(found['State'] || ''),
        zipCode: String(found['Zip Code'] || ''),
        familyMembers: String(found['Family Members'] || ''),
      });
    } else {
      // Clear fields if no match
      setFormData(prev => ({
        ...prev,
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        familyMembers: '',
      }));
    }
  }, [formData.fullName, isMember, allMembersData]);

  // On input change handler (for text inputs and textarea)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const canSubmit =
    isMember !== '' &&
    !!formData.fullName.trim() &&
    !!formData.email.trim() &&
    !!formData.phone.trim() &&
    !!formData.address.trim() &&
    !!formData.city.trim() &&
    !!formData.state.trim() &&
    !!formData.zipCode.trim() &&
    paymentMethod !== null &&
    !!selectedPlan &&
    captchaToken &&
    (paymentMethod === 'paypal' ||
      (['zelle', 'cheque', 'stock'].includes(paymentMethod)
        ? paymentReference.trim() !== ''
        : true));

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
    if (['zelle', 'cheque', 'stock'].includes(paymentMethod) && !paymentReference.trim()) {
      alert(`Please enter ${getPaymentRefLabel(paymentMethod)}.`);
      return;
    }
    if (!captchaToken) {
      alert('Please complete the CAPTCHA.');
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      ...formData,
      selectedMembership: selectedPlan.name,
      baseTotal,
      add3Percent: addFees,
      finalTotal: totalWithFee.toFixed(2),
      paymentMethod,
      paymentReference,
      captchaToken,
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

  if (loading) return <Loading />;

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
    <div className="min-h-screen bg-white pt-[8vh] sm:pt-[12vh] pb-10">
      {/* ───── HERO ───── */}
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
                      Membership Registration
                    </h1>
                    <p className="mt-2 max-w-4xl mx-auto text-white text-sm sm:text-base md:text-lg text-center">
                      Register to unite with fellow devotees in our mission of dharmic service
                    </p>
                  </div>
                </section>            

      <div className="max-w-5xl mx-auto bg-brand-white rounded-xl shadow-xl p-6 md:p-8 space-y-8 border-4 border-[#FFF7ED] sm:mt-10 relative z-10">

        {/* Are you a member? */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-4 text-brand-dark">
            Are you a member?<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex gap-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="member"
                value="yes"
                checked={isMember === 'yes'}
                onChange={() => {
                  setIsMember('yes');
                  setFormData(prev => ({ ...prev, fullName: '' }));
                  setSelectedMembership('');
                  setPaymentMethod(null);
                  setPaymentReference('');
                  setCaptchaToken(null);
                  if (recaptchaRef.current) recaptchaRef.current.reset();
                }}
                className="accent-accent"
              />
              <span className="font-medium text-md text-brand-dark">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="member"
                value="no"
                checked={isMember === 'no'}
                onChange={() => {
                  setIsMember('no');
                  setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    familyMembers: '',
                  });
                  setSelectedMembership('');
                  setPaymentMethod(null);
                  setPaymentReference('');
                  setCaptchaToken(null);
                  if (recaptchaRef.current) recaptchaRef.current.reset();
                }}
                className="accent-accent"
              />
              <span className="font-medium text-md text-brand-dark">No</span>
            </label>
          </div>
        </div>

        {isMember === 'yes' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name dropdown with emails */}
            <div>
              <label className="block text-sm font-medium mb-1 text-brand-dark">
                Full Name <span className="text-red-500">*</span>
              </label>
              <select
                name="fullName"
                value={formData.fullName}
                onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                required
                className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark
                  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
              >
                <option value="">-- Select Full Name --</option>
                {memberOptions.map((opt, i) => (
                  <option key={i} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Remaining personal info */}
            <div className="grid md:grid-cols-2 gap-4">
              {[
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
                    className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark
                      focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
                  />
                </div>
              ))}
            </div>

            {/* Family Members textarea */}
            <div>
              <label className="block text-sm font-medium mb-1 text-brand-dark">Family Members (Names & Ages)</label>
              <textarea
                name="familyMembers"
                rows={3}
                className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark
                  focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300 resize-none"
                value={formData.familyMembers}
                onChange={handleInputChange}
              />
            </div>

            {/* Membership Plans */}
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-brand-dark mb-4">Choose a Membership Plan</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {membershipTypes.map(type => (
                  <label
                    key={type.id}
                    className={`p-4 rounded-xl border-soft transition-all cursor-pointer ${
                      selectedMembership === type.id ? 'bg-brand-light border-accent' : 'border-accent/20 hover:border-accent/40'
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

            {/* CAPTCHA */}
            <div>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={onCaptchaChange}
                theme="light"
              />
            </div>

            {/* Optional 3% add fee */}
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

            {/* Payment Method */}
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-brand-dark">Choose Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(['paypal', 'zelle', 'cheque', 'stock'] as PaymentMethod[]).map(method => (
                  <button
                    key={method}
                    type="button"
                    className={`border-soft rounded-xl p-4 text-center transition-all ${
                      paymentMethod === method ? 'border-accent bg-brand-light' : 'border-accent/20 hover:border-accent/40'
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

              {paymentMethod && (
                <div className="mt-4">
                  {paymentMethod === 'paypal' ? (
                    <div className="text-brand-dark/70 text-sm md:text-base">
                      No additional information needed for Paypal.
                    </div>
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

              {paymentMethod === 'paypal' && (
                <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light">
                  <form action="https://www.paypal.com/donate" method="post" target="_blank">
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
                      <Image src={zelleQrUrl} alt="Zelle QR" fill className="object-contain" />
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
              className={`w-full btn-primary text-lg py-4 flex items-center justify-center ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className="h-5 w-5 mr-2" />
              Confirm Details
            </button>

          </form>
        )}

        {isMember === 'no' && (
          // Original no-member form with captcha added
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
                    className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-brand-dark">Family Members (Names & Ages)</label>
              <textarea
                name="familyMembers"
                rows={3}
                className="w-full px-4 py-3 border-soft rounded-xl text-sm md:text-base text-brand-dark focus:ring-2 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300 resize-none"
                value={formData.familyMembers}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-semibold text-brand-dark mb-4">Choose a Membership Plan</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {membershipTypes.map(type => (
                  <label
                    key={type.id}
                    className={`p-4 rounded-xl border-soft transition-all cursor-pointer ${
                      selectedMembership === type.id ? 'bg-brand-light border-accent' : 'border-accent/20 hover:border-accent/40'
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

            {/* CAPTCHA */}
            <div>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={onCaptchaChange}
                theme="light"
              />
            </div>

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

            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-4 text-brand-dark">Choose Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(['paypal', 'zelle', 'cheque', 'stock'] as PaymentMethod[]).map(method => (
                  <button
                    key={method}
                    type="button"
                    className={`border-soft rounded-xl p-4 text-center transition-all ${
                      paymentMethod === method ? 'border-accent bg-brand-light' : 'border-accent/20 hover:border-accent/40'
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

              {paymentMethod && (
                <div className="mt-4">
                  {paymentMethod === 'paypal' ? (
                    <div className="text-brand-dark/70 text-sm md:text-base">
                      No additional information needed for Paypal.
                    </div>
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

              {paymentMethod === 'paypal' && (
                <div className="mt-4 border-soft rounded-xl p-4 bg-brand-light">
                  <form action="https://www.paypal.com/donate" method="post" target="_blank">
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
                      <Image src={zelleQrUrl} alt="Zelle QR" fill className="object-contain" />
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
              className={`w-full btn-primary text-lg py-4 flex items-center justify-center ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className="h-5 w-5 mr-2" />
              Confirm Details
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default MembershipPage;
