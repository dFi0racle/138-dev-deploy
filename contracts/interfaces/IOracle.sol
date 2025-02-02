// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IOracle {
    event PriceUpdated(bytes32 indexed asset, uint256 price);
    event AuthorityAdded(address indexed authority);
    event AuthorityRemoved(address indexed authority);

    function updatePrice(bytes32 asset, uint256 price) external;
    function getPrice(bytes32 asset) external view returns (uint256);
    function addAuthority(address authority) external;
    function removeAuthority(address authority) external;
    function authorities(address authority) external view returns (bool);
    function admin() external view returns (address);
}
