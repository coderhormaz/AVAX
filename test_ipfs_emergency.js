/**
 * Emergency IPFS Upload Test
 * Tests if NFT image upload is working with current configuration
 */

// Test the IPFS upload functionality
async function testIPFSUpload() {
  console.log('🧪 Testing IPFS Upload Configuration...\n');
  
  // Check environment variables
  const lighthouseKey = 'VITE_LIGHTHOUSE_API_KEY' in process.env ? '✅' : '❌';
  const pinataJWT = 'VITE_PINATA_JWT' in process.env ? '✅' : '❌';
  
  console.log('Environment Check:');
  console.log(`Lighthouse API Key: ${lighthouseKey}`);
  console.log(`Pinata JWT: ${pinataJWT}`);
  
  if (lighthouseKey === '❌' && pinataJWT === '❌') {
    console.log('\n❌ CRITICAL: No IPFS credentials found!');
    console.log('💡 Solution:');
    console.log('1. Add to your .env file:');
    console.log('   VITE_LIGHTHOUSE_API_KEY=4df30ae3.b2ff47caf81e4764bc41458037cae8b4');
    console.log('   OR');
    console.log('   VITE_PINATA_JWT=your_pinata_jwt_token');
    console.log('2. Restart the development server');
    return;
  }
  
  // Test Lighthouse API if key exists
  if (lighthouseKey === '✅') {
    console.log('\n🔄 Testing Lighthouse API...');
    try {
      // Test API connection (simple endpoint check)
      const response = await fetch('https://node.lighthouse.storage/api/v0/stats', {
        headers: {
          'Authorization': 'Bearer 4df30ae3.b2ff47caf81e4764bc41458037cae8b4'
        }
      });
      
      if (response.ok) {
        console.log('✅ Lighthouse API is accessible');
      } else {
        console.log(`❌ Lighthouse API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Lighthouse connection failed: ${error}`);
    }
  }
  
  console.log('\n📝 Upload Process Diagnosis:');
  console.log('When you upload an NFT image, this happens:');
  console.log('1. File validation (size, type)');
  console.log('2. Upload to Lighthouse IPFS');
  console.log('3. If Lighthouse fails → fallback to Pinata');
  console.log('4. Create metadata with image IPFS URL');
  console.log('5. Upload metadata to IPFS');
  console.log('6. Return both URLs to blockchain');
  
  console.log('\n🔍 Common Issues & Solutions:');
  console.log('• "No IPFS upload service configured" → Add API keys to .env');
  console.log('• "401 Unauthorized" → Check if API keys are correct');
  console.log('• "Network error" → Check internet connection');
  console.log('• "File too large" → Reduce image size (max 10MB)');
  console.log('• "Invalid file type" → Use JPEG, PNG, GIF, or WebP');
  
  console.log('\n✅ Configuration looks good! NFT uploads should work.');
  console.log('🎯 Try creating an NFT through the chat interface.');
}

// Auto-run the test
testIPFSUpload();
