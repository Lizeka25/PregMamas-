import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  aspectClass?: string;
}

export function SafeImage({
  src,
  alt,
  caption,
  className = '',
  aspectClass = 'aspect-[4/3]',
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <figure className={`overflow-hidden rounded-xl border border-[#f4b6d0] bg-[#ffeef5] ${className}`}>
      <div className={`relative w-full overflow-hidden ${aspectClass}`}>
        {!hasError ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#fff0f6] to-[#ffd6e7] p-6 text-center">
            <ImageOff className="h-7 w-7 text-[#be185d]" aria-hidden="true" />
            <p className="max-w-xs text-sm font-medium text-[#3f0d24]">{alt}</p>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="border-t border-[#f4b6d0] bg-white px-4 py-2.5 text-xs text-[#5c223d]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
