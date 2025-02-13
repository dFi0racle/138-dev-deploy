// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "../security/AccessControl.sol";
import "../interfaces/ICCIPRouter.sol";
import "../interfaces/ICCIPReceiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CCIPBridge
 * @notice Bridge contract for cross-chain token transfers and message passing using Chainlink CCIP
 * @dev Supports high-volume transfers across top 10 EVM chains with comprehensive reporting
 */
contract CCIPBridge is CCIPReceiver, AccessControl, ReentrancyGuard {
    using Client for Client.EVM2AnyMessage;

    // State variables
    ICCIPRouter public immutable router;
    mapping(uint64 => bool) public supportedChains;
    mapping(bytes32 => bool) public processedMessages;
    mapping(address => uint256) public nonces;
    uint256 public messageGasLimit;
    
    // Events
    event MessageSent(bytes32 indexed messageId, uint64 indexed destinationChainSelector, address sender);
    event MessageReceived(bytes32 indexed messageId, uint64 indexed sourceChainSelector, address sender);
    event TokensSent(bytes32 indexed messageId, uint64 indexed destinationChainSelector, address token, uint256 amount);
    event TokensReceived(bytes32 indexed messageId, uint64 indexed sourceChainSelector, address token, uint256 amount);
    event ChainAdded(uint64 indexed chainSelector);
    event ChainRemoved(uint64 indexed chainSelector);
    
    // Roles
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");
    
    // Errors
    error UnsupportedChain(uint64 chainSelector);
    error MessageAlreadyProcessed(bytes32 messageId);
    error InvalidMessageLength();
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
        
        router = ICCIPRouter(_router);
        messageGasLimit = 200000; // Default gas limit
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(OPERATOR_ROLE, msg.sender);
        _setupRole(FEE_MANAGER_ROLE, msg.sender);
        
        for (uint256 i = 0; i < _supportedChains.length; i++) {
            supportedChains[_supportedChains[i]] = true;
            emit ChainAdded(_supportedChains[i]);
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
        
        uint256 fee = router.getFee(destinationChainSelector, message);
        if (msg.value < fee) revert InsufficientFee();
        
        bytes32 messageId = router.sendMessage{value: msg.value}(
            destinationChainSelector,
            receiver,
            message
        );
        
        emit MessageSent(messageId, destinationChainSelector, msg.sender);
        return messageId;
    }
    
    /**
     * @notice Sends tokens to another chain
     * @param destinationChainSelector The identifier for the destination chain
     * @param receiver The address receiving the tokens
     * @param token The token contract address
     * @param amount The amount of tokens to transfer
     */
    function sendTokens(
        uint64 destinationChainSelector,
        address receiver,
        address token,
        uint256 amount
    ) external payable nonReentrant returns (bytes32) {
        if (!supportedChains[destinationChainSelector]) revert UnsupportedChain(destinationChainSelector);
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: token,
            amount: amount
        });
        
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver),
            data: "",
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: messageGasLimit})
            ),
            feeToken: address(0)
        });
        
        uint256 fee = router.getTokenTransferFee(destinationChainSelector, token, amount);
        if (msg.value < fee) revert InsufficientFee();
        
        bytes32 messageId = router.sendTokens{value: msg.value}(
            destinationChainSelector,
            receiver,
            token,
            amount
        );
        
        emit TokensSent(messageId, destinationChainSelector, token, amount);
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
        uint64 sourceChainSelector,
        bytes memory sender,
        bytes memory message,
        bytes32 messageId
    ) internal override {
        if (processedMessages[messageId]) revert MessageAlreadyProcessed(messageId);
        if (!supportedChains[sourceChainSelector]) revert UnsupportedChain(sourceChainSelector);
        
        processedMessages[messageId] = true;
        emit MessageReceived(messageId, sourceChainSelector, abi.decode(sender, (address)));
        
        // Process message - implementation specific to use case
    }
    
    // Admin functions
    
    /**
     * @notice Adds support for a new chain
     * @param chainSelector The chain selector to add
     */
    function addSupportedChain(uint64 chainSelector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedChains[chainSelector] = true;
        emit ChainAdded(chainSelector);
    }
    
    /**
     * @notice Removes support for a chain
     * @param chainSelector The chain selector to remove
     */
    function removeSupportedChain(uint64 chainSelector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedChains[chainSelector] = false;
        emit ChainRemoved(chainSelector);
    }
    
    /**
     * @notice Updates the gas limit for messages
     * @param newGasLimit The new gas limit to set
     */
    function setMessageGasLimit(uint256 newGasLimit) external onlyRole(FEE_MANAGER_ROLE) {
        messageGasLimit = newGasLimit;
    }
}
