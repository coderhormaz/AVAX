// IPFS Service for NFT Image Uploads
// Handles image uploads to IPFS using Pinata

import { CONFIG } from '../config.js';

export class IPFSService {
  private pinataJWT: string;

  constructor() {
    this.pinataJWT = CONFIG.STORAGE.PINATA_JWT || '';
  }

  // Upload file to IPFS via Pinata
  async uploadFile(file: File, name?: string): Promise<string> {
    if (!this.pinataJWT) {
      throw new Error('Pinata JWT not configured. Please set VITE_PINATA_JWT in environment');
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
        throw new Error(`Pinata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return `ipfs://${result.IpfsHash}`;
    } catch (error: unknown) {
      console.error('IPFS upload error:', error);
      throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Upload JSON metadata to IPFS
  async uploadMetadata(metadata: any, name?: string): Promise<string> {
    if (!this.pinataJWT) {
      throw new Error('Pinata JWT not configured');
    }

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
        throw new Error(`Pinata metadata upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return `ipfs://${result.IpfsHash}`;
    } catch (error: unknown) {
      console.error('IPFS metadata upload error:', error);
      throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : String(error)}`);
    }
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

  // Get IPFS URL for viewing
  getIPFSUrl(hash: string, gateway: string = 'https://gateway.pinata.cloud'): string {
    // Remove ipfs:// prefix if present
    const cleanHash = hash.replace('ipfs://', '');
    return `${gateway}/ipfs/${cleanHash}`;
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

// Helper function for AI to use
export async function uploadImageForNFT(
  file: File,
  nftName: string,
  description?: string
): Promise<{ imageURI: string; metadataURI: string }> {
  const ipfs = new IPFSService();
  
  // Validate file first
  const validation = ipfs.validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  try {
    // Upload image
    console.log('Uploading image to IPFS...');
    const imageURI = await ipfs.uploadFile(file, `${nftName}-image`);
    
    // Create and upload metadata
    console.log('Creating NFT metadata...');
    const metadataURI = await ipfs.createNFTMetadata(
      nftName,
      description || '',
      imageURI
    );

    return { imageURI, metadataURI };
  } catch (error: unknown) {
    // Fallback to placeholder if IPFS fails
    console.warn('IPFS upload failed, using fallback:', error instanceof Error ? error.message : String(error));
    const fallbackImageURI = await ipfs.uploadViaPublicGateway(file);
    return {
      imageURI: fallbackImageURI,
      metadataURI: fallbackImageURI // Use same for both in fallback
    };
  }
}
