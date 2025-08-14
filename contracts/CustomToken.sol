// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CustomToken
 * @dev Simple ERC20 token that can be deployed through the AI assistant
 */
contract CustomToken is ERC20, Ownable {
    uint8 private _decimals;
    
    /**
     * @dev Constructor that sets the token name, symbol, initial supply and decimals
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @param initialSupply The initial supply of tokens (in wei, considering decimals)
     * @param decimals_ The number of decimals for the token
     * @param owner The address that will own the contract
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals_,
        address owner
    ) ERC20(name, symbol) Ownable(owner) {
        _decimals = decimals_;
        _mint(owner, initialSupply * (10 ** decimals_));
    }
    
    /**
     * @dev Returns the number of decimals used to get its user representation
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Mint new tokens (only owner can call this)
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint (considering decimals)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount * (10 ** _decimals));
    }
    
    /**
     * @dev Burn tokens from the caller's account
     * @param amount The amount of tokens to burn (considering decimals)
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount * (10 ** _decimals));
    }
    
    /**
     * @dev Burn tokens from a specific account (requires allowance)
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn (considering decimals)
     */
    function burnFrom(address from, uint256 amount) public {
        uint256 amountWithDecimals = amount * (10 ** _decimals);
        _spendAllowance(from, msg.sender, amountWithDecimals);
        _burn(from, amountWithDecimals);
    }
}
