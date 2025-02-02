// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IOracle.sol";

contract Oracle is IOracle {
    mapping(bytes32 => uint256) private prices;
    mapping(address => bool) public authorities;
    address public admin;

    constructor() {
        admin = msg.sender;
        authorities[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyAuthority() {
        require(authorities[msg.sender], "Not authorized");
        _;
    }

    function updatePrice(bytes32 asset, uint256 price) external onlyAuthority {
        prices[asset] = price;
        emit PriceUpdated(asset, price);
    }

    function getPrice(bytes32 asset) external view returns (uint256) {
        return prices[asset];
    }

    function addAuthority(address authority) external onlyAdmin {
        authorities[authority] = true;
    }

    function removeAuthority(address authority) external onlyAdmin {
        authorities[authority] = false;
    }
}
