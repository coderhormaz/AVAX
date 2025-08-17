// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SharedNFTCollection.sol";

/**
 * @title SharedCollectionFactory - Shared NFT Collection Only
 * @dev Ultra-minimal factory for shared NFT collection deployment
 * Fits within contract size limits
 */
contract SharedCollectionFactory {
    
    SharedNFTCollection public collection;
    
    event NFTAdded(uint256 indexed tokenId, address indexed creator);
    
    constructor() {
        collection = new SharedNFTCollection(
            "AI Community Collection", 
            "AICC", 
            address(this)
        );
    }
    
    /**
     * @dev Add NFT to shared collection
     */
    function addNFT(
        string memory metadataURI,
        uint256 quantity,
        address creator
    ) public returns (uint256[] memory tokenIds) {
        require(quantity > 0 && quantity <= 100, "Invalid quantity");
        
        tokenIds = new uint256[](quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = collection.addNFTToCollection(
                creator,
                metadataURI,
                creator
            );
            tokenIds[i] = tokenId;
            emit NFTAdded(tokenId, creator);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Get collection info
     */
    function getInfo() public view returns (
        address addr,
        string memory name,
        string memory symbol,
        uint256 total,
        uint256 contributors
    ) {
        addr = address(collection);
        name = collection.name();
        symbol = collection.symbol();
        (total, contributors,) = collection.getCollectionStats();
    }
    
    /**
     * @dev Get user stats
     */
    function getUserStats(address user) public view returns (
        bool contributed,
        uint256 count,
        uint256[] memory tokens
    ) {
        (contributed, count) = collection.getCreatorInfo(user);
        if (contributed) {
            tokens = collection.getTokensByCreator(user);
        }
    }
}
