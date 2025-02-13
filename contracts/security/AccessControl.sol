// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

abstract contract AccessControl {
    struct RoleData {
        mapping(address => bool) members;
        bytes32 adminRole;
    }

    mapping(bytes32 => RoleData) private _roles;

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "AccessControl: account is missing role");
        _;
    }

    function hasRole(bytes32 role, address account) public view virtual returns (bool) {
        return _roles[role].members[account];
    }

    function _setupRole(bytes32 role, address account) internal virtual {
        _roles[role].adminRole = DEFAULT_ADMIN_ROLE;
        _grantRole(role, account);
    }

    function _grantRole(bytes32 role, address account) private {
        if (!hasRole(role, account)) {
            _roles[role].members[account] = true;
            emit RoleGranted(role, account, msg.sender);
        }
    }

    function grantRole(bytes32 role, address account) public virtual onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) public virtual onlyRole(getRoleAdmin(role)) {
        if (hasRole(role, account)) {
            _roles[role].members[account] = false;
            emit RoleRevoked(role, account, msg.sender);
        }
    }

    function getRoleAdmin(bytes32 role) public view virtual returns (bytes32) {
        return _roles[role].adminRole;
    }

    function getRoleMember(bytes32 role, uint256 index) public view virtual returns (address) {
        bytes32 roleHash = role;
        address[] memory members = new address[](1);
        uint256 count = 0;
        
        // Simple implementation that returns the first member
        for (uint160 i = 1; i < type(uint160).max && count < 1; i++) {
            address account = address(i);
            if (hasRole(roleHash, account)) {
                if (count == index) {
                    return account;
                }
                count++;
            }
        }
        
        revert("AccessControl: member not found");
    }
}
