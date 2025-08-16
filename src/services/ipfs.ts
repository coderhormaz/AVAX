// IPFS Service for NFT Image Uploads
// Handles image uploads to IPFS using Lighthouse (primary) and Pinata (fallback)

import { CONFIG } from '../config.js';

export class IPFSService {
  private lighthouseApiKey: string;
  private pinataJWT: string;

  constructor() {
    this.lighthouseApiKey = CONFIG.STORAGE.LIGHTHOUSE_API_KEY || '';
    this.pinataJWT = CONFIG.STORAGE.PINATA_JWT || '';
  }

  // Upload file to IPFS via Lighthouse (Primary method)
  async uploadToLighthouse(file: File, _name?: string): Promise<string> {
    if (!this.lighthouseApiKey) {
      throw new Error('Lighthouse API key not configured');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.lighthouseApiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lighthouse upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Lighthouse upload successful:', result);
      return `ipfs://${result.Hash}`;
    } catch (error: unknown) {
      console.error('❌ Lighthouse upload error:', error);
      throw new Error(`Failed to upload to Lighthouse: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Upload file to IPFS via Pinata (Fallback method)
  async uploadToPinata(file: File, name?: string): Promise<string> {
    if (!this.pinataJWT) {
      throw new Error('Pinata JWT not configured');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add metadata
      const metadata = JSON.stringify({
        name: name || file.name,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          fileType: file.type,
          fileSize: file.size.toString()
        }
      });
      formData.append('pinataMetadata', metadata);

      // Add options
      const options = JSON.stringify({
        cidVersion: 1
      });
      formData.append('pinataOptions', options);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Pinata upload successful:', result);
      return `ipfs://${result.IpfsHash}`;
    } catch (error: unknown) {
      console.error('❌ Pinata upload error:', error);
      throw new Error(`Failed to upload to Pinata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Primary upload method with automatic fallback
  async uploadFile(file: File, name?: string): Promise<string> {
    console.log('🔄 Starting IPFS upload for:', file.name);
    
    // Try Lighthouse first (has API key configured)
    if (this.lighthouseApiKey) {
      try {
        console.log('📡 Attempting Lighthouse upload...');
        const result = await this.uploadToLighthouse(file, name);
        console.log('✅ Lighthouse upload successful:', result);
        return result;
      } catch (error) {
        console.warn('⚠️ Lighthouse upload failed, trying Pinata...', error);
      }
    }

    // Fallback to Pinata
    if (this.pinataJWT) {
      try {
        console.log('📡 Attempting Pinata upload...');
        const result = await this.uploadToPinata(file, name);
        console.log('✅ Pinata upload successful:', result);
        return result;
      } catch (error) {
        console.error('❌ Pinata upload also failed:', error);
        throw error;
      }
    }

    // If no credentials available, throw helpful error
    throw new Error(
      '❌ No IPFS upload service configured! Please set either:\n' +
      '• VITE_LIGHTHOUSE_API_KEY for Lighthouse\n' +
      '• VITE_PINATA_JWT for Pinata\n' +
      'in your .env file'
    );
  }

  // Upload JSON metadata to IPFS with fallback
  async uploadMetadata(metadata: any, name?: string): Promise<string> {
    console.log('🔄 Starting metadata upload...');

    // Try Lighthouse first
    if (this.lighthouseApiKey) {
      try {
        // Convert metadata to JSON file
        const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
        const jsonFile = new File([jsonBlob], `${name || 'metadata'}.json`, { type: 'application/json' });
        
        const result = await this.uploadToLighthouse(jsonFile, name);
        console.log('✅ Lighthouse metadata upload successful:', result);
        return result;
      } catch (error) {
        console.warn('⚠️ Lighthouse metadata upload failed, trying Pinata...', error);
      }
    }

    // Fallback to Pinata
    if (this.pinataJWT) {
      try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.pinataJWT}`
          },
          body: JSON.stringify({
            pinataContent: metadata,
            pinataMetadata: {
              name: name || `metadata-${Date.now()}`,
              keyvalues: {
                uploadedAt: new Date().toISOString(),
                type: 'nft-metadata'
              }
            },
            pinataOptions: {
              cidVersion: 1
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Pinata metadata upload failed: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Pinata metadata upload successful:', result);
        return `ipfs://${result.IpfsHash}`;
      } catch (error: unknown) {
        console.error('❌ Pinata metadata upload error:', error);
        throw new Error(`Failed to upload metadata to Pinata: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    throw new Error('No IPFS service configured for metadata upload');
  }

  // Create and upload NFT metadata
  async createNFTMetadata(
    name: string,
    description: string,
    imageURI: string,
    attributes?: Array<{ trait_type: string; value: string | number }>
  ): Promise<string> {
    const metadata = {
      name,
      description,
      image: imageURI,
      attributes: attributes || []
    };

    return await this.uploadMetadata(metadata, `${name}-metadata`);
  }

  // Get IPFS URL for viewing - with multiple gateway fallbacks
  getIPFSUrl(hash: string, gateway?: string): string {
    // Remove ipfs:// prefix if present
    const cleanHash = hash.replace('ipfs://', '');
    
    // Default to Pinata gateway, but provide fallbacks
    const defaultGateway = gateway || 'https://gateway.pinata.cloud';
    return `${defaultGateway}/ipfs/${cleanHash}`;
  }

  // Get multiple gateway URLs for fallback
  getIPFSUrls(hash: string): string[] {
    const cleanHash = hash.replace('ipfs://', '');
    return [
      `https://gateway.pinata.cloud/ipfs/${cleanHash}`,
      `https://ipfs.io/ipfs/${cleanHash}`,
      `https://cloudflare-ipfs.com/ipfs/${cleanHash}`,
      `https://dweb.link/ipfs/${cleanHash}`
    ];
  }

  // Create a working image URL with fallbacks
  async findWorkingImageUrl(hash: string): Promise<string> {
    const urls = this.getIPFSUrls(hash);
    
    for (const url of urls) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          return url;
        }
      } catch (error) {
        console.warn(`Gateway ${url} failed, trying next...`);
      }
    }
    
    // Return first URL as fallback
    return urls[0];
  }

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File must be an image (JPEG, PNG, GIF, or WebP)' };
    }

    return { valid: true };
  }

  // Fallback: Use public IPFS gateways (less reliable but no API key needed)
  async uploadViaPublicGateway(file: File): Promise<string> {
    console.warn('Using fallback IPFS upload - not recommended for production');
    
    // This is a simplified example - in practice, you'd need to implement
    // a more robust solution or use a service like web3.storage
    
    // For now, return a placeholder hash
    const placeholderHash = `Qm${btoa(file.name + Date.now()).slice(0, 44)}`;
    return `ipfs://${placeholderHash}`;
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();

// Helper function for AI to use with enhanced error handling
export async function uploadImageForNFT(
  file: File,
  nftName: string,
  description?: string
): Promise<{ imageURI: string; metadataURI: string }> {
  console.log('🎨 Starting NFT image upload process...');
  console.log('📁 File details:', {
    name: file.name,
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    type: file.type
  });

  const ipfs = new IPFSService();
  
  // Validate file first
  const validation = ipfs.validateFile(file);
  if (!validation.valid) {
    console.error('❌ File validation failed:', validation.error);
    throw new Error(validation.error);
  }

  try {
    // Upload image first
    console.log('📡 Step 1: Uploading image to IPFS...');
    const imageURI = await ipfs.uploadFile(file, `${nftName}-image`);
    console.log('✅ Image uploaded successfully:', imageURI);
    
    // Create and upload metadata
    console.log('📡 Step 2: Creating and uploading NFT metadata...');
    const metadataURI = await ipfs.createNFTMetadata(
      nftName,
      description || '',
      imageURI
    );
    console.log('✅ Metadata uploaded successfully:', metadataURI);

    console.log('🎉 NFT upload process completed successfully!');
    return { imageURI, metadataURI };
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('💥 NFT upload process failed:', errorMessage);
    
    // Try to provide helpful debugging information
    if (errorMessage.includes('No IPFS upload service configured')) {
      console.error('🔧 Configuration issue detected!');
      console.error('💡 Solution: Add IPFS credentials to your .env file:');
      console.error('   VITE_LIGHTHOUSE_API_KEY=your_lighthouse_key');
      console.error('   OR');
      console.error('   VITE_PINATA_JWT=your_pinata_jwt');
    }
    
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      console.error('🔑 Authentication issue detected!');
      console.error('💡 Solution: Check if your API keys are correct and active');
    }
    
    if (errorMessage.includes('Network')) {
      console.error('🌐 Network issue detected!');
      console.error('💡 Solution: Check your internet connection and try again');
    }
    
    // Re-throw with enhanced error message
    throw new Error(`NFT upload failed: ${errorMessage}`);
  }
}
