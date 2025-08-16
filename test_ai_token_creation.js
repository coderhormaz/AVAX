// Test script for AI Token Creation System
// Run this to see the AI parser and deployment manager in action

import { TokenCreationAI } from '../src/utils/advancedTokenAI';
import { AITokenDeploymentManager } from '../src/utils/aiTokenManager';

// Mock wallet for testing
const mockWallet = {
  address: '0x1234567890123456789012345678901234567890',
  balance: '1.5',
  privateKey: 'mock-private-key'
};

console.log('🤖 AI Token Creation System Test\n');
console.log('=' .repeat(50));

// Test 1: AI Parsing
console.log('\n🧠 TEST 1: AI Parsing Intelligence');
console.log('-'.repeat(30));

const testInputs = [
  "Create a token name hormaz ticker HD supply 5000",
  "Make token called Bitcoin2 symbol BTC2 amount 1M",
  "Generate coin named MyAwesome ticker MAT with 500k supply",
  "New token: name=DogeCoin, ticker=DOGE, supply=21000000",
  "Create token MyToken ticker MTK supply one million"
];

testInputs.forEach((input, index) => {
  console.log(`\nInput ${index + 1}: "${input}"`);
  const result = TokenCreationAI.parseTokenRequest(input);
  
  if (result.success && result.data) {
    console.log(`✅ Parsed Successfully:`);
    console.log(`   Name: ${result.data.name}`);
    console.log(`   Ticker: ${result.data.ticker}`);
    console.log(`   Supply: ${result.data.supply.toLocaleString()}`);
    console.log(`   Confidence: ${result.data.confidence}%`);
  } else {
    console.log(`❌ Parse Failed: ${result.error}`);
  }
});

// Test 2: Similar Word Recognition
console.log('\n\n🔍 TEST 2: Similar Word Recognition');
console.log('-'.repeat(30));

const similarWordTests = [
  "Create coin called hormaz symbol HD amount 5000", // coin instead of token
  "Make currency named Bitcoin2 code BTC2 quantity 1M", // currency, code, quantity
  "Generate asset titled MyToken abbr MTK total 500k", // asset, titled, abbr, total
];

similarWordTests.forEach((input, index) => {
  console.log(`\nSimilar Words ${index + 1}: "${input}"`);
  const result = TokenCreationAI.parseTokenRequest(input);
  
  if (result.success && result.data) {
    console.log(`✅ Recognized: ${result.data.name} | ${result.data.ticker} | ${result.data.supply.toLocaleString()}`);
  } else {
    console.log(`❌ Not recognized: ${result.error}`);
  }
});

// Test 3: Number Recognition
console.log('\n\n🔢 TEST 3: Number Recognition');
console.log('-'.repeat(30));

const numberTests = [
  "Create token MyToken ticker MTK supply 1k",
  "Create token MyToken ticker MTK supply 2.5M", 
  "Create token MyToken ticker MTK supply 1B",
  "Create token MyToken ticker MTK supply one million",
  "Create token MyToken ticker MTK supply 500000"
];

numberTests.forEach((input, index) => {
  console.log(`\nNumber ${index + 1}: "${input}"`);
  const result = TokenCreationAI.parseTokenRequest(input);
  
  if (result.success && result.data) {
    console.log(`✅ Supply recognized as: ${result.data.supply.toLocaleString()}`);
  } else {
    console.log(`❌ Number not recognized`);
  }
});

// Test 4: Full Deployment Flow Simulation
console.log('\n\n🚀 TEST 4: Full Deployment Flow (Simulation)');
console.log('-'.repeat(30));

async function testDeploymentFlow() {
  const manager = new AITokenDeploymentManager(mockWallet);
  
  console.log('\nStep 1: User input - "Create token name hormaz ticker HD supply 5000"');
  const parseResponse = await manager.processUserInput('Create token name hormaz ticker HD supply 5000');
  console.log('AI Response:');
  console.log(parseResponse);
  
  console.log('\nStep 2: User confirms - "yes"');
  const confirmResponse = await manager.processUserInput('yes');
  console.log('AI Response:');
  console.log(confirmResponse);
  
  console.log('\nCurrent state:', manager.getCurrentState());
}

// Run the test
testDeploymentFlow().catch(console.error);

// Export for use in browser console or other tests
if (typeof window !== 'undefined') {
  window.TokenCreationAI = TokenCreationAI;
  window.AITokenDeploymentManager = AITokenDeploymentManager;
  console.log('\n🌐 Available in browser console:');
  console.log('• TokenCreationAI.parseTokenRequest("Create token...")');
  console.log('• AITokenDeploymentManager for full flow testing');
}

console.log('\n' + '='.repeat(50));
console.log('🎉 AI Token Creation System Test Complete!');

export { TokenCreationAI, AITokenDeploymentManager };
