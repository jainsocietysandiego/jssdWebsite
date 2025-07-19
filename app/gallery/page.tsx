'use client'

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const images = [
    {
      id: 1,
      url: 'https://images.pexels.com/photos/8369648/pexels-photo-8369648.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Mahavir Jayanti Celebration 2024',
      category: 'festivals',
      description: 'Community gathering celebrating Lord Mahavir\'s birth anniversary'
    },
    {
      id: 2,
      url: 'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
      title: 'Pathshala Students Learning',
      category: 'pathsala',
      description: 'Young students engaged in Jain philosophy and culture education'
    },
    {
      id: 3,
      url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Paryushan Parv 2024',
      category: 'festivals',
      description: 'Eight-day festival of forgiveness and spiritual purification'
    },
    {
      id: 4,
      url: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Community Kitchen Service',
      category: 'community',
      description: 'Volunteers preparing meals for community events and charitable causes'
    },
    {
      id: 5,
      url: 'https://images.pexels.com/photos/1181319/pexels-photo-1181319.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Diwali Decorations',
      category: 'festivals',
      description: 'Beautiful traditional decorations for the festival of lights'
    },
    {
      id: 6,
      url: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Pathshala Cultural Program',
      category: 'pathsala',
      description: 'Students performing traditional dance and music'
    },
    {
      id: 7,
      url: 'https://images.pexels.com/photos/1181534/pexels-photo-1181534.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Yoga and Meditation Session',
      category: 'wellness',
      description: 'Community members practicing yoga and meditation for spiritual wellness'
    },
    {
      id: 8,
      url: 'https://images.pexels.com/photos/1181248/pexels-photo-1181248.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Community Potluck Dinner',
      category: 'community',
      description: 'Monthly gathering with shared meals and fellowship'
    },
    {
      id: 9,
      url: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Charity Food Distribution',
      category: 'community',
      description: 'Serving the broader community through food donation programs'
    },
    {
      id: 10,
      url: 'https://images.pexels.com/photos/1181522/pexels-photo-1181522.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Jinalay Project Groundbreaking',
      category: 'jinalay',
      description: 'Beginning of construction for our new temple facility'
    },
    {
      id: 11,
      url: 'https://images.pexels.com/photos/1181580/pexels-photo-1181580.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Traditional Prayer Session',
      category: 'spiritual',
      description: 'Daily prayer and meditation gathering at the community center'
    },
    {
      id: 12,
      url: 'https://images.pexels.com/photos/1181623/pexels-photo-1181623.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Youth Leadership Workshop',
      category: 'pathsala',
      description: 'Training young community members for future leadership roles'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Photos', count: images.length },
    { id: 'festivals', name: 'Festivals', count: images.filter(img => img.category === 'festivals').length },
    { id: 'pathsala', name: 'Pathsala', count: images.filter(img => img.category === 'pathsala').length },
    { id: 'community', name: 'Community Service', count: images.filter(img => img.category === 'community').length },
    { id: 'jinalay', name: 'Jinalay Project', count: images.filter(img => img.category === 'jinalay').length },
    { id: 'spiritual', name: 'Spiritual Activities', count: images.filter(img => img.category === 'spiritual').length },
    { id: 'wellness', name: 'Wellness Programs', count: images.filter(img => img.category === 'wellness').length }
  ];

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  const openLightbox = (imageId: number) => {
    setSelectedImage(imageId);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    } else {
      newIndex = currentIndex < filteredImages.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedImage(filteredImages[newIndex].id);
  };

  const selectedImageData = selectedImage 
    ? images.find(img => img.id === selectedImage)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Navbar />
      <main>
        <div className="pt-16">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Community Gallery</h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Capturing precious moments from our community events, celebrations, and activities
              </p>
            </div>
          </div>

          {/* Category Filter */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-center gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-6 py-3 rounded-full font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Photo Grid */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => openLightbox(image.id)}
                  >
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="text-white text-center p-4">
                          <h3 className="text-lg font-semibold mb-2">{image.title}</h3>
                          <p className="text-sm opacity-90">{image.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Lightbox */}
          {selectedImage && selectedImageData && (
            <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
              <div className="relative max-w-4xl w-full">
                <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                >
                  <X className="h-8 w-8" />
                </button>
                
                <button
                  onClick={() => navigateImage('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                
                <button
                  onClick={() => navigateImage('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>

                <img
                  src={selectedImageData.url}
                  alt={selectedImageData.title}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{selectedImageData.title}</h3>
                  <p className="text-lg opacity-90">{selectedImageData.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Photo Albums */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Albums</h2>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  Explore our most popular photo collections from recent events
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/8369648/pexels-photo-8369648.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Mahavir Jayanti 2024"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Mahavir Jayanti 2024</h3>
                    <p className="text-gray-600 mb-4">
                      Beautiful moments from our grand celebration of Lord Mahavir's birth anniversary
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">25 photos</span>
                      <button
                        onClick={() => setSelectedCategory('festivals')}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        View Album
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800"
                    alt="Pathsala Activities"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Pathshala Activities</h3>
                    <p className="text-gray-600 mb-4">
                      Students learning and growing through our educational programs
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">18 photos</span>
                      <button
                        onClick={() => setSelectedCategory('pathsala')}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        View Album
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Community Service"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Service</h3>
                    <p className="text-gray-600 mb-4">
                      Our volunteers making a difference in the broader community
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">12 photos</span>
                      <button
                        onClick={() => setSelectedCategory('community')}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        View Album
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;