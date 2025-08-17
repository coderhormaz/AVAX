// Original v4-style IPFS Service - Lighthouse only (simple and working)
import { CONFIG } from '../config.js';

export class IPFSServiceLighthouseOriginal {
  private lighthouseApiKey: string;

  constructor() {
    this.lighthouseApiKey = CONFIG.STORAGE.LIGHTHOUSE_API_KEY || '';
  }

  // Upload file to IPFS via Lighthouse (original v4 style - simple and direct)
  async uploadFile(file: File, _name?: string): Promise<string> {
    if (!this.lighthouseApiKey) {
      throw new Error('Lighthouse API key not configured. Please set VITE_LIGHTHOUSE_API_KEY in environment');
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

  // Upload JSON metadata to IPFS via Lighthouse
  async uploadMetadata(metadata: any, name?: string): Promise<string> {
    if (!this.lighthouseApiKey) {
      throw new Error('Lighthouse API key not configured');
    }

    try {
      // Convert metadata to blob
      const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], `${name || 'metadata'}.json`, { type: 'application/json' });

      return await this.uploadFile(metadataFile, name);
    } catch (error: unknown) {
      console.error('❌ Lighthouse metadata upload error:', error);
      throw new Error(`Failed to upload metadata to Lighthouse: ${error instanceof Error ? error.message : String(error)}`);
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
}

// Helper function for AI to use (original v4-style with Lighthouse)
export async function uploadImageForNFTLighthouseOriginal(
  file: File,
  nftName: string,
  description?: string
): Promise<{ imageURI: string; metadataURI: string }> {
  console.log('🌟 Using original v4-style Lighthouse method...');
  const ipfs = new IPFSServiceLighthouseOriginal();

  // Validate file first
  const validation = ipfs.validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  try {
    // Upload image
    console.log('📡 Uploading image to Lighthouse...');
    const imageURI = await ipfs.uploadFile(file, `${nftName}-image`);

    // Create and upload metadata
    console.log('📡 Creating NFT metadata...');
    const metadataURI = await ipfs.createNFTMetadata(
      nftName,
      description || '',
      imageURI
    );

    console.log('✅ Original v4-style Lighthouse method completed successfully!');
    console.log('💰 Using original working method with low fees!');
    return { imageURI, metadataURI };
  } catch (error: unknown) {
    console.error('❌ Original v4-style Lighthouse method failed:', error);
    throw new Error(`Lighthouse upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
