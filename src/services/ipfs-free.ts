// Simple, FREE alternative to expensive IPFS services
// Uses base64 data URIs - completely free, no external services needed

export async function uploadImageForNFTFree(
  file: File,
  nftName: string,
  description?: string
): Promise<{ imageURI: string; metadataURI: string }> {
  console.log('🆓 Using FREE image upload (no IPFS services)...');
  
  try {
    // Convert image to base64 data URI (completely free)
    const imageURI = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    console.log('✅ Image converted to base64 data URI');
    
    // Create metadata object
    const metadata = {
      name: nftName,
      description: description || `A unique NFT called "${nftName}" created on Avalanche blockchain.`,
      image: imageURI, // Use base64 data URI directly
      attributes: [
        {
          trait_type: "Created On",
          value: "Avalanche Mainnet"
        },
        {
          trait_type: "Upload Method", 
          value: "Direct Base64"
        },
        {
          trait_type: "Cost",
          value: "Ultra Low Gas"
        }
      ]
    };
    
    // Convert metadata to base64 data URI (also free)
    const metadataJSON = JSON.stringify(metadata);
    const metadataURI = `data:application/json;base64,${btoa(metadataJSON)}`;
    
    console.log('✅ Metadata created as base64 data URI');
    console.log('💰 Total IPFS cost: $0.00 (FREE!)');
    
    return { imageURI, metadataURI };
    
  } catch (error) {
    console.error('❌ Free upload failed:', error);
    throw new Error(`Free upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
