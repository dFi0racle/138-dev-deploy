// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBridge {
    function bridgeToken(address token, uint256 amount, uint256 targetChainId) external;
    function claimToken(bytes32 txHash) external;
    function verifyTransaction(bytes32 txHash) external view returns (bool);
}
