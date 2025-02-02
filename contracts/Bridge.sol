// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IBridge.sol";
import "./interfaces/IOracle.sol";

contract Bridge is IBridge, Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    
    IOracle public immutable oracle;
    uint256 public required;
    uint256 public transferLimit;
    uint256 public fee;
    
    mapping(bytes32 => bool) public processedTransfers;
    mapping(address => bool) public supportedTokens;
    
    event FeeUpdated(uint256 newFee);
    event TransferLimitUpdated(uint256 newLimit);
    event TokenStatusUpdated(address token, bool supported);
    
    constructor(address _oracle, uint256 _required) {
        require(_oracle != address(0), "Invalid oracle address");
        require(_required > 0, "Required validators must be > 0");
        
        oracle = IOracle(_oracle);
        required = _required;
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(OPERATOR_ROLE, msg.sender);
    }
    
    function transfer(bytes32 to, uint256 amount) external override nonReentrant whenNotPaused {
        require(amount <= transferLimit, "Amount exceeds transfer limit");
        require(amount > fee, "Amount must be greater than fee");
        
        bytes32 transferId = keccak256(abi.encodePacked(msg.sender, to, amount, block.number));
        require(!processedTransfers[transferId], "Transfer already processed");
        
        processedTransfers[transferId] = true;
        emit Transfer(bytes32(uint256(uint160(msg.sender))), to, amount);
    }
    
    function validateTransfer(
        bytes32 from,
        bytes32 to,
        uint256 amount,
        bytes[] calldata signatures
    ) external override nonReentrant whenNotPaused onlyRole(OPERATOR_ROLE) {
        require(signatures.length >= required, "Insufficient signatures");
        
        bytes32 message = keccak256(abi.encodePacked(from, to, amount));
        address[] memory validators = new address[](signatures.length);
        
        for (uint i = 0; i < signatures.length; i++) {
            address validator = recoverSigner(message, signatures[i]);
            require(hasRole(VALIDATOR_ROLE, validator), "Invalid validator");
            
            for (uint j = 0; j < i; j++) {
                require(validator != validators[j], "Duplicate validator");
            }
            validators[i] = validator;
        }
    }
    
    function setFee(uint256 _fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        fee = _fee;
        emit FeeUpdated(_fee);
    }
    
    function setTransferLimit(uint256 _limit) external onlyRole(DEFAULT_ADMIN_ROLE) {
        transferLimit = _limit;
        emit TransferLimitUpdated(_limit);
    }
    
    function addSupportedToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
        emit TokenStatusUpdated(token, true);
    }
    
    function recoverSigner(bytes32 message, bytes memory signature) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        if (v < 27) v += 27;
        require(v == 27 || v == 28, "Invalid signature recovery");
        
        return ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", message)), v, r, s);
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
