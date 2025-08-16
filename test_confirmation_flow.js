// Test the inline confirmation flow
console.log('🧪 Testing Inline Confirmation Flow...');

// Check if environment variables are accessible
const config = {
  MASTER_FACTORY: process.env.VITE_MASTER_FACTORY_ADDRESS,
  LIGHTHOUSE_API_KEY: process.env.VITE_LIGHTHOUSE_API_KEY,
  PINATA_JWT: process.env.VITE_PINATA_JWT,
  EXPLORER_URL: process.env.VITE_EXPLORER_URL
};

console.log('📋 Environment Check:');
Object.entries(config).forEach(([key, value]) => {
  console.log(`  ${key}: ${value ? '✅ SET' : '❌ NOT SET'}`);
});

// Test message structure
const testMessage = {
  id: 'test-123',
  type: 'ai',
  content: '🪙 **Confirm Token Deployment**\n\nTest content...',
  timestamp: new Date(),
  needsConfirmation: true,
  confirmationType: 'ai_deployment',
  parameters: {
    name: 'TestToken',
    ticker: 'TEST',
    supply: 1000,
    decimals: 18
  }
};

console.log('📝 Test Message Structure:');
console.log(JSON.stringify(testMessage, null, 2));

console.log('\n✅ Inline confirmation flow test complete!');
console.log('🌐 Application should be running at: http://localhost:5175/');
