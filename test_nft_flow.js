// Quick test of NFT manager flow
console.log('🧪 Testing NFT Manager State Flow...\n');

// Mock the NFT manager (since we can't import in node directly)
class TestNFTManager {
  constructor() {
    this.state = { stage: 'idle' };
  }
  
  getCurrentState() {
    return { ...this.state };
  }
  
  async processUserInput(input) {
    console.log(`👤 User: "${input}"`);
    
    if (this.state.stage === 'idle') {
      this.state = { stage: 'asking_description', name: 'TestNFT' };
      return '🎨 Great! Now describe your NFT...';
    }
    
    if (this.state.stage === 'asking_description') {
      this.state.description = input;
      this.state.stage = 'asking_image';
      return '📸 Image Upload Required - Use upload button below!';
    }
    
    if (this.state.stage === 'asking_image') {
      return '📸 Waiting for image upload via button...';
    }
    
    return 'Unknown stage';
  }
  
  setImageFile(file) {
    if (this.state.stage === 'asking_image') {
      this.state.imageFile = file;
      this.state.stage = 'asking_quantity';
      return '✅ Image uploaded! Enter quantity...';
    }
    return 'Not in image stage';
  }
}

async function testFlow() {
  const manager = new TestNFTManager();
  
  console.log('Stage 1 - Initial:', manager.getCurrentState().stage);
  
  let response = await manager.processUserInput('create nft called TestArt');
  console.log(`🤖 Bot: ${response}`);
  console.log('Stage 2 - After name:', manager.getCurrentState().stage);
  
  response = await manager.processUserInput('A beautiful test artwork');
  console.log(`🤖 Bot: ${response}`);
  console.log('Stage 3 - After description:', manager.getCurrentState().stage);
  
  // Simulate user typing while in asking_image stage
  response = await manager.processUserInput('hello');
  console.log(`🤖 Bot: ${response}`);
  console.log('Stage 4 - Still asking image:', manager.getCurrentState().stage);
  
  // Simulate file upload
  const mockFile = { name: 'test.jpg', size: 1024000 };
  response = manager.setImageFile(mockFile);
  console.log(`🤖 Bot: ${response}`);
  console.log('Stage 5 - After image upload:', manager.getCurrentState().stage);
  
  console.log('\n✅ Flow test complete!');
  console.log('Upload button should show when stage = asking_image or asking_quantity');
}

testFlow();
