// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TokenFactory.sol";
import "./NFTFactory.sol";

/**
 * @title MasterFactory
 * @dev Master factory contract for AI assistant to deploy both tokens and NFTs
 */
contract MasterFactory {
    
    TokenFactory public tokenFactory;
    NFTFactory public nftFactory;
    
    // Events
    event TokenFactoryDeployed(address tokenFactory);
    event NFTFactoryDeployed(address nftFactory);
    
    constructor() {
        // Deploy sub-factories
        tokenFactory = new TokenFactory();
        nftFactory = new NFTFactory();
        
        emit TokenFactoryDeployed(address(tokenFactory));
        emit NFTFactoryDeployed(address(nftFactory));
    }
    
    /**
     * @dev Create a token for users - AI Assistant Interface
     * @param name Token name (user input: "My Awesome Token")
     * @param ticker Token symbol/ticker (user input: "MAT")
     * @param supply Total token supply (user input: 1000000)
     */
    function createToken(
        string memory name,
        string memory ticker,
        uint256 supply
    ) public returns (address) {
        return tokenFactory.deployTokenSimple(name, ticker, supply);
    }
    
    /**
     * @dev Create NFT(s) for users - AI Assistant Interface  
     * @param nftName Name of the NFT (user input: "My Cool NFT")
     * @param description Description of the NFT (will be included in metadata)
     * @param imageURI URI of the uploaded image (IPFS hash from image upload)
     * @param quantity How many NFTs to mint (currently limited to 1 for simplicity)
     */
    function createNFT(
        string memory nftName,
        string memory description, 
        string memory imageURI,
        uint256 quantity
    ) public returns (address nftContract) {
        // For now, we only support quantity of 1
        require(quantity > 0, "Quantity must be greater than 0");
        
        // Generate collection symbol from name (first 3 chars + "NFT")
        string memory symbol = string(abi.encodePacked(_getFirstChars(nftName, 3), "NFT"));
        
        // Create metadata URI that includes description
        // In a full implementation, this would be properly formatted JSON metadata
        string memory metadataURI = string(abi.encodePacked(
            imageURI, 
            "?description=", 
            _urlEncode(description)
        ));
        
        // Create the NFT collection contract using NFTFactory
        nftContract = nftFactory.deployNFT(
            nftName,
            symbol,
            metadataURI, // Use enhanced metadata URI
            msg.sender
        );
        
        // Note: For quantity > 1, additional minting would need to be implemented
        // Currently returns the contract for single NFT creation
        return nftContract;
    }
    
    /**
     * @dev Simple URL encoding for description (basic implementation)
     */
    function _urlEncode(string memory str) internal pure returns (string memory) {
        // Basic implementation - replace spaces with %20
        bytes memory strBytes = bytes(str);
        uint256 spaceCount = 0;
        
        // Count spaces
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == 0x20) { // space character
                spaceCount++;
            }
        }
        
        if (spaceCount == 0) {
            return str; // No spaces to encode
        }
        
        // Create new bytes array with extra space for %20
        bytes memory encoded = new bytes(strBytes.length + spaceCount * 2);
        uint256 encodedIndex = 0;
        
        for (uint256 i = 0; i < strBytes.length; i++) {
            if (strBytes[i] == 0x20) { // space
                encoded[encodedIndex++] = 0x25; // %
                encoded[encodedIndex++] = 0x32; // 2
                encoded[encodedIndex++] = 0x30; // 0
            } else {
                encoded[encodedIndex++] = strBytes[i];
            }
        }
        
        return string(encoded);
    }
    
    /**
     * @dev Helper function to get first N characters for symbol generation
     */
    function _getFirstChars(string memory str, uint256 n) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        if (strBytes.length == 0) return "NFT";
        
        uint256 len = strBytes.length < n ? strBytes.length : n;
        bytes memory result = new bytes(len);
        
        for (uint256 i = 0; i < len; i++) {
            result[i] = strBytes[i];
        }
        
        return string(result);
    }
    
    /**
     * @dev Get all user's deployed contracts
     */
    function getUserContracts(address user) public view returns (
        address[] memory tokens,
        address[] memory nfts
    ) {
        tokens = tokenFactory.getTokensByOwner(user);
        nfts = nftFactory.getNFTsByOwner(user);
    }
    
    /**
     * @dev Get factory addresses for direct interaction
     */
    function getFactories() public view returns (address, address) {
        return (address(tokenFactory), address(nftFactory));
    }
}
