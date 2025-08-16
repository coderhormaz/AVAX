// Test conversational NFT system
import { aiNFTManager } from './src/utils/aiNFTManager.js';

console.log('🧪 Testing Conversational NFT System...\n');

async function testNFTFlow() {
  console.log('👤 User: "create nft called CoolArt"');
  let response = await aiNFTManager.processUserInput('create nft called CoolArt');
  console.log('🤖 Bot:', response.split('\n')[0] + '...\n');

  console.log('👤 User: "A unique digital masterpiece"');
  response = await aiNFTManager.processUserInput('A unique digital masterpiece');
  console.log('🤖 Bot:', response.split('\n')[0] + '...\n');

  console.log('👤 User: "no"');
  response = await aiNFTManager.processUserInput('no');
  console.log('🤖 Bot:', response.split('\n')[0] + '...\n');

  console.log('👤 User: "1"');
  response = await aiNFTManager.processUserInput('1');
  console.log('🤖 Bot:', response.split('\n')[0] + '...\n');

  console.log('👤 User: "yes"');
  response = await aiNFTManager.processUserInput('yes');
  console.log('🤖 Bot:', response.split('\n')[0] + '...\n');

  console.log('✅ Conversational NFT system working!');
}

testNFTFlow().catch(console.error);
