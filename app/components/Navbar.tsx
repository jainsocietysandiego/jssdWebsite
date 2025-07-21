'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null); // 🧠 Timeout for delayed hide

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Pathshala', path: '/pathsala', hasDropdown: true },
    { name: 'Donate', path: '/contribute' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Membership', path: '/membership', hasDropdown: true },
    { name: 'Feedback', path: '/feedback' },
    { name: 'Jinalay', path: '/jinalay' },
  ];

  const pathsalaLevels = [
    { name: 'Level 1', path: '/pathsala/level-1' },
    { name: 'Level 2', path: '/pathsala/level-2' },
    { name: 'Level 3', path: '/pathsala/level-3' },
    { name: 'Level 4', path: '/pathsala/level-4' },
    { name: 'Level 5', path: '/pathsala/level-5' },
    { name: 'Level 6', path: '/pathsala/level-6' },
    { name: 'Level 7', path: '/pathsala/level-7' },
  ];

  const membershipOptions = [
    { name: 'Subscribe to mailing list', path: '/membership/subscribe' },
    { name: 'Newsletter', path: '/membership/newsletter' },
  ];

  const getDropdownItems = (itemName: string) => {
    if (itemName === 'Pathshala') return pathsalaLevels;
    if (itemName === 'Membership') return membershipOptions;
    return [];
  };

  // 🧠 Dropdown delay logic
  const handleMouseEnter = (name: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setHoveredDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setHoveredDropdown(null);
    }, 300); // 300ms delay
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-orange-600 hover:text-orange-700 transition-colors">
              JSSD
            </Link>
          </div>

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

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-orange-600 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-md">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`block px-3 py-2 text-base font-medium transition-colors ${
                  pathname === item.path
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
