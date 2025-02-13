// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICCIPReceiver {
    /**
     * @notice Called by the CCIP router to deliver a message
     * @param sourceChainSelector The identifier of the source chain
     * @param sender The address that sent the message
     * @param message The delivered message
     * @param messageId The unique identifier for the message
     */
    function ccipReceive(
        uint64 sourceChainSelector,
        address sender,
        bytes calldata message,
        bytes32 messageId
    ) external;

    /**
     * @notice Called by the CCIP router to deliver tokens
     * @param sourceChainSelector The identifier of the source chain
     * @param sender The address that sent the tokens
     * @param token The token contract address
     * @param amount The amount of tokens received
     * @param messageId The unique identifier for the transfer
     */
    function ccipReceiveTokens(
        uint64 sourceChainSelector,
        address sender,
        address token,
        uint256 amount,
        bytes32 messageId
    ) external;
}
