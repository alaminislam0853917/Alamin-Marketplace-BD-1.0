import React, { useState } from 'react';
import { Package } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-teal-50/60 text-teal-600 border border-teal-100 ${className}`}>
        <Package className="w-8 h-8 opacity-40 mb-1" />
        <span className="text-[11px] font-medium text-teal-700/60">ছবি নেই</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'পণ্য'}
      onError={() => setHasError(true)}
      loading="lazy"
      className={className}
      {...props}
    />
  );
};
