// Test NFT Flow - Find the loophole
console.log('🧪 Testing Complete NFT Flow with Image Requirement...\n');

class TestNFTManager {
  constructor() {
    this.state = { 
      stage: 'idle',
      hasImage: false,
      imageFile: undefined 
    };
  }
  
  processUserInput(input) {
    console.log(`\n👤 User: "${input}"`);
    
    if (this.state.stage === 'idle') {
      this.state = { stage: 'asking_description', name: 'TestNFT' };
      return '🎨 Now describe your NFT...';
    }
    
    if (this.state.stage === 'asking_description') {
      this.state.description = input;
      this.state.stage = 'asking_image';
      return '📸 Image Upload Required!';
    }
    
    if (this.state.stage === 'asking_image') {
      return '📸 Waiting for image upload...';
    }
    
    if (this.state.stage === 'asking_quantity') {
      // Check if image uploaded before accepting quantity
      if (!this.state.imageFile) {
        return '❌ Image Required First! Upload image before quantity.';
      }
      
      const quantity = parseInt(input);
      if (!isNaN(quantity)) {
        this.state.quantity = quantity;
        this.state.stage = 'confirming';
        return `✅ Ready to confirm! Image: ${this.state.imageFile ? 'YES' : 'NO'}`;
      }
      return '❌ Invalid quantity';
    }
    
    if (this.state.stage === 'confirming') {
      if (input === 'yes') {
        if (!this.state.imageFile) {
          return '❌ Cannot deploy without image!';
        }
        return '🚀 Deploying NFT...';
      }
    }
    
    return 'Unknown input';
  }
  
  setImageFile(fileName) {
    console.log(`📁 Uploading file: ${fileName}`);
    if (this.state.stage === 'asking_image') {
      this.state.imageFile = { name: fileName };
      this.state.hasImage = true;
      this.state.stage = 'asking_quantity';
      return '✅ Image uploaded! Now enter quantity...';
    }
    return 'Cannot upload now';
  }
}

async function testFullFlow() {
  const manager = new TestNFTManager();
  
  console.log('=== TEST 1: Normal Flow ===');
  console.log('🤖', manager.processUserInput('create nft'));
  console.log('🤖', manager.processUserInput('skip'));
  console.log('🤖', manager.processUserInput('anything')); // Should ask for upload
  console.log('🤖', manager.setImageFile('test.jpg')); // Upload image
  console.log('🤖', manager.processUserInput('1')); // Set quantity
  console.log('🤖', manager.processUserInput('yes')); // Confirm
  
  console.log('\n=== TEST 2: Try to skip image ===');
  const manager2 = new TestNFTManager();
  console.log('🤖', manager2.processUserInput('create nft'));
  console.log('🤖', manager2.processUserInput('skip'));
  console.log('🤖', manager2.processUserInput('anything')); // Should ask for upload
  // Skip image upload, try quantity directly
  manager2.state.stage = 'asking_quantity'; // Simulate user somehow getting to quantity
  console.log('🤖', manager2.processUserInput('1')); // Should reject!
}

testFullFlow();
