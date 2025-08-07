'use client';

import React from 'react';
import {
  Building,
  Calendar,
  DollarSign,
  Users,
  Target,
  Heart,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';

const Jinalay: React.FC = () => {
  const progressPercentage = 65;           // Current fundraising progress
  const goalAmount         = 2_500_000;    // $2.5 million goal
  const raisedAmount       = 1_625_000;    // $1.625 million raised

  const milestones = [
    { phase: 'Land Acquisition',        status: 'completed',  date: '2022-03-15' },
    { phase: 'Architectural Design',    status: 'completed',  date: '2022-08-20' },
    { phase: 'City Permits',            status: 'completed',  date: '2023-01-10' },
    { phase: 'Groundbreaking',          status: 'completed',  date: '2023-06-15' },
    { phase: 'Foundation Work',         status: 'in-progress',date: '2024-01-01' },
    { phase: 'Structural Construction', status: 'upcoming',   date: '2024-06-01' },
    { phase: 'Interior Work',           status: 'upcoming',   date: '2025-01-01' },
    { phase: 'Grand Opening',           status: 'upcoming',   date: '2025-08-15' },
  ];

  const donationTiers = [
    {
      amount: 1_000,
      title: 'Stone Supporter',
      benefits: [
        'Name engraved on donor wall',
        'Special recognition ceremony',
        'Monthly progress updates',
      ],
      donors: 45,
    },
    {
      amount: 5_000,
      title: 'Pillar Patron',
      benefits: [
        'Dedicated plaque',
        'VIP opening ceremony invitation',
        'Annual donor appreciation event',
      ],
      donors: 28,
    },
    {
      amount: 10_000,
      title: 'Foundation Friend',
      benefits: [
        'Room dedication opportunity',
        'Lifetime honorary membership',
        'Personal meeting with architect',
      ],
      donors: 15,
    },
    {
      amount: 25_000,
      title: 'Heritage Guardian',
      benefits: [
        'Major facility naming rights',
        'Permanent memorial installation',
        'Board consultation privilege',
      ],
      donors: 8,
    },
  ];

  return (
    <div className="min-h-screen bg-brand-light pt-[8vh] sm:pt-[12vh]">
      {/* ────────── HERO ────────── */}

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
                Jinalay Project
              </h1>
              <p className="mt-2 max-w-4xl mx-auto text-white text-sm sm:text-base md:text-lg text-center">
                Building a sacred space for future generations - our new temple complex
              </p>
            </div>
          </section>


     

      <main>

        {/* ────────── VISION ────────── */}
        <section className="py-20 bg-brand-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Heading */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-brand-dark mb-4">
                Our Vision
              </h2>
              <p className="max-w-3xl mx-auto text-brand-dark/70">
                The Jinalay Project represents our commitment to creating a
                spiritual haven that will serve our community for generations
                to come. This sacred space will be a center for worship,
                education, and cultural preservation.
              </p>
            </div>

            {/* Content */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <img
                src="https://images.pexels.com/photos/161158/governor-s-island-india-temple-161158.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Jinalay architectural design"
                className="w-full h-96 object-cover rounded-xl shadow-soft"
              />

              {/* Features */}
              <div className="space-y-6 bg-brand-light p-6 rounded-xl shadow-soft border border-accent/10">
                <h3 className="text-2xl font-bold text-accent mb-4">
                  Project Features
                </h3>
                {[
                  'Main prayer hall with capacity for 500 devotees',
                  'Dedicated Pathshala classrooms and library',
                  'Community kitchen and dining hall',
                  'Administrative offices and meeting rooms',
                  'Meditation garden and peaceful outdoor spaces',
                  'Modern facilities with traditional architectural design',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-accent rounded-full mt-2" />
                    <p className="text-brand-dark/80">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ────────── CONSTRUCTION PROGRESS ────────── */}
        <section className="py-20 bg-brand-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Heading */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-brand-dark mb-4">
                Construction Progress
              </h2>
              <p className="text-brand-dark/70 max-w-3xl mx-auto">
                Track our journey from groundbreaking to grand opening.
              </p>
            </div>

            {/* Milestones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {milestones.map((m, i) => {
                const state =
                  m.status === 'completed'
                    ? 'green'
                    : m.status === 'in-progress'
                    ? 'orange'
                    : 'gray';
                return (
                  <div
                    key={i}
                    className={`p-6 rounded-xl border-2 bg-${state}-50 border-${state}-200`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full mx-auto mb-4 flex items-center justify-center bg-${state}-600 text-brand-light`}
                    >
                      {i + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-brand-dark text-center mb-1">
                      {m.phase}
                    </h3>
                    <p className="text-sm text-brand-dark/60 text-center">
                      {new Date(m.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <span
                      className={`block w-fit mx-auto mt-3 text-xs font-semibold px-3 py-1 rounded-full bg-${state}-100 text-${state}-800`}
                    >
                      {m.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Current Status Summary */}
            <div className="bg-brand-white p-8 rounded-xl shadow-soft border border-accent/10">
              <h3 className="text-2xl font-bold text-center text-brand-dark mb-6">
                Current Status
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <StatusCard
                  icon={<Building className="h-10 w-10 text-accent" />}
                  label="Construction Phase"
                  value="Foundation & Structural"
                />
                <StatusCard
                  icon={<Calendar className="h-10 w-10 text-accent" />}
                  label="Expected Completion"
                  value="August 2025"
                />
                <StatusCard
                  icon={<Users className="h-10 w-10 text-accent" />}
                  label="Capacity"
                  value="500 Devotees"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ────────── FUNDRAISING ────────── */}
        <section className="py-20 bg-brand-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Heading */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-brand-dark mb-4">
                Fundraising Progress
              </h2>
              <p className="text-brand-dark/70 max-w-3xl mx-auto">
                Together, we’re building something extraordinary.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="bg-brand-white p-8 rounded-xl shadow-soft border border-accent/10 mb-12">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-6">
                <Metric label="Raised"   value={`$${raisedAmount.toLocaleString()}`} />
                <Metric label="Goal"     value={`$${goalAmount.toLocaleString()}`} dark />
              </div>

              <div className="relative">
                <div className="w-full bg-brand-light/50 h-6 rounded-full" />
                <div
                  className="absolute top-0 left-0 h-6 rounded-full bg-gradient-to-r from-accent to-brand-dark transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-light">
                    {progressPercentage}%
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={<DollarSign className="h-8 w-8 text-accent" />}
                  value={`$${(goalAmount - raisedAmount).toLocaleString()}`}
                  label="Remaining"
                />
                <StatCard
                  icon={<Users className="h-8 w-8 text-accent" />}
                  value="96"
                  label="Donors"
                />
                <StatCard
                  icon={<Target className="h-8 w-8 text-accent" />}
                  value="12 months"
                  label="To completion"
                />
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <a
                href="/contribute"
                className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4 rounded-xl"
              >
                <Heart className="h-5 w-5" />
                Contribute to Jinalay
              </a>
            </div>
          </div>
        </section>

        {/* ────────── DONATION TIERS ────────── */}
        <section className="py-20 bg-brand-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Heading */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-brand-dark mb-4">
                Donation Tiers
              </h2>
              <p className="text-brand-dark/70 max-w-3xl mx-auto">
                Choose a level of support that reflects your commitment.
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {donationTiers.map((t, i) => (
                <div
                  key={i}
                  className="bg-brand-white p-6 rounded-xl shadow-soft border-t-4 border-accent flex flex-col"
                >
                  <div className="text-center mb-6">
                    <p className="text-3xl font-bold text-accent mb-2">
                      ${t.amount.toLocaleString()}
                    </p>
                    <h3 className="text-xl font-semibold text-brand-dark">
                      {t.title}
                    </h3>
                    <p className="text-sm text-brand-dark/60 mt-1">
                      {t.donors} donors
                    </p>
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    {t.benefits.map((b, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-accent rounded-full mt-2" />
                        <p className="text-brand-dark/80 text-sm">{b}</p>
                      </div>
                    ))}
                  </div>

                  <a
                    href="/contribute"
                    className="btn-primary block w-full text-center py-3 rounded-lg font-medium"
                  >
                    Donate ${t.amount.toLocaleString()}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ────────── IMPACT ────────── */}
        <section className="py-20 bg-white to-brand-dark text-brand-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl text-accent font-bold mb-6">Building for the Future</h2>

            <p className="max-w-4xl mx-auto text-lg md:text-xl mb-10 text-gray-700">
              The Jinalay Project is more than just a building—it is a foundation
              for preserving our sacred traditions, educating our children, and
              strengthening community bonds.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ImpactStat value="500+" label="Families Served" />
              <ImpactStat value="100+" label="Pathshala Students" />
              <ImpactStat value="50+"  label="Annual Events" />
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

/* ────────── Small, Reusable UI Pieces ────────── */
const StatusCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="bg-brand-light rounded-xl p-6 text-center shadow-soft border border-accent/10 items-center flex flex-col">
    {icon}
    <p className="mt-4 font-semibold text-brand-dark">{label}</p>
    <p className="text-brand-dark/70">{value}</p>
  </div>
);

const Metric = ({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) => (
  <div className="text-center">
    <p className={`text-3xl font-bold ${dark ? 'text-brand-dark' : 'text-accent'}`}>
      {value}
    </p>
    <p className="text-brand-dark/70">{label}</p>
  </div>
);

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) => (
  <div className="text-center p-6 bg-brand-light rounded-xl  shadow-soft border border-accent/10">
    {icon}
    <p className="text-2xl font-bold text-brand-dark mt-2">{value}</p>
    <p className="text-brand-dark">{label}</p>
  </div>
);

const ImpactStat = ({ value, label }: { value: string; label: string }) => (
  <div>
    <p className="text-4xl font-bold text-accent">{value}</p>
    <p className="text-gray-700">{label}</p>
  </div>
);

export default Jinalay;
