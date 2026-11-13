import React, { useState } from 'react';
import { Compass } from 'lucide-react';

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

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-wood-900 via-wood-800 to-forest-800 text-cream/90 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Compass className="w-8 h-8 text-gold-400 mb-2" strokeWidth={1.5} />
        <span className="font-serif text-base font-semibold tracking-wide">
          {fallbackTitle || alt}
        </span>
        <span className="text-xs text-cream/65 mt-1">Tư liệu trưng bày Sử Thi Số 4.0</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
