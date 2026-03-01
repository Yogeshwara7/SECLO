// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PayrollConsumer
 * @notice Receives payroll reports from CRE workflow and executes ERC20 transfers
 */
contract PayrollConsumer is Ownable {
    
    struct PayrollBatch {
        address[] employees;
        uint256[] amounts;
        address tokenAddress;
    }
    
    IERC20 public scloToken;
    address public forwarderAddress;
    
    event PayrollExecuted(uint256 totalEmployees, uint256 totalAmount);
    event PaymentSent(address indexed employee, uint256 amount);
    
    modifier onlyForwarder() {
        require(msg.sender == forwarderAddress, "Only forwarder can call");
        _;
    }
    
    constructor(
        address _forwarderAddress,
        address _scloTokenAddress
    ) Ownable(msg.sender) {
        forwarderAddress = _forwarderAddress;
        scloToken = IERC20(_scloTokenAddress);
    }
    
    /**
     * @notice Process the payroll report from CRE workflow
     * @param metadata Metadata (unused for now)
     * @param report ABI-encoded PayrollBatch struct
     */
    function onReport(bytes calldata metadata, bytes calldata report) external onlyForwarder {
        PayrollBatch memory batch = abi.decode(report, (PayrollBatch));
        
        require(batch.employees.length == batch.amounts.length, "Length mismatch");
        require(batch.employees.length > 0, "Empty batch");
        
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < batch.employees.length; i++) {
            require(
                scloToken.transfer(batch.employees[i], batch.amounts[i]),
                "Transfer failed"
            );
            emit PaymentSent(batch.employees[i], batch.amounts[i]);
            totalAmount += batch.amounts[i];
        }
        
        emit PayrollExecuted(batch.employees.length, totalAmount);
    }
    
    /**
     * @notice Allow owner to withdraw tokens if needed
     */
    function withdrawTokens(address to, uint256 amount) external onlyOwner {
        require(scloToken.transfer(to, amount), "Withdrawal failed");
    }
    
    /**
     * @notice Get contract's token balance
     */
    function getBalance() external view returns (uint256) {
        return scloToken.balanceOf(address(this));
    }
    
    /**
     * @notice Update forwarder address (owner only)
     */
    function setForwarder(address _forwarderAddress) external onlyOwner {
        forwarderAddress = _forwarderAddress;
    }
}
