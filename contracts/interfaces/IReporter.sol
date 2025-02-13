// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IReporter
 * @notice Interface for reporting market data to external services
 * @dev Used for CoinGecko, CoinMarketCap, and GeckoTerminal integration
 */
interface IReporter {
    /**
     * @notice Reports price data for a token
     * @param token The token address
     * @param price The current price in USD (18 decimals)
     * @param timestamp The timestamp of the price data
     */
    function reportPrice(
        address token,
        uint256 price,
        uint256 timestamp
    ) external;

    /**
     * @notice Reports trading volume data
     * @param token The token address
     * @param volume The 24h trading volume in USD (18 decimals)
     * @param timestamp The timestamp of the volume data
     */
    function reportVolume(
        address token,
        uint256 volume,
        uint256 timestamp
    ) external;

    /**
     * @notice Reports Total Value Locked (TVL) data
     * @param protocol The protocol address
     * @param tvl The current TVL in USD (18 decimals)
     * @param timestamp The timestamp of the TVL data
     */
    function reportTVL(
        address protocol,
        uint256 tvl,
        uint256 timestamp
    ) external;

    /**
     * @notice Reports multiple metrics in a single transaction
     * @param token The token address
     * @param price The current price in USD (18 decimals)
     * @param volume The 24h trading volume in USD (18 decimals)
     * @param tvl The current TVL in USD (18 decimals)
     * @param timestamp The timestamp of the data
     */
    function reportMetrics(
        address token,
        uint256 price,
        uint256 volume,
        uint256 tvl,
        uint256 timestamp
    ) external;

    /**
     * @notice Reports historical data for a specific time range
     * @param token The token address
     * @param startTime The start timestamp
     * @param endTime The end timestamp
     * @param prices Array of prices (18 decimals)
     * @param volumes Array of volumes (18 decimals)
     * @param timestamps Array of timestamps
     */
    function reportHistoricalData(
        address token,
        uint256 startTime,
        uint256 endTime,
        uint256[] calldata prices,
        uint256[] calldata volumes,
        uint256[] calldata timestamps
    ) external;

    // Events
    event PriceReported(address indexed token, uint256 price, uint256 timestamp);
    event VolumeReported(address indexed token, uint256 volume, uint256 timestamp);
    event TVLReported(address indexed protocol, uint256 tvl, uint256 timestamp);
    event MetricsReported(
        address indexed token,
        uint256 price,
        uint256 volume,
        uint256 tvl,
        uint256 timestamp
    );
    event HistoricalDataReported(
        address indexed token,
        uint256 startTime,
        uint256 endTime,
        uint256 dataPoints
    );
}
