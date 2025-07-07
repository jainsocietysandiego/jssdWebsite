import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-orange-900 to-orange-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Jain Society of San Diego</h3>
            <p className="text-orange-100 mb-4">
              A 501(c)(3) non-profit religious organization dedicated to practicing, 
              promoting, and preserving the Jain religion in the San Diego community.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-orange-200 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-orange-200 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-orange-200 hover:text-white transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-orange-100">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/pathsala" className="hover:text-white transition-colors">Pathsala</a></li>
              <li><a href="/events" className="hover:text-white transition-colors">Events</a></li>
              <li><a href="/membership" className="hover:text-white transition-colors">Membership</a></li>
              <li><a href="/jinalay" className="hover:text-white transition-colors">Jinalay Project</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-orange-100">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <span>jssd@example.org</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5" />
                <span>
                  123 Temple Street<br />
                  San Diego, CA 92101
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-orange-700 mt-8 pt-8 text-center text-orange-200">
          <p>&copy; 2025 Jain Society of San Diego. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;