// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ReceiverTemplate.sol";

/**
 * @title PayrollConsumer
 * @notice Receives payroll reports from CRE workflow and executes ERC20 transfers
 */
contract PayrollConsumer is ReceiverTemplate {
    
    struct PayrollBatch {
        address[] employees;
        uint256[] amounts;
        address tokenAddress;
    }
    
    IERC20 public scloToken;
    
    event PayrollExecuted(uint256 totalEmployees, uint256 totalAmount);
    event PaymentSent(address indexed employee, uint256 amount);
    
    constructor(
        address _forwarderAddress,
        address _scloTokenAddress
    ) ReceiverTemplate(_forwarderAddress) {
        scloToken = IERC20(_scloTokenAddress);
    }
    
    /**
     * @notice Process the payroll report from CRE workflow
     * @param report ABI-encoded PayrollBatch struct
     */
    function _processReport(bytes calldata report) internal override {
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
}
