// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IMarketData
 * @notice Interface for market data reporting across chains
 */
interface IMarketData {
    struct MarketUpdate {
        address token;
        uint256 price;
        uint256 volume24h;
        uint256 tvl;
        uint256 timestamp;
        string source;
    }

    event MarketDataUpdated(
        address indexed token,
        uint256 price,
        uint256 volume24h,
        uint256 tvl,
        uint256 timestamp,
        string source
    );

    /**
     * @notice Reports market data for a token
     * @param update The market data update
     */
    function reportMarketData(MarketUpdate calldata update) external;

    /**
     * @notice Reports market data for multiple tokens
     * @param updates Array of market data updates
     */
    function batchReportMarketData(MarketUpdate[] calldata updates) external;

    /**
     * @notice Gets the latest market data for a token
     * @param token The token address
     * @return The latest market update
     */
    function getLatestMarketData(address token) external view returns (MarketUpdate memory);
}
