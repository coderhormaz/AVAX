// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SharedNFTCollection.sol";

/**
 * @title MasterFactory - Ultra Minimal Version
 * @dev Minimal factory focusing only on shared NFT collection
 * Maximum size optimization for deployment within limits
 */
contract MasterFactory {
    
    SharedNFTCollection public sharedCollection;
    bool public sharedCollectionEnabled;
    
    // Externally deployed factories (to reduce size)
    address public tokenFactory;
    address public nftFactory;
    
    event SharedCollectionDeployed(address sharedCollection);
    event NFTAddedToSharedCollection(uint256 indexed tokenId, address indexed creator);
    
    constructor(address _tokenFactory, address _nftFactory) {
        // Use pre-deployed factories to reduce contract size
        tokenFactory = _tokenFactory;
        nftFactory = _nftFactory;
        
        // Deploy only the shared collection
        sharedCollection = new SharedNFTCollection(
            "AI Community Collection", 
            "AICC", 
            address(this)
        );
        sharedCollectionEnabled = true;
        
        emit SharedCollectionDeployed(address(sharedCollection));
    }
    
    /**
     * @dev Add NFT to shared community collection (MAIN FUNCTION)
     */
    function addToSharedCollection(
        string memory,
        string memory,
        string memory metadataURI,
        uint256 quantity,
        address creatorWallet
    ) public returns (uint256[] memory tokenIds) {
        require(sharedCollectionEnabled, "Disabled");
        require(quantity > 0 && quantity <= 100, "Invalid quantity");
        
        tokenIds = new uint256[](quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = sharedCollection.addNFTToCollection(
                creatorWallet,
                metadataURI,
                creatorWallet
            );
            tokenIds[i] = tokenId;
            emit NFTAddedToSharedCollection(tokenId, creatorWallet);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Get shared collection info
     */
    function getSharedCollectionInfo() public view returns (
        address collectionAddress,
        string memory name,
        string memory symbol,
        uint256 totalNFTs,
        uint256 totalContributors,
        bool enabled
    ) {
        collectionAddress = address(sharedCollection);
        name = sharedCollection.name();
        symbol = sharedCollection.symbol();
        (totalNFTs, totalContributors,) = sharedCollection.getCollectionStats();
        enabled = sharedCollectionEnabled;
    }
    
    /**
     * @dev Get user's shared collection stats
     */
    function getUserSharedCollectionStats(address user) public view returns (
        bool hasContributed,
        uint256 nftCount,
        uint256[] memory tokenIds
    ) {
        (hasContributed, nftCount) = sharedCollection.getCreatorInfo(user);
        if (hasContributed) {
            tokenIds = sharedCollection.getTokensByCreator(user);
        }
    }
    
    /**
     * @dev Get addresses
     */
    function getFactories() public view returns (address, address, address) {
        return (tokenFactory, nftFactory, address(sharedCollection));
    }
}
