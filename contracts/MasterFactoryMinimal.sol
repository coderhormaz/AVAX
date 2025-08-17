// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TokenFactory.sol";
import "./NFTFactory.sol";
import "./CustomNFT.sol";
import "./SharedNFTCollection.sol";

/**
 * @title MasterFactory - Minimal Version
 * @dev Optimized master factory for AI assistant with shared NFT collection support
 * Reduced contract size for deployment within limits
 */
contract MasterFactory {
    
    TokenFactory public tokenFactory;
    NFTFactory public nftFactory;
    SharedNFTCollection public sharedCollection;
    bool public sharedCollectionEnabled;
    
    // Events
    event TokenFactoryDeployed(address tokenFactory);
    event NFTFactoryDeployed(address nftFactory);
    event SharedCollectionDeployed(address sharedCollection);
    event NFTAddedToSharedCollection(uint256 indexed tokenId, address indexed creator);
    
    constructor() {
        // Deploy sub-factories
        tokenFactory = new TokenFactory();
        nftFactory = new NFTFactory();
        
        // Deploy shared collection
        sharedCollection = new SharedNFTCollection(
            "AI Community Collection", 
            "AICC", 
            address(this)
        );
        sharedCollectionEnabled = true;
        
        emit TokenFactoryDeployed(address(tokenFactory));
        emit NFTFactoryDeployed(address(nftFactory));
        emit SharedCollectionDeployed(address(sharedCollection));
    }
    
    /**
     * @dev Create a token for users
     */
    function createToken(
        string memory name,
        string memory ticker,
        uint256 supply
    ) public returns (address) {
        return tokenFactory.deployTokenSimple(name, ticker, supply);
    }
    
    /**
     * @dev Create individual NFT collection
     */
    function createNFT(
        string memory nftName,
        string memory /*description*/, 
        string memory metadataURI,
        uint256 quantity
    ) public returns (address nftContract) {
        require(quantity > 0 && quantity <= 10000, "Invalid quantity");
        
        // Generate symbol (first 3 chars + "NFT")
        string memory symbol = string(abi.encodePacked(_getFirstChars(nftName, 3), "NFT"));
        
        // Create NFT collection
        nftContract = nftFactory.deployNFT(nftName, symbol, "", msg.sender);
        
        // Mint NFTs
        CustomNFT deployedNFT = CustomNFT(nftContract);
        for (uint256 i = 0; i < quantity; i++) {
            deployedNFT.mint(msg.sender, metadataURI);
        }
        
        return nftContract;
    }

    /**
     * @dev Add NFT to shared community collection
     */
    function addToSharedCollection(
        string memory /*nftName*/,
        string memory /*description*/,
        string memory metadataURI,
        uint256 quantity,
        address creatorWallet
    ) public returns (uint256[] memory tokenIds) {
        require(sharedCollectionEnabled, "Shared collection disabled");
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
     * @dev Get first N characters for symbol generation
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
     * @dev Get user's deployed contracts
     */
    function getUserContracts(address user) public view returns (
        address[] memory tokens,
        address[] memory nfts
    ) {
        tokens = tokenFactory.getTokensByOwner(user);
        nfts = nftFactory.getNFTsByOwner(user);
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
     * @dev Get factory addresses
     */
    function getFactories() public view returns (address, address, address) {
        return (address(tokenFactory), address(nftFactory), address(sharedCollection));
    }
}
