'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import Image from "next/image"; // Import Next.js optimized Image

interface LevelInfo {
  Level: number;
  Title: string;
}
interface CommitteeInfo {
  Slug: string;
  'Committee Name': string;
}

const GROUP_CACHE_KEY = 'navbar-groups';
const COMMITTEES_API_URL =
  'https://script.google.com/macros/s/AKfycbyiANfsf4RIKXvBMFuDSeNpuSQ_hITNSb_WbAphTtUk-u8GKhcyfB061dLLsAS7wVXC/exec';
const GROUP_FALLBACK_JSON = '/group.json';

const LEVELS_API_URL =
  'https://script.google.com/macros/s/AKfycbyHVNzO5Wbr-OBUAD_KPKPazFsZWz4ak7LONoccChBmZnAmnINE6cUbcnmH_647G5urKw/exec';
const LOCAL_JSON_PATH = '/pathsala.json';
const CACHE_KEY = 'navbar-pathshala-levels';
const CACHE_TTL = 1 * 60 * 1000; // 10 minutes

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const [pathsalaLevels, setPathsalaLevels] = useState<LevelInfo[]>([]);
  const [committeeList, setCommitteeList] = useState<CommitteeInfo[]>([]);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCommittees = async () => {
      const cached = localStorage.getItem(GROUP_CACHE_KEY);
      let shouldFetch = true;

      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setCommitteeList(data);
            shouldFetch = false;
          }
        } catch {}
      }

      if (committeeList.length === 0 && shouldFetch) {
        try {
          const fallback = await fetch(GROUP_FALLBACK_JSON);
          if (fallback.ok) {
            const fallbackData = await fallback.json();
            if (fallbackData?.committees?.length) {
              setCommitteeList(fallbackData.committees);
            }
          }
        } catch {
          console.warn('⚠️ Failed to load fallback group.json');
        }
      }

      try {
        const res = await fetch(COMMITTEES_API_URL);
        const json = await res.json();
        if (json.committees?.length) {
          const minimalData = json.committees.map((c: any) => ({
            Slug: c.Slug,
            'Committee Name': c['Committee Name'],
          }));
          setCommitteeList(minimalData);
          localStorage.setItem(
            GROUP_CACHE_KEY,
            JSON.stringify({ data: minimalData, timestamp: Date.now() })
          );
        }
      } catch (err) {
        console.error('❌ Failed to load committees:', err);
      }
    };

    fetchCommittees();
  }, []);

  useEffect(() => {
    const loadLevels = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      let shouldFetch = true;

      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setPathsalaLevels(cachedData);
            shouldFetch = false;
          }
        } catch {}
      }

      if (pathsalaLevels.length === 0 && shouldFetch) {
        try {
          const res = await fetch(LOCAL_JSON_PATH);
          if (res.ok) {
            const localData = await res.json();
            setPathsalaLevels(localData.levels);
          }
        } catch {
          console.warn('⚠️ Failed to load fallback pathsala.json');
        }
      }

      try {
        const res = await fetch(LEVELS_API_URL);
        const remoteData = await res.json();
        if (remoteData?.levels?.length) {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: remoteData.levels, timestamp: Date.now() })
          );
          if (JSON.stringify(remoteData.levels) !== JSON.stringify(pathsalaLevels)) {
            setPathsalaLevels(remoteData.levels);
          }
        }
      } catch {
        console.warn('⚠️ Background fetch for levels failed');
      }
    };

    loadLevels();
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about', hasDropdown: true },
    { name: 'Pathshala', path: '/pathsala', hasDropdown: true },
    { name: 'Donate', path: '/contribute' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Membership', path: '/membership', hasDropdown: true },
    { name: 'Groups', path: '', hasDropdown: true },
    { name: 'Jinalay', path: '/jinalay' },
  ];

  const membershipOptions = [
    { name: 'Membership', path: '/membership' },
    { name: 'Newsletter', path: '/membership/newsletter' },
  ];

  const aboutUsOptions = [
    { name: 'About Us', path: '/about' },
    { name: 'History', path: '/about/history' },
    { name: 'JSSD Policies', path: '/about/policies' },
    { name: 'EC & BOD', path: '/about/bod' },
  ];

  const getDropdownItems = (itemName: string) => {
    if (itemName === 'Pathshala') {
      return [
        { name: 'Pathshala', path: '/pathsala' },
        ...pathsalaLevels.map((lvl) => ({
          name: `Level ${lvl.Level}`,
          path: `/pathsala/level-${lvl.Level}`,
        })),
      ];
    }
    if (itemName === 'Groups') {
      return committeeList.map((c) => ({
        name: c['Committee Name'],
        path: `/group/${c.Slug}`,
      }));
    }
    if (itemName === 'Membership') return membershipOptions;
    if (itemName === 'About') return aboutUsOptions;
    return [];
  };

  const handleMouseEnter = (name: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setHoveredDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setHoveredDropdown(null), 300);
  };


return (
  <nav
    className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white/80 backdrop-blur-sm"
    }`}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
       <Link href="/" className="flex items-center text-2xl font-bold text-orange-600 hover:text-orange-700">
          <Image
            src="/logo.png"
            alt="JSSD Logo"
            width={140}
            height={40}
            className="h-8 w-auto sm:h-10 transition-all duration-200 mr-4" // Added mr-2 for spacing
            priority
          />
          <span>JSSD</span> {/* Wrap text in a span for better control/consistency */}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:block">
          <div className="ml-10 flex items-baseline space-x-8">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.hasDropdown && handleMouseEnter(item.name)}
                onMouseLeave={() => item.hasDropdown && handleMouseLeave()}
              >
                {item.hasDropdown ? (
                  <>
                    {item.path ? (
                      <Link
                        href={item.path}
                        className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                          pathname === item.path
                            ? "text-orange-600 border-b-2 border-orange-600"
                            : "text-gray-700 hover:text-orange-600"
                        }`}
                      >
                        {item.name}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 cursor-pointer">
                        {item.name}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </span>
                    )}
                    {hoveredDropdown === item.name && (
                      <div className="absolute left-0 mt-1 w-72 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1 max-h-96 overflow-y-auto">
                          {getDropdownItems(item.name).map((opt) => (
                            <Link
                              key={opt.name}
                              href={opt.path}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                            >
                              {opt.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === item.path
                        ? "text-orange-600 border-b-2 border-orange-600"
                        : "text-gray-700 hover:text-orange-600"
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </div>

    {/* Mobile Menu */}
    {isOpen && (
      <div className="md:hidden bg-white px-4 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const hasDropdown = item.hasDropdown;
          const isOpenDropdown = openMobileDropdown === item.name;

          return (
            <div key={item.name} className="border-b border-gray-200 py-2">
              <div className="flex justify-between items-center">
                {item.path ? (
                  <Link
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-base font-medium ${
                      isActive ? "text-orange-600" : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className="text-base font-medium text-gray-700">{item.name}</span>
                )}
                {hasDropdown && (
                  <button
                    onClick={() =>
                      setOpenMobileDropdown(isOpenDropdown ? null : item.name)
                    }
                    className="text-gray-500 hover:text-orange-600 focus:outline-none"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transform transition-transform ${
                        isOpenDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {hasDropdown && isOpenDropdown && (
                <div className="mt-2 pl-4 space-y-1">
                  {getDropdownItems(item.name).map((opt) => (
                    <Link
                      key={opt.name}
                      href={opt.path}
                      onClick={() => setIsOpen(false)}
                      className="block text-sm text-gray-700 hover:text-orange-600"
                    >
                      {opt.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
  </nav>
);
};

export default Navbar;
