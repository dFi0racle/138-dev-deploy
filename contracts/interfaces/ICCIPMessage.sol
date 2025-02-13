// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICCIPMessage
 * @notice Interface for cross-chain message format standardization
 */
interface ICCIPMessage {
    struct Message {
        bytes32 messageId;
        address sender;
        uint64 sourceChainSelector;
        uint64 destinationChainSelector;
        bytes payload;
        uint256 timestamp;
    }

    struct TokenTransfer {
        bytes32 transferId;
        address token;
        uint256 amount;
        address sender;
        address receiver;
        uint64 sourceChainSelector;
        uint64 destinationChainSelector;
        uint256 timestamp;
    }

    event MessageSent(
        bytes32 indexed messageId,
        address indexed sender,
        uint64 sourceChainSelector,
        uint64 destinationChainSelector,
        bytes payload
    );

    event MessageReceived(
        bytes32 indexed messageId,
        address indexed sender,
        uint64 sourceChainSelector,
        uint64 destinationChainSelector,
        bytes payload
    );

    event TokenTransferSent(
        bytes32 indexed transferId,
        address indexed token,
        uint256 amount,
        address indexed sender,
        address receiver,
        uint64 sourceChainSelector,
        uint64 destinationChainSelector
    );

    event TokenTransferReceived(
        bytes32 indexed transferId,
        address indexed token,
        uint256 amount,
        address indexed sender,
        address receiver,
        uint64 sourceChainSelector,
        uint64 destinationChainSelector
    );
}
