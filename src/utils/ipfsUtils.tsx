/**
 * IPFS URL utilities for reliable image display
 */

// Multiple IPFS gateways for fallback
export const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud',
  'https://ipfs.io',
  'https://cloudflare-ipfs.com',
  'https://dweb.link',
  'https://gateway.ipfs.io'
];

/**
 * Convert IPFS hash to HTTP URL using the first gateway
 */
export function ipfsToHttp(ipfsUrl: string, gatewayIndex: number = 0): string {
  const hash = ipfsUrl.replace('ipfs://', '');
  const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
  return `${gateway}/ipfs/${hash}`;
}

/**
 * Get all possible HTTP URLs for an IPFS hash
 */
export function getAllIPFSUrls(ipfsUrl: string): string[] {
  const hash = ipfsUrl.replace('ipfs://', '');
  return IPFS_GATEWAYS.map(gateway => `${gateway}/ipfs/${hash}`);
}

/**
 * React component for robust IPFS image display with automatic fallbacks
 */
import React, { useState, useEffect } from 'react';

interface IPFSImageProps {
  src: string; // IPFS URL (ipfs://... or hash)
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  fallbackText?: string;
}

export const IPFSImage: React.FC<IPFSImageProps> = ({
  src,
  alt,
  className = '',
  style = {},
  onLoad,
  onError,
  fallbackText = 'Image failed to load'
}) => {
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset when src changes
  useEffect(() => {
    setCurrentGatewayIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleImageError = () => {
    console.warn(`IPFS image failed to load from gateway ${currentGatewayIndex + 1}/${IPFS_GATEWAYS.length}`);
    
    if (currentGatewayIndex < IPFS_GATEWAYS.length - 1) {
      // Try next gateway
      setCurrentGatewayIndex(prev => prev + 1);
    } else {
      // All gateways failed
      setHasError(true);
      setIsLoading(false);
      onError?.();
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
    console.log(`✅ IPFS image loaded successfully from gateway: ${IPFS_GATEWAYS[currentGatewayIndex]}`);
  };

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-800 border border-gray-600 rounded text-gray-400 text-sm ${className}`}
        style={{ minHeight: '100px', ...style }}
      >
        <div className="text-center p-4">
          <div>🖼️</div>
          <div>{fallbackText}</div>
          <div className="text-xs mt-1 opacity-60">
            IPFS: {src.replace('ipfs://', '').slice(0, 16)}...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={ipfsToHttp(src, currentGatewayIndex)}
        alt={alt}
        className={className}
        style={style}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded">
          <div className="text-white text-sm">
            Loading from IPFS...
            <div className="text-xs opacity-60 mt-1">
              Gateway {currentGatewayIndex + 1}/{IPFS_GATEWAYS.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPFSImage;
