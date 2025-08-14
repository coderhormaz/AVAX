// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CustomToken.sol";

/**
 * @title TokenFactory
 * @dev Factory contract for deploying CustomToken contracts through AI assistant
 */
contract TokenFactory {
    
    // Event emitted when a new token is deployed
    event TokenDeployed(
        address indexed tokenAddress,
        address indexed owner,
        string name,
        string symbol,
        uint256 initialSupply,
        uint8 decimals
    );
    
    // Array to keep track of all deployed tokens
    address[] public deployedTokens;
    
    // Mapping from owner to their deployed tokens
    mapping(address => address[]) public ownerToTokens;
    
    /**
     * @dev Deploy a new CustomToken contract
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param initialSupply The initial supply of tokens (without decimals, e.g., 1000000 for 1M tokens)
     * @param decimals_ The number of decimals for the token (usually 18)
     * @param owner The address that will own the contract (use msg.sender for caller)
     */
    function deployToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals_,
        address owner
    ) public returns (address) {
        // Use msg.sender as owner if address(0) is passed
        address tokenOwner = owner == address(0) ? msg.sender : owner;
        
        // Deploy new CustomToken
        CustomToken newToken = new CustomToken(
            name,
            symbol,
            initialSupply,
            decimals_,
            tokenOwner
        );
        
        address tokenAddress = address(newToken);
        
        // Track the deployed token
        deployedTokens.push(tokenAddress);
        ownerToTokens[tokenOwner].push(tokenAddress);
        
        // Emit event
        emit TokenDeployed(
            tokenAddress,
            tokenOwner,
            name,
            symbol,
            initialSupply,
            decimals_
        );
        
        return tokenAddress;
    }
    
    /**
     * @dev Deploy a token with default parameters (18 decimals, caller as owner)
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param initialSupply The initial supply of tokens (without decimals)
     */
    function deployTokenSimple(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) public returns (address) {
        return deployToken(name, symbol, initialSupply, 18, msg.sender);
    }
    
    /**
     * @dev Get all deployed tokens
     */
    function getAllDeployedTokens() public view returns (address[] memory) {
        return deployedTokens;
    }
    
    /**
     * @dev Get tokens deployed by a specific owner
     */
    function getTokensByOwner(address owner) public view returns (address[] memory) {
        return ownerToTokens[owner];
    }
    
    /**
     * @dev Get the total number of deployed tokens
     */
    function getDeployedTokenCount() public view returns (uint256) {
        return deployedTokens.length;
    }
}
