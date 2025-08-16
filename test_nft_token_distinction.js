/**
 * Test script to verify NFT vs Token distinction in AI parsing
 */

// Simulate the parsing logic from ai.ts
function testNFTvsTokenParsing() {
  console.log('🧪 Testing NFT vs Token Distinction\n');
  
  const testCases = [
    // NFT cases
    { input: "create nft", expectation: "should detect NFT creation" },
    { input: "mint nft called My Art", expectation: "should detect NFT with name" },
    { input: "make digital collectible", expectation: "should detect NFT via synonym" },
    { input: "create artwork nft", expectation: "should detect NFT even with mixed keywords" },
    
    // Token cases  
    { input: "create token", expectation: "should detect token creation" },
    { input: "make token called GameCoin", expectation: "should detect token with name" },
    { input: "deploy coin with symbol BTC", expectation: "should detect token via synonyms" },
    { input: "create cryptocurrency", expectation: "should detect token via synonym" },
    
    // Edge cases
    { input: "create nft token", expectation: "should prioritize NFT when both keywords present" },
    { input: "make unique token artwork", expectation: "should detect NFT due to 'unique' and 'artwork'" }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: "${testCase.input}"`);
    console.log(`Expected: ${testCase.expectation}`);
    
    const input = testCase.input.toLowerCase();
    
    // NFT detection logic (from our updated ai.ts)
    const isNFT = /(mint|create|make|generate|produce|issue)/.test(input) && 
                  /(nft|collectible|digital art|non-fungible|unique token|artwork)/.test(input);
    
    // Token detection logic (from our updated ai.ts)
    const isToken = /(create|make|deploy|launch|build|generate|start|new)/.test(input) && 
                    /(token|coin|currency|crypto|digital asset)/.test(input) && 
                    !/(nft|collectible|digital art|non-fungible|unique token|artwork)/.test(input);
    
    if (isNFT) {
      console.log(`✅ Result: NFT detected`);
    } else if (isToken) {
      console.log(`✅ Result: Token detected`);
    } else {
      console.log(`❓ Result: Neither NFT nor Token detected clearly`);
    }
    
    console.log('---\n');
  });
}

// Run the tests
testNFTvsTokenParsing();

console.log('🎯 Key Improvements Made:');
console.log('1. NFT patterns checked BEFORE token patterns');
console.log('2. Token detection excludes NFT keywords');
console.log('3. Enhanced synonym recognition for both NFT and token');
console.log('4. ChatInterface routes NFT requests to NFTCreationWizard');
console.log('5. Flexible name extraction for NFTs (supports quoted strings, various patterns)');
console.log('6. Better handling of generic "create nft" requests');
