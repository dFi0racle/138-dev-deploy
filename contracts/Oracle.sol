// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IOracle.sol";

contract Oracle is IOracle, AccessControl {
    bytes32 public constant AUTHORITY_ROLE = keccak256("AUTHORITY_ROLE");
    mapping(bytes32 => uint256) private prices;
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function updatePrice(bytes32 asset, uint256 price) external override onlyRole(AUTHORITY_ROLE) {
        prices[asset] = price;
        emit PriceUpdated(asset, price);
    }
    
    function getPrice(bytes32 asset) external view override returns (uint256) {
        require(prices[asset] > 0, "Oracle: Price not available");
        return prices[asset];
    }
    
    function addAuthority(address authority) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(AUTHORITY_ROLE, authority);
        emit AuthorityAdded(authority);
    }
    
    function removeAuthority(address authority) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(AUTHORITY_ROLE, authority);
        emit AuthorityRemoved(authority);
    }
    
    function authorities(address authority) external view override returns (bool) {
        return hasRole(AUTHORITY_ROLE, authority);
    }
    
    function admin() external view override returns (address) {
        return getRoleMember(DEFAULT_ADMIN_ROLE, 0);
    }
}
