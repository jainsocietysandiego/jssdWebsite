'use client';

import React from 'react';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="bg-orange-50 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Logo + Social Icons */}
        <div className="flex flex-col items-center space-y-4 mb-12">
          <Image src="/Jain_Mandir.png" alt="JSSD Logo" width={80} height={80} />
          <h3 className="text-3xl font-bold text-orange-700">JSSD</h3>
          <div className="flex space-x-6">
            <a href="#"><Image src="/icons/email.png" alt="Email" width={30} height={30} /></a>
            <a href="#"><Image src="/icons/youtube.png" alt="YouTube" width={30} height={30} /></a>
            <a href="#"><Image src="/icons/whatsapp.png" alt="WhatsApp" width={30} height={30} /></a>
            <a href="#"><Image src="/icons/facebook.png" alt="Facebook" width={30} height={30} /></a>
            <a href="#"><Image src="/icons/instagram.png" alt="Instagram" width={30} height={30} /></a>
            <a href="#"><Image src="/icons/linkedin.png" alt="LinkedIn" width={30} height={30} /></a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-300 pt-4">
          {/* Left - Copyright */}
          <div className="text-gray-700 text-sm mb-2 md:mb-0">
            © JSSD 2024. We love our community!
          </div>

          {/* Center - Jain Quote */}
          <div className="text-gray-700 text-sm italic text-center">
            "Ahimsa Paramo Dharma" – Non-violence is the highest duty
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
