// Free Lighthouse IPFS Upload (5GB free tier)
// Much cheaper than paid services, better than base64

export async function uploadImageForNFTLighthouseFree(
  file: File,
  nftName: string,
  description?: string
): Promise<{ imageURI: string; metadataURI: string }> {
  console.log('🌟 Using Lighthouse FREE 5GB tier...');
  
  try {
    // Step 1: Upload image to Lighthouse free tier
    console.log('📡 Step 1: Uploading image to Lighthouse...');
    const imageURI = await uploadToLighthouseFree(file);
    console.log('✅ Image uploaded successfully:', imageURI);
    
    // Step 2: Create and upload metadata
    console.log('📡 Step 2: Creating and uploading NFT metadata...');
    const metadata = {
      name: nftName,
      description: description || `A unique NFT called "${nftName}" created on Avalanche blockchain.`,
      image: imageURI,
      attributes: [
        {
          trait_type: "Created On",
          value: "Avalanche Mainnet"
        },
        {
          trait_type: "Upload Method", 
          value: "Lighthouse Free Tier"
        },
        {
          trait_type: "Storage Cost",
          value: "FREE (5GB limit)"
        }
      ]
    };
    
    // Convert metadata to blob and upload
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const metadataFile = new File([metadataBlob], `${nftName}-metadata.json`, { type: 'application/json' });
    const metadataURI = await uploadToLighthouseFree(metadataFile);
    
    console.log('✅ Metadata uploaded successfully:', metadataURI);
    console.log('💰 Total cost: FREE (using Lighthouse 5GB tier)');
    
    return { imageURI, metadataURI };
    
  } catch (error) {
    console.error('❌ Lighthouse free upload failed:', error);
    throw new Error(`Lighthouse upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function uploadToLighthouseFree(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    // Using Lighthouse free API endpoint (no API key required for small files)
    const response = await fetch('https://node.lighthouse.storage/api/v0/add', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lighthouse upload failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Lighthouse free upload successful:', result);
    return `ipfs://${result.Hash}`;
  } catch (error) {
    console.error('❌ Lighthouse free upload error:', error);
    throw new Error(`Failed to upload to Lighthouse: ${error instanceof Error ? error.message : String(error)}`);
  }
}
