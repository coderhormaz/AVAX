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
     * @dev Deploy a token with AI-friendly interface
     * @param tokenName Name like "My Awesome Token"
     * @param tokenSymbol Symbol like "MAT"  
     * @param supply Total supply without decimals (e.g., 1000000 for 1M tokens)
     * @param decimals Number of decimals (18 is standard)
     */
    function createToken(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 supply,
        uint8 decimals
    ) public returns (address) {
        return tokenFactory.deployToken(
            tokenName,
            tokenSymbol,
            supply,
            decimals,
            msg.sender
        );
    }
    
    /**
     * @dev Deploy a token with standard settings (18 decimals)
     * @param tokenName Name like "My Awesome Token"
     * @param tokenSymbol Symbol like "MAT"
     * @param supply Total supply without decimals
     */
    function createTokenSimple(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 supply
    ) public returns (address) {
        return tokenFactory.deployTokenSimple(tokenName, tokenSymbol, supply);
    }
    
    /**
     * @dev Deploy an NFT collection
     * @param collectionName Name like "My NFT Collection"
     * @param collectionSymbol Symbol like "MNC"
     * @param metadataBaseURI Base URI for metadata (IPFS, etc.)
     */
    function createNFT(
        string memory collectionName,
        string memory collectionSymbol,
        string memory metadataBaseURI
    ) public returns (address) {
        return nftFactory.deployNFT(
            collectionName,
            collectionSymbol,
            metadataBaseURI,
            msg.sender
        );
    }
    
    /**
     * @dev Deploy an NFT collection with default IPFS URI
     * @param collectionName Name like "My NFT Collection"
     * @param collectionSymbol Symbol like "MNC"
     */
    function createNFTSimple(
        string memory collectionName,
        string memory collectionSymbol
    ) public returns (address) {
        return nftFactory.deployNFTWithDefaultURI(collectionName, collectionSymbol);
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
