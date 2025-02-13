// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IReporter.sol";
import "../security/AccessControl.sol";
import "../security/Pausable.sol";

/**
 * @title Reporter
 * @notice Implementation of the Reporter interface for market data integration
 * @dev Handles reporting to CoinGecko, CoinMarketCap, and GeckoTerminal
 */
contract Reporter is IReporter, AccessControl, Pausable {
    bytes32 public constant REPORTER_ROLE = keccak256("REPORTER_ROLE");
    
    // Mapping to store the latest reported data
    mapping(address => uint256) public latestPrices;
    mapping(address => uint256) public latestVolumes;
    mapping(address => uint256) public latestTVLs;
    mapping(address => uint256) public lastUpdateTimestamp;
    
    // Minimum time between updates
    uint256 public constant MIN_UPDATE_INTERVAL = 5 minutes;
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(REPORTER_ROLE, msg.sender);
    }
    
    modifier onlyReporter() {
        require(hasRole(REPORTER_ROLE, msg.sender), "Reporter: caller is not a reporter");
        _;
    }
    
    modifier validUpdate(address token, uint256 timestamp) {
        require(token != address(0), "Reporter: invalid token address");
        require(
            timestamp > lastUpdateTimestamp[token] + MIN_UPDATE_INTERVAL,
            "Reporter: update too frequent"
        );
        _;
    }
    
    function reportPrice(
        address token,
        uint256 price,
        uint256 timestamp
    ) external override onlyReporter validUpdate(token, timestamp) whenNotPaused {
        latestPrices[token] = price;
        lastUpdateTimestamp[token] = timestamp;
        emit PriceReported(token, price, timestamp);
    }
    
    function reportVolume(
        address token,
        uint256 volume,
        uint256 timestamp
    ) external override onlyReporter validUpdate(token, timestamp) whenNotPaused {
        latestVolumes[token] = volume;
        lastUpdateTimestamp[token] = timestamp;
        emit VolumeReported(token, volume, timestamp);
    }
    
    function reportTVL(
        address protocol,
        uint256 tvl,
        uint256 timestamp
    ) external override onlyReporter validUpdate(protocol, timestamp) whenNotPaused {
        latestTVLs[protocol] = tvl;
        lastUpdateTimestamp[protocol] = timestamp;
        emit TVLReported(protocol, tvl, timestamp);
    }
    
    function reportMetrics(
        address token,
        uint256 price,
        uint256 volume,
        uint256 tvl,
        uint256 timestamp
    ) external override onlyReporter validUpdate(token, timestamp) whenNotPaused {
        latestPrices[token] = price;
        latestVolumes[token] = volume;
        latestTVLs[token] = tvl;
        lastUpdateTimestamp[token] = timestamp;
        emit MetricsReported(token, price, volume, tvl, timestamp);
    }
    
    function reportHistoricalData(
        address token,
        uint256 startTime,
        uint256 endTime,
        uint256[] calldata prices,
        uint256[] calldata volumes,
        uint256[] calldata timestamps
    ) external override onlyReporter whenNotPaused {
        require(
            prices.length == volumes.length && volumes.length == timestamps.length,
            "Reporter: array lengths mismatch"
        );
        require(startTime < endTime, "Reporter: invalid time range");
        require(timestamps.length > 0, "Reporter: empty data");
        
        // Store only the latest data point
        if (timestamps[timestamps.length - 1] > lastUpdateTimestamp[token]) {
            latestPrices[token] = prices[prices.length - 1];
            latestVolumes[token] = volumes[volumes.length - 1];
            lastUpdateTimestamp[token] = timestamps[timestamps.length - 1];
        }
        
        emit HistoricalDataReported(token, startTime, endTime, timestamps.length);
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
