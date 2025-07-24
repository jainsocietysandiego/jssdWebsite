'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import axios from 'axios';

interface LevelInfo {
  level: string;
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [pathsalaLevels, setPathsalaLevels] = useState<LevelInfo[]>([]);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await axios.get('https://script.google.com/macros/s/AKfycbyHVNzO5Wbr-OBUAD_KPKPazFsZWz4ak7LONoccChBmZnAmnINE6cUbcnmH_647G5urKw/exec'); // 🔁 replace later
        const allLevels = res.data.levels || [];

        const extracted: LevelInfo[] = allLevels.map((lvl: any) => ({
        level: lvl.Level,
      }));


        setPathsalaLevels(extracted);
      } catch (error) {
        console.error('❌ Error fetching levels for Navbar:', error);
      }
    };

    fetchLevels();
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about', hasDropdown: true },
    { name: 'Pathshala', path: '/pathsala', hasDropdown: true },
    { name: 'Donate', path: '/contribute' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Membership', path: '/membership', hasDropdown: true },
    { name: 'Feedback', path: '/feedback' },
    { name: 'Jinalay', path: '/jinalay' },
  ];

  const membershipOptions = [
    { name: 'Membership', path: '/membership' },
    { name: 'Subscribe to mailing list', path: '/membership/mailing-list' },
    { name: 'Newsletter', path: '/membership/newsletter' },
  ];

  const aboutUsOptions = [
    { name: 'About Us', path: '/about' },
    { name: 'History', path: '/about/history' },
    { name: 'JSSD Policies ', path: '/about/policies' },
    { name: 'EC & BOD ', path: '/about/bod' }
  ];

  const getDropdownItems = (itemName: string) => {
  if (itemName === 'Pathshala') {
    return pathsalaLevels?.length > 0
      ? pathsalaLevels.map((lvl) => ({
          name: `Level ${lvl.level}`,
          path: `/pathsala/level-${lvl.level}`,
        }))
      : [];
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
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors">
            JSSD
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
                      <Link
                        href={item.path}
                        className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                          pathname === item.path
                            ? 'text-orange-600 border-b-2 border-orange-600'
                            : 'text-gray-700 hover:text-orange-600'
                        }`}
                      >
                        {item.name}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Link>
                      {hoveredDropdown === item.name && (
                        <div className="absolute left-0 mt-1 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                          <div className="py-1">
                            {getDropdownItems(item.name).map((opt) => (
                              <Link
                                key={opt.name}
                                href={opt.path}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
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
                          ? 'text-orange-600 border-b-2 border-orange-600'
                          : 'text-gray-700 hover:text-orange-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-orange-600 hover:bg-orange-50 focus:outline-none transition"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white px-4 py-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`block px-3 py-2 text-base font-medium ${
                pathname === item.path ? 'text-orange-600' : 'text-gray-700'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
