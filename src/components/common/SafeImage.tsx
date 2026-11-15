import React, { useState } from 'react';
import { Compass, Image as ImageIcon } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
}) => {
  const [hasError, setHasError] = useState(false);

  // Normalize path if necessary: ensure /assets/images/... works universally
  const cleanSrc = src?.startsWith('/src/assets/images/')
    ? src.replace('/src/assets/images/', '/assets/images/')
    : src;

  const isBackground = className.includes('absolute') || className.includes('inset-0');
  const isSmall =
    className.includes('w-8') ||
    className.includes('w-10') ||
    className.includes('w-12') ||
    className.includes('w-14') ||
    className.includes('w-16');

  if (!cleanSrc || hasError) {
    // For background covers: pure decorative atmospheric backdrop, absolutely no text to prevent overlay collisions
    if (isBackground) {
      return (
        <div
          className={`bg-gradient-to-b from-wood-950 via-wood-900 to-wood-950 pointer-events-none select-none ${className}`}
          role="img"
          aria-label={alt}
        />
      );
    }

    // For small avatar/icon boxes: clean icon container without spilling text
    if (isSmall) {
      return (
        <div
          className={`flex items-center justify-center bg-wood-900 text-gold-400 overflow-hidden select-none ${className}`}
          role="img"
          aria-label={alt}
          title={alt}
        >
          <Compass className="w-1/2 h-1/2 opacity-70" strokeWidth={1.5} />
        </div>
      );
    }

    // For card images: subtle placeholder with strictly constrained typography
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-wood-950 via-wood-900 to-forest-950 text-cream/80 p-4 text-center overflow-hidden select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="w-6 h-6 text-gold-400/70 mb-1 shrink-0" strokeWidth={1.5} />
        {fallbackTitle && (
          <span className="font-serif text-xs font-semibold tracking-wide text-cream/90 max-w-full truncate">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={isBackground ? '' : alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => {
        // If /assets/images/ failed, try original src before giving up
        if (cleanSrc !== src && src) {
          // Retry with original
          const img = new Image();
          img.src = src;
          img.onload = () => {};
          img.onerror = () => setHasError(true);
        } else {
          setHasError(true);
        }
      }}
      className={`${className} ${isBackground ? 'text-transparent overflow-hidden' : ''}`}
      style={isBackground ? { color: 'transparent' } : undefined}
    />
  );
};
