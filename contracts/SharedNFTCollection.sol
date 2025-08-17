// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SharedNFTCollection
 * @dev A shared NFT collection where anyone can add NFTs through the AI assistant
 * Perfect for community-driven collections where multiple wallets can contribute
 */
contract SharedNFTCollection is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    // Mapping from token ID to creator (who minted it)
    mapping(uint256 => address) public tokenCreator;
    
    // Mapping from creator to their token count
    mapping(address => uint256) public creatorTokenCount;
    
    // Array of all creators
    address[] public creators;
    mapping(address => bool) public isCreator;
    
    // Collection stats
    uint256 public totalContributors;
    uint256 public totalNFTsCreated;
    
    // Events
    event NFTAddedToCollection(uint256 indexed tokenId, address indexed creator, address indexed owner, string tokenURI);
    event NewContributor(address indexed creator, uint256 contributorNumber);
    
    /**
     * @dev Constructor
     * @param name The name of the shared NFT collection
     * @param symbol The symbol of the shared NFT collection
     * @param owner The address that will own the contract (can be the deployer or a DAO)
     */
    constructor(
        string memory name,
        string memory symbol,
        address owner
    ) ERC721(name, symbol) Ownable(owner) {
        _nextTokenId = 1; // Start token IDs at 1
        totalContributors = 0;
        totalNFTsCreated = 0;
    }
    
    /**
     * @dev Add an NFT to the shared collection (anyone can call this)
     * @param to The address to mint the NFT to (usually the creator)
     * @param uri The metadata URI for the NFT
     * @param creatorWallet The wallet address of the person creating the NFT
     * @return tokenId The ID of the newly minted token
     */
    function addNFTToCollection(address to, string memory uri, address creatorWallet) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        // Track new contributor
        if (!isCreator[creatorWallet]) {
            creators.push(creatorWallet);
            isCreator[creatorWallet] = true;
            totalContributors++;
            emit NewContributor(creatorWallet, totalContributors);
        }
        
        // Mint the NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Track creator and stats
        tokenCreator[tokenId] = creatorWallet;
        creatorTokenCount[creatorWallet]++;
        totalNFTsCreated++;
        
        emit NFTAddedToCollection(tokenId, creatorWallet, to, uri);
        return tokenId;
    }
    
    /**
     * @dev Batch add multiple NFTs to the collection
     * @param to The address to mint the NFTs to
     * @param tokenURIs Array of metadata URIs for the NFTs
     * @param quantity Number of NFTs to mint
     * @param creatorWallet The wallet address of the person creating the NFTs
     */
    function batchAddNFTsToCollection(
        address to, 
        string[] memory tokenURIs, 
        uint256 quantity,
        address creatorWallet
    ) public {
        require(tokenURIs.length >= quantity, "Not enough token URIs provided");
        
        // Track new contributor
        if (!isCreator[creatorWallet]) {
            creators.push(creatorWallet);
            isCreator[creatorWallet] = true;
            totalContributors++;
            emit NewContributor(creatorWallet, totalContributors);
        }
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            
            tokenCreator[tokenId] = creatorWallet;
            creatorTokenCount[creatorWallet]++;
            totalNFTsCreated++;
            
            emit NFTAddedToCollection(tokenId, creatorWallet, to, tokenURIs[i]);
        }
    }
    
    /**
     * @dev Get collection statistics
     */
    function getCollectionStats() public view returns (
        uint256 totalTokens,
        uint256 contributors,
        uint256 nextTokenId
    ) {
        return (totalNFTsCreated, totalContributors, _nextTokenId);
    }
    
    /**
     * @dev Get creator information
     * @param creator The address of the creator
     */
    function getCreatorInfo(address creator) public view returns (
        bool hasContributed,
        uint256 nftCount
    ) {
        return (isCreator[creator], creatorTokenCount[creator]);
    }
    
    /**
     * @dev Get all contributors
     */
    function getAllContributors() public view returns (address[] memory) {
        return creators;
    }
    
    /**
     * @dev Get the creator of a specific token
     * @param tokenId The ID of the token
     */
    function getTokenCreator(uint256 tokenId) public view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenCreator[tokenId];
    }
    
    /**
     * @dev Get tokens created by a specific creator
     * @param creator The address of the creator
     * @return tokenIds Array of token IDs created by this creator
     */
    function getTokensByCreator(address creator) public view returns (uint256[] memory tokenIds) {
        uint256 totalSupply = _nextTokenId - 1;
        uint256 creatorCount = creatorTokenCount[creator];
        
        if (creatorCount == 0) {
            return new uint256[](0);
        }
        
        tokenIds = new uint256[](creatorCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_ownerOf(i) != address(0) && tokenCreator[i] == creator) {
                tokenIds[index] = i;
                index++;
            }
        }
    }
    
    /**
     * @dev Get the current token ID counter
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _nextTokenId - 1; // Return the last minted token ID
    }
    
    // Override required functions
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
