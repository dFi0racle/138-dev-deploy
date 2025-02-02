// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IHealthCheck {
    event HealthStatusChanged(bool status);
    
    function checkHealth() external view returns (bool);
    function getLastUpdate() external view returns (uint256);
    function validateNetwork() external view returns (bool);
    function getVersion() external pure returns (string memory);
}
