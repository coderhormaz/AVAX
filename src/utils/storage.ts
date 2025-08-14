import { CONFIG } from '../config';

/**
 * Storage utilities for NFT metadata and images
 */

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  hash?: string;
  error?: string;
}

/**
 * Upload file to Lighthouse (IPFS)
 */
export const uploadToLighthouse = async (file: File): Promise<UploadResult> => {
  if (!CONFIG.STORAGE.LIGHTHOUSE_API_KEY) {
    return {
      success: false,
      error: 'Lighthouse API key not configured'
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.STORAGE.LIGHTHOUSE_API_KEY}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      url: `https://gateway.lighthouse.storage/ipfs/${data.Hash}`,
      hash: data.Hash
    };

  } catch (error: any) {
    console.error('Lighthouse upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
};

/**
 * Upload JSON metadata to Lighthouse
 */
export const uploadMetadataToLighthouse = async (metadata: NFTMetadata): Promise<UploadResult> => {
  if (!CONFIG.STORAGE.LIGHTHOUSE_API_KEY) {
    return {
      success: false,
      error: 'Lighthouse API key not configured'
    };
  }

  try {
    const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    });
    
    const file = new File([jsonBlob], 'metadata.json', {
      type: 'application/json'
    });

    return await uploadToLighthouse(file);

  } catch (error: any) {
    console.error('Metadata upload error:', error);
    return {
      success: false,
      error: error.message || 'Metadata upload failed'
    };
  }
};

/**
 * Upload to Pinata (alternative IPFS service)
 */
export const uploadToPinata = async (file: File): Promise<UploadResult> => {
  if (!CONFIG.STORAGE.PINATA_JWT) {
    return {
      success: false,
      error: 'Pinata JWT not configured'
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploaded_by: 'avax_ai_assistant',
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.STORAGE.PINATA_JWT}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      hash: data.IpfsHash
    };

  } catch (error: any) {
    console.error('Pinata upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
};

/**
 * Upload JSON metadata to Pinata
 */
export const uploadMetadataToPinata = async (metadata: NFTMetadata): Promise<UploadResult> => {
  if (!CONFIG.STORAGE.PINATA_JWT) {
    return {
      success: false,
      error: 'Pinata JWT not configured'
    };
  }

  try {
    const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json'
    });
    
    const file = new File([jsonBlob], 'metadata.json', {
      type: 'application/json'
    });

    return await uploadToPinata(file);

  } catch (error: any) {
    console.error('Pinata metadata upload error:', error);
    return {
      success: false,
      error: error.message || 'Metadata upload failed'
    };
  }
};

/**
 * Smart upload function - tries Pinata first, falls back to Lighthouse
 */
export const uploadFile = async (file: File): Promise<UploadResult> => {
  // Try Pinata first (primary service with your credentials)
  if (CONFIG.STORAGE.PINATA_JWT) {
    console.log('🔄 Uploading to Pinata IPFS...');
    const pinataResult = await uploadToPinata(file);
    if (pinataResult.success) {
      console.log('✅ Upload successful via Pinata');
      return pinataResult;
    }
    console.log('⚠️ Pinata upload failed, trying Lighthouse...');
  }

  // Fall back to Lighthouse
  if (CONFIG.STORAGE.LIGHTHOUSE_API_KEY) {
    console.log('🔄 Uploading to Lighthouse IPFS...');
    const lighthouseResult = await uploadToLighthouse(file);
    if (lighthouseResult.success) {
      console.log('✅ Upload successful via Lighthouse');
      return lighthouseResult;
    }
  }

  return {
    success: false,
    error: 'No IPFS service available. Please configure Pinata or Lighthouse credentials.'
  };
};

/**
 * Smart metadata upload function - tries Pinata first, falls back to Lighthouse
 */
export const uploadMetadata = async (metadata: NFTMetadata): Promise<UploadResult> => {
  // Try Pinata first (primary service with your credentials)
  if (CONFIG.STORAGE.PINATA_JWT) {
    console.log('🔄 Uploading metadata to Pinata IPFS...');
    const pinataResult = await uploadMetadataToPinata(metadata);
    if (pinataResult.success) {
      console.log('✅ Metadata upload successful via Pinata');
      return pinataResult;
    }
    console.log('⚠️ Pinata metadata upload failed, trying Lighthouse...');
  }

  // Fall back to Lighthouse
  if (CONFIG.STORAGE.LIGHTHOUSE_API_KEY) {
    console.log('🔄 Uploading metadata to Lighthouse IPFS...');
    const lighthouseResult = await uploadMetadataToLighthouse(metadata);
    if (lighthouseResult.success) {
      console.log('✅ Metadata upload successful via Lighthouse');
      return lighthouseResult;
    }
  }

  return {
    success: false,
    error: 'No IPFS service available. Please configure Pinata or Lighthouse credentials.'
  };
};

/**
 * Create NFT metadata object
 */
export const createNFTMetadata = (
  name: string,
  description: string,
  imageUrl: string,
  attributes?: Array<{ trait_type: string; value: string | number }>
): NFTMetadata => {
  return {
    name,
    description,
    image: imageUrl,
    ...(attributes && attributes.length > 0 && { attributes })
  };
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please use JPEG, PNG, GIF, or WebP images.'
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Please use images smaller than 10MB.'
    };
  }

  return { valid: true };
};

/**
 * Get file preview URL
 */
export const getFilePreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Convert image to base64 (for preview purposes)
 */
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Cleanup object URL
 */
export const cleanupPreviewUrl = (url: string) => {
  URL.revokeObjectURL(url);
};
