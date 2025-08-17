// Test to reproduce and fix the NFT classification bug
// Run this to see where the problem occurs

console.log('🔧 Testing NFT vs Token Classification Bug...\n');

// Test the keyword detection logic from ChatInterface
function testChatInterfaceClassification(userMessage) {
    console.log(`Testing input: "${userMessage}"`);
    
    const tokenKeywords = ['create', 'make', 'generate', 'build', 'deploy', 'token', 'coin', 'currency'];
    const nftKeywords = ['nft', 'collectible', 'digital art', 'non-fungible', 'unique token', 'artwork', 'mint'];
    
    const hasTokenKeyword = tokenKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
    );
    
    const hasNFTKeyword = nftKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
    );
    
    console.log(`  hasTokenKeyword: ${hasTokenKeyword}`);
    console.log(`  hasNFTKeyword: ${hasNFTKeyword}`);
    
    // FIXED LOGIC: NFT takes precedence
    if (hasNFTKeyword) {
        console.log(`  → SHOULD GO TO: aiNFTManager (NFT flow) ✅`);
        return 'NFT';
    } else if (hasTokenKeyword && !hasNFTKeyword) {
        console.log(`  → SHOULD GO TO: aiTokenManager (Token flow) ✅`);
        return 'Token';
    } else {
        console.log(`  → SHOULD GO TO: parseCommand (General AI) ✅`);
        return 'General';
    }
}

// Test problematic cases
const testCases = [
    'nft create',
    'create nft',
    'make nft called CoolArt',
    'create token called MyToken',
    'make coin',
    'mint nft',
    'deploy nft'
];

testCases.forEach(testCase => {
    testChatInterfaceClassification(testCase);
    console.log('');
});

console.log('🎯 Summary:');
console.log('- All NFT-related inputs should go to aiNFTManager');
console.log('- aiNFTManager should use SimpleAIDeployment.deployNFTForAI');
console.log('- SimpleAIDeployment calls NFTFactory (creates NFTs)');
console.log('- NOT MasterFactory.createNFT (which may create tokens)');

console.log('\n🔍 Next Steps:');
console.log('1. Test the fix by saying "nft create" in the UI');
console.log('2. Check browser console for the debug logs');
console.log('3. Verify the contract address is an NFT, not a token');
console.log('4. Check the transaction on Snowtrace to confirm NFT creation');
