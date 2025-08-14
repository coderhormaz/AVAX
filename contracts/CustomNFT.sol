// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CustomNFT
 * @dev NFT contract that can be used to mint NFTs through the AI assistant
 */
contract CustomNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Mapping from token ID to creator
    mapping(uint256 => address) public tokenCreator;
    
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed to, string tokenURI);
    event BaseURIChanged(string newBaseURI);
    
    /**
     * @dev Constructor
     * @param name The name of the NFT collection
     * @param symbol The symbol of the NFT collection
     * @param owner The address that will own the contract
     * @param baseURI The base URI for token metadata
     */
    constructor(
        string memory name,
        string memory symbol,
        address owner,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(owner) {
        _baseTokenURI = baseURI;
        _nextTokenId = 1; // Start token IDs at 1
    }
    
    /**
     * @dev Mint a new NFT
     * @param to The address to mint the NFT to
     * @param uri The metadata URI for the NFT
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        tokenCreator[tokenId] = msg.sender;
        
        emit NFTMinted(tokenId, to, uri);
        return tokenId;
    }
    
    /**
     * @dev Batch mint NFTs
     * @param to The address to mint the NFTs to
     * @param tokenURIs Array of metadata URIs for the NFTs
     * @param quantity Number of NFTs to mint
     */
    function batchMint(address to, string[] memory tokenURIs, uint256 quantity) public {
        require(tokenURIs.length >= quantity, "Not enough token URIs provided");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            
            tokenCreator[tokenId] = msg.sender;
            
            emit NFTMinted(tokenId, to, tokenURIs[i]);
        }
    }
    
    /**
     * @dev Set the base URI for token metadata
     * @param baseURI The new base URI
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIChanged(baseURI);
    }
    
    /**
     * @dev Get the base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Get the current token ID counter
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _nextTokenId - 1; // Return the last minted token ID
    }
    
    /**
     * @dev Get the creator of a token
     * @param tokenId The ID of the token
     */
    function getTokenCreator(uint256 tokenId) public view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenCreator[tokenId];
    }
    
    // Override required functions
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
