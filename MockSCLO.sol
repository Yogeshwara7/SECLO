// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockSCLO
 * @notice Mock SCLO token for testing on Tenderly Virtual TestNet
 */
contract MockSCLO is ERC20 {
    constructor() ERC20("SCLO", "SCLO") {
        // Mint 1 million SCLO to deployer
        _mint(msg.sender, 1000000 ether);
    }
    
    /**
     * @notice Mint additional tokens (for testing)
     * @param to Recipient address
     * @param amount Amount to mint (in wei)
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
