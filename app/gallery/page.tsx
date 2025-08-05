'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';

// 🔹 Your Google Sheets JSON API endpoint
const GOOGLE_SHEET_API =
  'https://script.google.com/macros/s/AKfycby8FhcIhNDX4iDgaGeIs4oBbZiCFVJrexU-77H0fJbdEl47ij2PDc5pbdj-jojD8GmuHA/exec';

// Type definitions
interface ImageData {
  ID: string | number;
  Title: string;
  Description: string;
  Category: string;
  DriveFileName: string;
  ImageURL: string;
}

interface AlbumData {
  AlbumID: string | number;
  AlbumTitle: string;
  AlbumDescription: string;
  AlbumURL: string;
  AlbumThumbnailFileName: string;
  AlbumThumbnailURL: string;
}

interface ApiResponse {
  images: ImageData[];
  albums: AlbumData[];
  debug?: {
    totalFiles: number;
    imagesWithUrls: number;
    timestamp: string;
  };
  error?: string;
}

const Gallery: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [albums, setAlbums] = useState<AlbumData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(GOOGLE_SHEET_API)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: ApiResponse) => {
        console.log('Raw API Response:', data);
        
        // Check if there's an error from the Apps Script
        if (data.error) {
          throw new Error(`Apps Script Error: ${data.error}`);
        }
        
        // Log debug info if available
        if (data.debug) {
          console.log('Apps Script Debug Info:', data.debug);
        }
        
        // Use images directly from Apps Script (should already have correct URLs)
        const validImages = (data.images || []).filter((img: ImageData) => 
          img.ImageURL && img.ImageURL.trim().length > 0
        );
        
        console.log('Valid images:', validImages);
        
        setImages(validImages);
        setAlbums(data.albums || []);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError('Failed to load gallery data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredImages =
    selectedCategory === 'all'
      ? images
      : images.filter((img: ImageData) => img.Category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Photos', count: images.length },
    ...Array.from(new Set(images.map((img: ImageData) => img.Category))).map(cat => ({
      id: cat,
      name: cat?.charAt(0).toUpperCase() + cat?.slice(1) || 'Unknown',
      count: images.filter((img: ImageData) => img.Category === cat).length,
    })),
  ];

  const openLightbox = (id: number) => setSelectedImage(id);
  const closeLightbox = () => setSelectedImage(null);

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    const currentIndex = filteredImages.findIndex(
      (img: ImageData) => Number(img.ID) === selectedImage
    );
    let newIndex =
      direction === 'prev'
        ? currentIndex > 0
          ? currentIndex - 1
          : filteredImages.length - 1
        : currentIndex < filteredImages.length - 1
        ? currentIndex + 1
        : 0;
    setSelectedImage(Number(filteredImages[newIndex].ID));
  };

  const selectedImageData = selectedImage
    ? images.find((img: ImageData) => Number(img.ID) === selectedImage)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gallery...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Hero */}
      <section className="pt-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Community Gallery</h1>
        <p className="text-xl opacity-90">
          Capturing precious moments from our community events, celebrations, and activities
        </p>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-white">
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </section>

      {/* Image Grid */}
      <section className="py-20 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
          {filteredImages.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No images found for this category.</p>
            </div>
          ) : (
            filteredImages.map((image: ImageData) => (
              <div
                key={image.ID}
                className="group cursor-pointer rounded-lg shadow-lg bg-white overflow-hidden transition-all hover:shadow-xl relative"
                style={{ height: '300px' }}
                onClick={() => openLightbox(Number(image.ID))}
              >
                {image.ImageURL && (
                  <img
                    src={image.ImageURL}
                    alt={image.Title || 'Gallery image'}
                    className="object-cover"
                    onError={(e) => {
                      console.error('Failed to load image:', image.ImageURL);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                    <h3 className="font-semibold text-lg mb-2">{image.Title}</h3>
                    <p className="text-sm">{image.Description}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImageData && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button 
            onClick={closeLightbox} 
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2"
          >
            <X size={32} />
          </button>
          <button
            onClick={() => navigateImage('prev')}
            className="absolute left-4 text-white hover:text-gray-300 z-10 p-2"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={() => navigateImage('next')}
            className="absolute right-4 text-white hover:text-gray-300 z-10 p-2"
          >
            <ChevronRight size={32} />
          </button>
          
          <div className="relative max-w-4xl max-h-[80vh] w-full h-full">
            {selectedImageData.ImageURL && (
              <img
                src={selectedImageData.ImageURL}
                alt={selectedImageData.Title || 'Gallery image'}
                className=" object-contain"
              />
            )}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{selectedImageData.Title}</h3>
            <p className="text-gray-200">{selectedImageData.Description}</p>
          </div>
        </div>
      )}

      {/* Featured Albums */}
      <section className="py-20 bg-white max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Albums</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {albums.map((album: AlbumData) => (
            <div
              key={album.AlbumID}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {album.AlbumThumbnailURL && (
                <div className="relative h-48 w-full">
                  <img
                    src={album.AlbumThumbnailURL}
                    alt={album.AlbumTitle || 'Album thumbnail'}
                    className=" object-cover"
                    onError={(e) => {
                      console.error('Failed to load album image:', album.AlbumThumbnailURL);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{album.AlbumTitle}</h3>
                <p className="text-gray-600 mb-4">{album.AlbumDescription}</p>
                <button
                  onClick={() => window.open(album.AlbumURL, '_blank')}
                  className="text-orange-600 hover:text-orange-700 hover:underline font-medium"
                >
                  View Album →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;