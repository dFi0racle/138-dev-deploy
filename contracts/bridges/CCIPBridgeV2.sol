// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "../interfaces/IBridge.sol";
import "../interfaces/IOracle.sol";
import "../interfaces/ICCIPMessage.sol";
import "../security/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CCIPBridgeV2
 * @notice Bridge contract for cross-chain token transfers and message passing using Chainlink CCIP
 * @dev Supports high-volume transfers across top 10 EVM chains with comprehensive reporting
 */
contract CCIPBridgeV2 is IBridge, ICCIPMessage, CCIPReceiver, AccessControl, ReentrancyGuard {
    using Client for Client.EVM2AnyMessage;

    // State variables
    mapping(uint64 => bool) public supportedChains;
    mapping(bytes32 => bool) public processedMessages;
    mapping(bytes32 => bool) public processedTransfers;
    mapping(address => uint256) public nonces;
    uint256 public messageGasLimit;
    
    // Roles
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");
    
    // Errors
    error UnsupportedChain(uint64 chainSelector);
    error MessageAlreadyProcessed(bytes32 messageId);
    error TransferAlreadyProcessed(bytes32 transferId);
    error InsufficientFee();
    error TokenTransferFailed();
    
    /**
     * @notice Contract constructor
     * @param _router Address of the CCIP Router contract
     * @param _supportedChains Array of initially supported chain selectors
     */
    constructor(
        address _router,
        uint64[] memory _supportedChains
    ) CCIPReceiver(_router) {
        require(_router != address(0), "Invalid router address");
        
        messageGasLimit = 200000; // Default gas limit
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(OPERATOR_ROLE, msg.sender);
        _setupRole(FEE_MANAGER_ROLE, msg.sender);
        
        for (uint256 i = 0; i < _supportedChains.length; i++) {
            supportedChains[_supportedChains[i]] = true;
        }
    }
    
    /**
     * @notice Sends a cross-chain message
     * @param destinationChainSelector The identifier for the destination chain
     * @param receiver The address of the receiving contract
     * @param message The message to be sent
     */
    function sendMessage(
        uint64 destinationChainSelector,
        address receiver,
        bytes calldata message
    ) external payable nonReentrant returns (bytes32) {
        if (!supportedChains[destinationChainSelector]) revert UnsupportedChain(destinationChainSelector);
        
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: message,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: messageGasLimit})
            ),
            feeToken: address(0)
        });
        
        bytes32 messageId = router.ccipSend{value: msg.value}(
            destinationChainSelector,
            evm2AnyMessage
        );
        
        emit MessageSent(
            messageId,
            msg.sender,
            uint64(block.chainid),
            destinationChainSelector,
            message
        );
        
        return messageId;
    }
    
    /**
     * @notice Sends tokens to another chain
     * @param destinationChainSelector The identifier for the destination chain
     * @param receiver The address receiving the tokens
     * @param token The token contract address
     * @param amount The amount of tokens to transfer
     */
    function bridgeToken(
        address token,
        uint256 amount,
        uint256 targetChainId
    ) external payable nonReentrant override returns (bytes32) {
        uint64 destinationChainSelector = uint64(targetChainId);
        if (!supportedChains[destinationChainSelector]) revert UnsupportedChain(destinationChainSelector);
        
        // High volume transfer checks
        uint256 nonce = nonces[msg.sender]++;
        bytes32 transferId = keccak256(abi.encodePacked(
            msg.sender,
            token,
            amount,
            nonce,
            block.timestamp
        ));
        
        if (processedTransfers[transferId]) revert TransferAlreadyProcessed(transferId);
        
        // Transfer tokens to bridge
        if (!IERC20(token).transferFrom(msg.sender, address(this), amount)) {
            revert TokenTransferFailed();
        }
        
        // Prepare CCIP message
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: token,
            amount: amount
        });
        
        // Add metadata for tracking
        bytes memory metadata = abi.encode(
            transferId,
            nonce,
            block.timestamp,
            msg.sender
        );
        
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(msg.sender),
            data: metadata,
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: messageGasLimit})
            ),
            feeToken: address(0)
        });
        
        bytes32 messageId = router.ccipSend{value: msg.value}(
            destinationChainSelector,
            evm2AnyMessage
        );
        
        // Mark transfer as processed
        processedTransfers[transferId] = true;
        
        emit TokenTransferSent(
            transferId,
            token,
            amount,
            msg.sender,
            msg.sender,
            uint64(block.chainid),
            destinationChainSelector
        );
        
        return messageId;
    }
    
    /**
     * @notice Handles incoming CCIP messages
     * @param sourceChainSelector The source chain identifier
     * @param sender The sender's address
     * @param message The received message
     * @param messageId The unique message identifier
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        bytes32 messageId = message.messageId;
        if (processedMessages[messageId]) revert MessageAlreadyProcessed(messageId);
        if (!supportedChains[message.sourceChainSelector]) revert UnsupportedChain(message.sourceChainSelector);
        
        processedMessages[messageId] = true;
        
        if (message.tokenAmounts.length > 0) {
            // Handle token transfer
            Client.EVMTokenAmount memory tokenAmount = message.tokenAmounts[0];
            bytes memory metadata = message.data;
            (
                bytes32 transferId,
                uint256 nonce,
                uint256 timestamp,
                address sender
            ) = abi.decode(metadata, (bytes32, uint256, uint256, address));
            
            emit TokenTransferReceived(
                transferId,
                tokenAmount.token,
                tokenAmount.amount,
                sender,
                address(this),
                message.sourceChainSelector,
                uint64(block.chainid)
            );
        } else {
            // Handle regular message
            emit MessageReceived(
                messageId,
                abi.decode(message.sender, (address)),
                message.sourceChainSelector,
                uint64(block.chainid),
                message.data
            );
        }
    }
    
    // Admin functions
    
    /**
     * @notice Adds support for a new chain
     * @param chainSelector The chain selector to add
     */
    function addSupportedChain(uint64 chainSelector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedChains[chainSelector] = true;
    }
    
    /**
     * @notice Removes support for a chain
     * @param chainSelector The chain selector to remove
     */
    function removeSupportedChain(uint64 chainSelector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedChains[chainSelector] = false;
    }
    
    /**
     * @notice Updates the gas limit for messages
     * @param newGasLimit The new gas limit to set
     */
    function setMessageGasLimit(uint256 newGasLimit) external onlyRole(FEE_MANAGER_ROLE) {
        messageGasLimit = newGasLimit;
    }

    /**
     * @notice Verifies a transaction
     * @param txHash The transaction hash to verify
     * @return bool True if the transaction is verified
     */
    function verifyTransaction(bytes32 txHash) external view override returns (bool) {
        return processedMessages[txHash] || processedTransfers[txHash];
    }

    /**
     * @notice Claims tokens that have been bridged
     * @param txHash The transaction hash of the bridge transfer
     */
    function claimToken(bytes32 txHash) external override {
        require(processedTransfers[txHash], "Transfer not processed");
        // Implementation will be added based on specific token claiming requirements
        revert("Not implemented");
    }
}
