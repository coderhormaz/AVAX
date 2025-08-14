// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CustomNFT.sol";

/**
 * @title NFTFactory
 * @dev Factory contract for deploying CustomNFT contracts through AI assistant
 */
contract NFTFactory {
    
    // Event emitted when a new NFT collection is deployed
    event NFTDeployed(
        address indexed nftAddress,
        address indexed owner,
        string name,
        string symbol,
        string baseURI
    );
    
    // Array to keep track of all deployed NFT collections
    address[] public deployedNFTs;
    
    // Mapping from owner to their deployed NFT collections
    mapping(address => address[]) public ownerToNFTs;
    
    /**
     * @dev Deploy a new CustomNFT contract
     * @param name The name of the NFT collection
     * @param symbol The symbol of the NFT collection
     * @param baseURI The base URI for token metadata
     * @param owner The address that will own the contract (use msg.sender for caller)
     */
    function deployNFT(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address owner
    ) public returns (address) {
        // Use msg.sender as owner if address(0) is passed
        address nftOwner = owner == address(0) ? msg.sender : owner;
        
        // Deploy new CustomNFT
        CustomNFT newNFT = new CustomNFT(
            name,
            symbol,
            nftOwner,
            baseURI
        );
        
        address nftAddress = address(newNFT);
        
        // Track the deployed NFT
        deployedNFTs.push(nftAddress);
        ownerToNFTs[nftOwner].push(nftAddress);
        
        // Emit event
        emit NFTDeployed(
            nftAddress,
            nftOwner,
            name,
            symbol,
            baseURI
        );
        
        return nftAddress;
    }
    
    /**
     * @dev Deploy an NFT with caller as owner
     * @param name The name of the NFT collection
     * @param symbol The symbol of the NFT collection
     * @param baseURI The base URI for token metadata
     */
    function deployNFTSimple(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) public returns (address) {
        return deployNFT(name, symbol, baseURI, msg.sender);
    }
    
    /**
     * @dev Deploy an NFT with default IPFS base URI pattern
     * @param name The name of the NFT collection
     * @param symbol The symbol of the NFT collection
     */
    function deployNFTWithDefaultURI(
        string memory name,
        string memory symbol
    ) public returns (address) {
        // Default IPFS metadata URI pattern
        string memory defaultURI = "https://ipfs.io/ipfs/";
        return deployNFT(name, symbol, defaultURI, msg.sender);
    }
    
    /**
     * @dev Get all deployed NFT collections
     */
    function getAllDeployedNFTs() public view returns (address[] memory) {
        return deployedNFTs;
    }
    
    /**
     * @dev Get NFT collections deployed by a specific owner
     */
    function getNFTsByOwner(address owner) public view returns (address[] memory) {
        return ownerToNFTs[owner];
    }
    
    /**
     * @dev Get the total number of deployed NFT collections
     */
    function getDeployedNFTCount() public view returns (uint256) {
        return deployedNFTs.length;
    }
}
