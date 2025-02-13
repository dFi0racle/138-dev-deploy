// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICCIPRouter {
    /**
     * @notice Sends a cross-chain message
     * @param destinationChainSelector The identifier for the destination chain
     * @param receiver The address of the receiving contract
     * @param message The encoded message to be sent
     * @return messageId The unique identifier for tracking the message
     */
    function sendMessage(
        uint64 destinationChainSelector,
        address receiver,
        bytes calldata message
    ) external payable returns (bytes32 messageId);
    
    /**
     * @notice Sends tokens across chains
     * @param destinationChainSelector The identifier for the destination chain
     * @param receiver The address receiving the tokens
     * @param token The token contract address
     * @param amount The amount of tokens to transfer
     * @return messageId The unique identifier for tracking the transfer
     */
    function sendTokens(
        uint64 destinationChainSelector,
        address receiver,
        address token,
        uint256 amount
    ) external payable returns (bytes32 messageId);

    /**
     * @notice Gets the fee required for sending a message
     * @param destinationChainSelector The identifier for the destination chain
     * @param message The message to be sent
     * @return fee The fee in native currency
     */
    function getFee(
        uint64 destinationChainSelector,
        bytes calldata message
    ) external view returns (uint256 fee);

    /**
     * @notice Gets the fee required for sending tokens
     * @param destinationChainSelector The identifier for the destination chain
     * @param token The token contract address
     * @param amount The amount of tokens to transfer
     * @return fee The fee in native currency
     */
    function getTokenTransferFee(
        uint64 destinationChainSelector,
        address token,
        uint256 amount
    ) external view returns (uint256 fee);
}
