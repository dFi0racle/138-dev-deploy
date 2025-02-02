// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IBridge {
    event Transfer(bytes32 indexed from, bytes32 indexed to, uint256 amount);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);

    function transfer(bytes32 to, uint256 amount) external;
    function validateTransfer(bytes32 from, bytes32 to, uint256 amount, bytes[] calldata signatures) external;
    function addValidator(address validator) external;
    function removeValidator(address validator) external;
}
