// Test NFT creation with our fixed parameters
import { deployNFTForAI } from './src/components/EnhancedAIDeployment.tsx';

// Mock wallet data for testing
const testWallet = {
  address: '0x742d35Cc6694C96C2d6B69E1f90e5A28c20dA1d0',
  privateKey: 'test-key',
  mnemonic: 'test mnemonic'
};

const testMetadataURI = `data:application/json,{"name":"Test NFT","description":"Test Description","image":"https://via.placeholder.com/400x400.png?text=NFT"}`;

async function testNFTCreation() {
  try {
    console.log('🧪 Testing NFT creation with proper metadata URI...');
    
    const result = await deployNFTForAI(
      'Test NFT',
      'Test Description', 
      testMetadataURI,
      1,
      testWallet,
      true
    );
    
    console.log('✅ Test result:', result);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error message:', error.message);
  }
}

// testNFTCreation();
console.log('Test metadata URI format:', testMetadataURI);
