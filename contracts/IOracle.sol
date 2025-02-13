// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOracle {
    function verifyTransaction(bytes32 txHash) external view returns (bool);
    function submitTransaction(bytes32 txHash) external;
}
