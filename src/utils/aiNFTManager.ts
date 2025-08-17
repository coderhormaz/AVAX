interface NFTCreationState {
  stage: 'idle' | 'asking_name' | 'asking_description' | 'asking_image' | 'asking_quantity' | 'confirming';
  name?: string;
  description?: string;
  hasImage?: boolean;
  imageFile?: File;
  quantity?: number;
  originalMessage?: string;
}

export class AINFTManager {
  private state: NFTCreationState = { stage: 'idle' };

  getCurrentState(): NFTCreationState {
    return { ...this.state };
  }

  // Debug method to check state
  getDebugInfo(): string {
    return `Stage: ${this.state.stage}, Name: ${this.state.name}, HasImage: ${this.state.hasImage}, ImageFile: ${this.state.imageFile ? this.state.imageFile.name : 'none'}`;
  }

  reset(): void {
    this.state = { 
      stage: 'idle',
      name: undefined,
      description: undefined,
      hasImage: false,
      imageFile: undefined,
      quantity: undefined,
      originalMessage: undefined
    };
  }

  setImageFile(file: File): string {
    if (this.state.stage === 'asking_image' || this.state.stage === 'asking_quantity') {
      this.state.imageFile = file;
      this.state.hasImage = true;
      
      if (this.state.stage === 'asking_image') {
        this.state.stage = 'asking_quantity';
        return `✅ **Image Uploaded Successfully!**\n\n📁 **File:** ${file.name}\n📏 **Size:** ${(file.size / 1024 / 1024).toFixed(2)} MB\n\n---\n\n🔢 **Quantity**\n\nHow many copies of this NFT would you like to create?\n\n💡 *Most people choose:*\n• **1** for unique, one-of-a-kind NFTs  \n• **10-100** for limited edition collections  \n• **1000+** for larger drops  \n\nEnter a number (1-10000):`;
      } else {
        return `✅ **Image Updated!**\n\n📁 **File:** ${file.name}\n📏 **Size:** ${(file.size / 1024 / 1024).toFixed(2)} MB\n\nNow enter the quantity (1-10000):`;
      }
    }
    
    return "Please start NFT creation first by typing 'create nft'";
  }

  async processUserInput(userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase().trim();

    // If starting fresh NFT creation
    if (this.state.stage === 'idle') {
      // Check if this is actually an NFT request
      const isNFTRequest = /(nft|collectible|digital art|non-fungible|artwork|art|erc721|mint)/.test(userMessage.toLowerCase());
      
      if (!isNFTRequest) {
        return "I think you might want to create a token instead of an NFT. For tokens, try: 'create token called MyToken ticker MTK supply 1000000'";
      }
      
      // Parse the initial message for any provided details
      const extractedName = this.extractNFTName(userMessage);
      
      this.state = {
        stage: 'asking_name',
        originalMessage: userMessage,
        name: extractedName
      };

      if (extractedName) {
        this.state.stage = 'asking_description';
        return `🎨 **Great! Creating NFT: "${extractedName}"**\n\nNow, let's add some personality! What description would you like for your NFT?\n\n💡 *Examples:*\n• "A unique digital artwork featuring..."  \n• "Limited edition collectible from..."  \n• "Special commemorative piece..."  \n\nOr type **"skip"** to use a default description.`;
      } else {
        return `🎨 **Let's Create Your NFT!**\n\nFirst, what would you like to name your NFT?\n\n💡 *Examples:*\n• "CoolArt #1"  \n• "My Digital Masterpiece"  \n• "Pixel Dragon"  \n\nWhat's the perfect name for your creation? ✨`;
      }
    }

    // Handle name input
    if (this.state.stage === 'asking_name') {
      if (lowerMessage === 'cancel' || lowerMessage === 'stop') {
        this.reset();
        return "NFT creation cancelled. Feel free to start again anytime! 😊";
      }

      this.state.name = userMessage.trim();
      this.state.stage = 'asking_description';
      
      return `🎨 **Perfect! NFT Name: "${this.state.name}"**\n\nNow, let's add some personality! What description would you like for your NFT?\n\n💡 *Examples:*\n• "A unique digital artwork featuring..."  \n• "Limited edition collectible from..."  \n• "Special commemorative piece..."  \n\nOr type **"skip"** to use a default description.`;
    }

    // Handle description input
    if (this.state.stage === 'asking_description') {
      if (lowerMessage === 'cancel' || lowerMessage === 'stop') {
        this.reset();
        return "NFT creation cancelled. Feel free to start again anytime! 😊";
      }

      if (lowerMessage === 'skip' || lowerMessage === 'no' || lowerMessage === 'none') {
        this.state.description = `A unique NFT called "${this.state.name}" created on Avalanche blockchain.`;
      } else {
        this.state.description = userMessage.trim();
      }
      
      this.state.stage = 'asking_image';
      
      return `📝 **Description Set!**\n\n${this.state.description}\n\n---\n\n📸 **Image Upload Required**\n\nNow you need to upload an image for your NFT!\n\n**Your image will be:**\n• Uploaded to IPFS (permanent, decentralized storage)\n• Linked to your NFT forever\n• Viewable on all NFT marketplaces\n\n**Supported formats:** JPEG, PNG, GIF, WebP  \n**Max size:** 10MB\n\nPlease use the upload button below to select your image file! 📁✨`;
    }

    // Handle image upload step - stay here until file is uploaded
    if (this.state.stage === 'asking_image') {
      if (lowerMessage === 'cancel' || lowerMessage === 'stop') {
        this.reset();
        return "NFT creation cancelled. Feel free to start again anytime! 😊";
      }

      // If user types anything other than cancel, remind them to upload
      return `📸 **Waiting for Image Upload**\n\nPlease use the green upload button below to select your NFT image file.\n\n**Supported formats:** JPEG, PNG, GIF, WebP\n**Max size:** 10MB\n\nOnce you upload an image, I'll ask about quantity! �✨`;
    }

    // Handle quantity input
    if (this.state.stage === 'asking_quantity') {
      if (lowerMessage === 'cancel' || lowerMessage === 'stop') {
        this.reset();
        return "NFT creation cancelled. Feel free to start again anytime! 😊";
      }

      // Check if image is uploaded before accepting quantity
      if (!this.state.imageFile) {
        return `❌ **Image Required First!**\n\nPlease upload an image using the green upload button before setting quantity.\n\n**Supported formats:** JPEG, PNG, GIF, WebP\n**Max size:** 10MB\n\nOnce you upload an image, then tell me the quantity! 📁`;
      }

      const quantity = parseInt(lowerMessage);
      if (isNaN(quantity) || quantity < 1 || quantity > 10000) {
        return `❌ **Invalid Quantity**\n\nPlease enter a number between 1 and 10000.\n\nHow many copies would you like? 🔢`;
      }

      this.state.quantity = quantity;
      this.state.stage = 'confirming';

      const summary = this.createConfirmationSummary();
      return summary;
    }

    // Handle confirmation
    if (this.state.stage === 'confirming') {
      if (lowerMessage === 'yes' || lowerMessage === 'y' || lowerMessage === 'confirm' || lowerMessage === 'create') {
        // Check if image file is uploaded
        if (!this.state.imageFile) {
          return `❌ **Image Required!**\n\nPlease upload an image file before proceeding. Use the upload button below to select your NFT image.\n\nOnce uploaded, type **"yes"** again to confirm.`;
        }
        
        const deployData = {
          name: this.state.name!,
          description: this.state.description!,
          quantity: this.state.quantity!,
          imageFile: this.state.imageFile,
          hasCustomImage: true
        };
        
        this.reset();
        return this.formatDeploymentMessage(deployData);
      } else if (lowerMessage === 'no' || lowerMessage === 'n' || lowerMessage === 'cancel') {
        this.reset();
        return "NFT creation cancelled. Feel free to start over anytime! 😊";
      } else if (lowerMessage === 'edit' || lowerMessage === 'change' || lowerMessage === 'modify') {
        this.state.stage = 'asking_name';
        return `🔄 **Let's Start Over!**\n\nWhat would you like to name your NFT?\n\n💡 *Current name: "${this.state.name}"*`;
      } else {
        const summary = this.createConfirmationSummary();
        return summary;
      }
    }

    return "I'm not sure what you mean. Could you please clarify? 🤔";
  }

  private extractNFTName(message: string): string | undefined {
    // Look for patterns like "create nft called X" or "make nft named Y"
    const patterns = [
      /create\s+nft\s+(?:called|named|titled)?\s*["']?([^"']+)["']?/i,
      /make\s+nft\s+(?:called|named|titled)?\s*["']?([^"']+)["']?/i,
      /mint\s+nft\s+(?:called|named|titled)?\s*["']?([^"']+)["']?/i,
      /create\s+(?:an?\s+)?nft\s+(?:called|named|titled)\s+["']?([^"']+)["']?/i,
      /make\s+(?:an?\s+)?nft\s+(?:called|named|titled)\s+["']?([^"']+)["']?/i,
      /mint\s+(?:an?\s+)?nft\s+(?:called|named|titled)\s+["']?([^"']+)["']?/i,
      /(?:called|named|titled)\s+["']?([^"']+)["']?/i,
      // Handle simple "create nft MyName" patterns
      /create\s+nft\s+([a-zA-Z0-9\s]+?)(?:\s+with|\s+description|$)/i,
      /make\s+nft\s+([a-zA-Z0-9\s]+?)(?:\s+with|\s+description|$)/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Filter out common words that shouldn't be part of the name
        const filteredName = name.replace(/\b(nft|token|called|named|create|make|mint|with|description)\b/gi, '').trim();
        return filteredName || name; // Return filtered name, or original if filtering removes everything
      }
    }

    return undefined;
  }

  private createConfirmationSummary(): string {
    const imageInfo = this.state.imageFile 
      ? `Custom upload: ${this.state.imageFile.name} (${(this.state.imageFile.size / 1024 / 1024).toFixed(2)} MB)`
      : '❌ No image uploaded - Please upload an image first!';
      
    return `✨ **NFT Creation Summary**\n\n🏷️ **Name:** ${this.state.name}\n📝 **Description:** ${this.state.description}\n🎨 **Image:** ${imageInfo}\n🔢 **Quantity:** ${this.state.quantity}\n\n---\n\n💰 **Gas Fee:** ~0.01 AVAX (estimated)\n⏱️ **Time:** ~30-60 seconds\n🌐 **Network:** Avalanche Mainnet\n\n**Ready to create your NFT?**\n\n• Type **"yes"** to proceed ✅  \n• Type **"no"** to cancel ❌  \n• Type **"edit"** to modify details 📝`;
  }

  private formatDeploymentMessage(data: any): string {
    return `🚀 **Creating Your NFT...**\n\n⏳ Please wait while I:\n• Generate NFT artwork\n• Upload metadata to IPFS\n• Deploy NFT contract\n• Mint ${data.quantity} ${data.quantity === 1 ? 'copy' : 'copies'}\n\nThis will take about 30-60 seconds... ✨\n\n_${JSON.stringify(data)}_`;
  }
}

// Create singleton instance
export const aiNFTManager = new AINFTManager();
