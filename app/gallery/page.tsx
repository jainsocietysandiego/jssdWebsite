'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';
import Image from 'next/image';

const GOOGLE_SHEET_API =
  'https://script.google.com/macros/s/AKfycby8FhcIhNDX4iDgaGeIs4oBbZiCFVJrexU-77H0fJbdEl47ij2PDc5pbdj-jojD8GmuHA/exec';

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

const Loading = () => (
  <div className="min-h-screen bg-brand-light flex items-center justify-center">
    <div className="text-center px-4">
      <div className="relative">
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 md:mb-8 relative">
          <div className="absolute inset-0 border-4 border-[rgba(234,88,12,0.1)] rounded-full"></div>
          <div className="absolute inset-1 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <div 
            className="absolute inset-2 border-4 border-brand-dark/30 border-r-transparent rounded-full"
            style={{
              animation: 'spin 1s linear infinite reverse'
            }}
          ></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-accent rounded-full flex items-center justify-center animate-pulse">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full"></div>
          </div>
        </div>        
        <h3 className="text-lg md:text-xl font-semibold text-brand-dark mb-2">Jai Jinendra</h3>
        <p className="text-sm md:text-base text-accent animate-pulse">Ahimsa Parmo Dharma</p>
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>
    </div>
  </div>
);

const Gallery: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [albums, setAlbums] = useState<AlbumData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // New state for view mode

  useEffect(() => {
    setLoading(true);
    fetch(GOOGLE_SHEET_API)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: ApiResponse) => {
        if (data.error) throw new Error(`Apps Script Error: ${data.error}`);
        const validImages = (data.images || []).filter(img => img.ImageURL?.trim().length > 0);
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
      : images.filter(img => img.Category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Photos', count: images.length },
    ...Array.from(new Set(images.map(img => img.Category))).map(cat => ({
      id: cat,
      name: cat?.charAt(0).toUpperCase() + cat?.slice(1) || 'Unknown',
      count: images.filter(img => img.Category === cat).length,
    })),
  ];

  const openLightbox = (id: number) => setSelectedImage(id);
  const closeLightbox = () => setSelectedImage(null);

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    const currentIndex = filteredImages.findIndex(img => Number(img.ID) === selectedImage);
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
    ? images.find(img => Number(img.ID) === selectedImage)
    : null;

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-light">
        <div className="flex items-center justify-center min-h-screen pt-[14vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4 text-lg">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary px-6 py-3 rounded-xl"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light pt-[8vh] sm:pt-[12vh]">
      {/* Hero - Mobile Optimized */}
      <section className="relative flex items-center justify-center
                          h-32 sm:h-40 md:h-48 lg:h-60 overflow-hidden">
        <Image
          src="/images/hero-banner.jpg"
          alt="Gallery"
          fill
          priority
          quality={85}
          className="object-cover"
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-bold text-brand-light text-xl sm:text-3xl md:text-4xl lg:text-5xl">
            Media Gallery
          </h1>
          <p className="mt-2 max-w-4xl mx-auto text-white text-xs sm:text-sm md:text-base lg:text-lg text-center">
            View blessed moments, religious ceremonies, and inspirational content from our Jain community
          </p>
        </div>
      </section>

      {/* Mobile-Optimized Category Filter */}
      <section className="py-6 md:py-12 bg-brand-white">
        <div className="max-w-6xl mx-auto px-3 md:px-4">
          {/* Mobile: Horizontal scroll for categories */}
          <div className="flex md:hidden overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-xs whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-accent text-brand-light shadow-soft'
                    : 'bg-brand-light text-brand-dark hover:bg-accent/10 hover:text-accent border border-accent/20'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
          
          {/* Desktop: Centered flex wrap */}
          <div className="hidden md:flex flex-wrap justify-center gap-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 text-sm md:text-base ${
                  selectedCategory === cat.id
                    ? 'bg-accent text-brand-light shadow-soft'
                    : 'bg-brand-light text-brand-dark hover:bg-accent/10 hover:text-accent border border-accent/20'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* View Mode Toggle - Mobile Only */}
      <section className="md:hidden py-3 bg-brand-white border-t border-accent/10">
        <div className="max-w-6xl mx-auto px-3">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-accent text-white'
                  : 'bg-brand-light text-brand-dark hover:bg-accent/10'
              }`}
            >
              <Grid size={14} />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-accent text-white'
                  : 'bg-brand-light text-brand-dark hover:bg-accent/10'
              }`}
            >
              <List size={14} />
              List
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Image Grid/List */}
      <section className="py-8 md:py-16 bg-brand-light">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-brand-dark/60 text-base md:text-lg">No images found for this category.</p>
            </div>
          ) : (
            <>
              {/* Mobile Grid View - Smaller images */}
              <div className={`md:hidden ${viewMode === 'grid' ? 'block' : 'hidden'}`}>
                <div className="grid grid-cols-2 gap-3">
                  {filteredImages.map(image => (
                    <div
                      key={image.ID}
                      className="group cursor-pointer rounded-lg shadow-soft bg-brand-white overflow-hidden 
                                 transition-all duration-300 hover:shadow-lg relative aspect-square"
                      onClick={() => openLightbox(Number(image.ID))}
                    >
                      {image.ImageURL && (
                        <div className="relative w-full h-full">
                          <Image
                            src={image.ImageURL.trim()}
                            alt={image.Title || 'Gallery image'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                                      flex items-end justify-center p-2">
                        <div className="text-brand-light text-center">
                          <h3 className="font-semibold text-xs mb-1 line-clamp-1">{image.Title}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile List View - More compact */}
              <div className={`md:hidden ${viewMode === 'list' ? 'block' : 'hidden'}`}>
                <div className="space-y-3">
                  {filteredImages.map(image => (
                    <div
                      key={image.ID}
                      className="group cursor-pointer rounded-lg shadow-soft bg-brand-white overflow-hidden 
                                 transition-all duration-300 hover:shadow-lg flex gap-3 p-3"
                      onClick={() => openLightbox(Number(image.ID))}
                    >
                      {image.ImageURL && (
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={image.ImageURL.trim()}
                            alt={image.Title || 'Gallery image'}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 text-brand-dark line-clamp-1">{image.Title}</h3>
                        <p className="text-xs text-brand-dark/70 line-clamp-2">{image.Description}</p>
                        <span className="text-xs text-accent font-medium">{image.Category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Grid - Original */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map(image => (
                  <div
                    key={image.ID}
                    className="group cursor-pointer rounded-xl shadow-soft bg-brand-white overflow-hidden 
                               transition-all duration-300 hover:shadow-lg hover:scale-105 relative h-64"
                    onClick={() => openLightbox(Number(image.ID))}
                  >
                    {image.ImageURL && (
                      <div className="relative w-full h-full">
                        <Image
                          src={image.ImageURL.trim()}
                          alt={image.Title || 'Gallery image'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                                    flex items-end justify-center p-4">
                      <div className="text-brand-light text-center">
                        <h3 className="font-semibold text-base mb-1">{image.Title}</h3>
                        <p className="text-xs text-brand-light/80">{image.Description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Enhanced Mobile-Friendly Lightbox */}
      {selectedImageData && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          {/* Mobile: Simplified controls */}
          <button 
            onClick={closeLightbox} 
            className="absolute top-4 right-4 text-brand-light hover:text-accent z-10 p-2 
                       bg-black/50 rounded-full backdrop-blur-sm transition-colors"
          >
            <X size={24} className="md:w-8 md:h-8" />
          </button>
          
          <button 
            onClick={() => navigateImage('prev')} 
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-brand-light hover:text-accent z-10 p-2 
                       bg-black/50 rounded-full backdrop-blur-sm transition-colors"
          >
            <ChevronLeft size={24} className="md:w-8 md:h-8" />
          </button>
          
          <button 
            onClick={() => navigateImage('next')} 
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-brand-light hover:text-accent z-10 p-2 
                       bg-black/50 rounded-full backdrop-blur-sm transition-colors"
          >
            <ChevronRight size={24} className="md:w-8 md:h-8" />
          </button>
          
          <div className="relative max-w-4xl max-h-[70vh] md:max-h-[80vh] w-full h-full px-4 md:px-0">
            {selectedImageData.ImageURL && (
              <Image
                src={selectedImageData.ImageURL.trim()}
                alt={selectedImageData.Title || 'Gallery image'}
                fill
                className="object-contain"
              />
            )}
          </div>
          
          {/* Mobile-optimized info panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 md:p-6 text-brand-light">
            <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 line-clamp-1">{selectedImageData.Title}</h3>
            <p className="text-brand-light/80 text-sm md:text-base line-clamp-2">{selectedImageData.Description}</p>
          </div>
        </div>
      )}

      {/* Mobile-Optimized Featured Albums */}
      <section className="py-8 md:py-16 bg-brand-white">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <h2 className="text-accent font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-6 md:mb-12 text-center">
            Featured Albums
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {albums.map(album => (
              <div
                key={album.AlbumID}
                className="bg-brand-light rounded-xl shadow-soft overflow-hidden hover:shadow-lg 
                           transition-all duration-300 hover:scale-105 border border-accent/10"
              >
                {album.AlbumThumbnailURL && (
                  <div className="relative h-36 md:h-48 w-full">
                    <Image
                      src={album.AlbumThumbnailURL.trim()}
                      alt={album.AlbumTitle || 'Album thumbnail'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 text-brand-dark line-clamp-1">{album.AlbumTitle}</h3>
                  <p className="text-brand-dark/80 mb-4 text-sm md:text-base line-clamp-2">{album.AlbumDescription}</p>
                  <button
                    onClick={() => window.open(album.AlbumURL, '_blank')}
                    className="text-accent hover:text-accent-hov font-medium transition-colors 
                               flex items-center gap-2 group text-sm md:text-base"
                  >
                    View Album 
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
