'use client';

import React, { useEffect } from 'react';
import { X, Star, Users, Utensils } from 'lucide-react';

interface LunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lunch: Record<string, string>; // dynamic content keys and values
}

const LunchModal: React.FC<LunchModalProps> = ({ isOpen, onClose, lunch }) => {
  // Handle escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Gather all sponsor guidelines dynamically
  const sponsorGuidelines: string[] = [];
  Object.keys(lunch)
    .filter((key) => key.toLowerCase().startsWith('sponsorguideline'))
    .sort() // sort by key to maintain order
    .forEach((key) => sponsorGuidelines.push(lunch[key]));

  // Gather all cleanup guidelines dynamically
  const cleanupGuidelines: string[] = [];
  Object.keys(lunch)
    .filter((key) => key.toLowerCase().startsWith('cleanup'))
    .filter((key) => !['cleanupTitle', 'cleanupIntro'].includes(key))
    .sort()
    .forEach((key) => cleanupGuidelines.push(lunch[key]));

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 sm:p-8 border-b border-orange-100 rounded-t-xl">
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-full mr-3">
              <Utensils className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">
              {lunch.sponsorTitle || 'Sponsoring Lunches For Pathshala'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
          {/* Introduction */}
          <div className="space-y-4">
            {lunch.sponsorIntro1 && (
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{lunch.sponsorIntro1}</p>
            )}
            {lunch.sponsorIntro2 && (
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{lunch.sponsorIntro2}</p>
            )}
            {lunch.sponsorIntro3 && (
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{lunch.sponsorIntro3}</p>
            )}
          </div>

          {/* Sponsoring Guidelines */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 sm:p-6 rounded-xl border border-orange-200">
            <h3 className="text-lg sm:text-xl font-bold text-orange-700 mb-4 sm:mb-6 flex items-center">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              {lunch.sponsorGuidelinesTitle || 'Lunch Sponsoring Guidelines'}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {sponsorGuidelines.map((guideline, i) => (
                <div key={i} className="flex items-start">
                  <span className="text-orange-600 mr-3 mt-1 text-lg font-semibold">•</span>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{guideline}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cleanup Guidelines */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 sm:p-6 rounded-xl border border-amber-200">
            <h3 className="text-lg sm:text-xl font-bold text-amber-700 mb-4 flex items-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              {lunch.cleanupTitle || 'Guidelines for cleaning up after Lunch'}
            </h3>
            {lunch.cleanupIntro && (
              <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">{lunch.cleanupIntro}</p>
            )}
            <div className="space-y-3">
              {cleanupGuidelines.map((task, i) => (
                <div key={i} className="flex items-start">
                  <span className="text-amber-600 mr-3 font-semibold bg-amber-100 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{task}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              {lunch.closeLabel || 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LunchModal;
