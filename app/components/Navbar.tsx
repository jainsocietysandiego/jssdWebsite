'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import Image from "next/image";

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
const CACHE_TTL = 1 * 60 * 1000; // 1 minute

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const [pathsalaLevels, setPathsalaLevels] = useState<LevelInfo[]>([]);
  const [committeeList, setCommitteeList] = useState<CommitteeInfo[]>([]);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  // Scroll direction and visibility effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Set scrolled state
      setIsScrolled(currentScrollY > 50);
      
      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setScrollDirection('up');
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
    { name: 'Events', path: '/events', hasDropdown: true },
    { name: 'Membership', path: '/membership', hasDropdown: true },
    { name: 'Groups', path: '', hasDropdown: true },    
    { name: 'Donate', path: '/contribute' },
    { name: 'Media', path: '/gallery' },
    // { name: 'Jinalay', path: '/jinalay' },
  ];

  const membershipOptions = [
    { name: 'Membership', path: '/membership' },
    { name: 'Newsletter', path: '/membership/newsletter' },
  ];
 
  const aboutUsOptions = [
    { name: 'About Us', path: '/about' },
    { name: 'History', path: '/about/history' },
    { name: 'JSSD Policies', path: '/about/policies' },
    { name: 'Executive Committee', path: '/about/ec' },
    { name: 'Board of Directors', path: '/about/bod' },
  ];

  const EventsOptions = [
    { name: 'Events', path: '/events' },
    { name: 'Panchang', path: '/events/panchang' },
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
    if (itemName === 'Events') return EventsOptions;
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
        scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
      } ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between items-center h-[8vh] sm:h-[12vh]">
          {/* Logo */}
         <Link href="/" className="flex items-center text-2xl font-bold text-orange-600 hover:text-orange-700">
  <Image
    src="/logo3.png"
    alt="JSSD Logo"
    width={150}
    height={50}
    className="w-auto transition-all duration-200 h-[clamp(4vh,5vh,7vh)] sm:h-[clamp(6vh,7vh,10vh)]"
    priority
  />
</Link>


          {/* Desktop Nav - Improved spacing */}
          <div className="hidden md:flex flex-1 justify-end">
            <div className="flex items-baseline">
              {navItems.map((item, index) => (
                <div
                  key={item.name}
                  className={` relative ${index > 0 ? 'ml-4' : ''}`}
                  onMouseEnter={() => item.hasDropdown && handleMouseEnter(item.name)}
                  onMouseLeave={() => item.hasDropdown && handleMouseLeave()}
                >
                  {item.hasDropdown ? (
                    <>
                      {item.path ? (
                        <Link
                          href={item.path}
                          className={`inline-flex items-center px-3 py-2 text-sm xl:text-base font-medium transition-colors whitespace-nowrap ${
                            pathname === item.path
                              ? "text-orange-600 border-b-2 border-orange-600"
                              : "text-gray-700 hover:text-orange-600"
                          }`}
                        >
                          {item.name}
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center px-3 py-2 text-sm xl:text-base font-medium text-gray-700 hover:text-orange-600 cursor-pointer whitespace-nowrap">
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
                                className="block px-4 py-2 text-sm xl:text-base text-gray-700 hover:bg-orange-50 hover:text-orange-600"
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
                      className={`inline-block px-3 py-2 text-base font-medium transition-colors whitespace-nowrap ${
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
