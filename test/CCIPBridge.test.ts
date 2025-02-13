import { expect } from "chai";
import { ethers } from "hardhat";
import { ChainConfigs } from "../config/chains";

describe("CCIPBridge", function () {
    let ccipBridge;
    let reporter;
    let owner;
    let user;
    let router;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();

        // Deploy mock router
        const MockRouter = await ethers.getContractFactory("MockCCIPRouter");
        router = await MockRouter.deploy();

        // Deploy Reporter
        const Reporter = await ethers.getContractFactory("Reporter");
        reporter = await Reporter.deploy();

        // Deploy CCIPBridge
        const CCIPBridge = await ethers.getContractFactory("CCIPBridge");
        const supportedChains = Object.values(ChainConfigs)
            .map(c => BigInt(c.selector));
        
        ccipBridge = await CCIPBridge.deploy(router.address, supportedChains);

        // Set up roles
        await reporter.grantRole(await reporter.REPORTER_ROLE(), ccipBridge.address);
    });

    describe("High Volume Support", function () {
        it("should handle large batches of transfers", async function () {
            const batchSize = 100;
            const amount = ethers.utils.parseEther("1.0");
            
            // Create mock token
            const Token = await ethers.getContractFactory("MockToken");
            const token = await Token.deploy();
            
            // Approve and transfer
            await token.approve(ccipBridge.address, amount.mul(batchSize));
            
            // Send multiple transfers
            for (let i = 0; i < batchSize; i++) {
                await ccipBridge.bridgeToken(
                    token.address,
                    amount,
                    ChainConfigs.POLYGON.id
                );
            }
            
            // Verify transfers processed
            const events = await ccipBridge.queryFilter(ccipBridge.filters.TokensSent());
            expect(events.length).to.equal(batchSize);
        });
    });

    describe("Multi-Chain Support", function () {
        it("should support all configured chains", async function () {
            for (const chain of Object.values(ChainConfigs)) {
                const isSupported = await ccipBridge.supportedChains(chain.selector);
                expect(isSupported).to.be.true;
            }
        });
    });

    describe("Market Data Reporting", function () {
        it("should report market data across chains", async function () {
            const marketData = {
                token: ethers.constants.AddressZero,
                price: ethers.utils.parseEther("1000"),
                volume24h: ethers.utils.parseEther("1000000"),
                tvl: ethers.utils.parseEther("10000000"),
                timestamp: Math.floor(Date.now() / 1000),
                source: "TestSource"
            };

            await ccipBridge.sendMessage(
                ChainConfigs.POLYGON.selector,
                reporter.address,
                ethers.utils.defaultAbiCoder.encode(
                    ["tuple(address,uint256,uint256,uint256,uint256,string)"],
                    [Object.values(marketData)]
                )
            );

            const events = await reporter.queryFilter(reporter.filters.MarketDataUpdated());
            expect(events.length).to.be.greaterThan(0);
        });
    });

    describe("Message Passing", function () {
        it("should support arbitrary message passing", async function () {
            const message = ethers.utils.defaultAbiCoder.encode(
                ["string", "uint256", "bytes"],
                ["TestMessage", 123, "0x1234"]
            );

            await ccipBridge.sendMessage(
                ChainConfigs.POLYGON.selector,
                reporter.address,
                message
            );

            const events = await ccipBridge.queryFilter(ccipBridge.filters.MessageSent());
            expect(events.length).to.equal(1);
            expect(events[0].args.message).to.equal(message);
        });
    });
});
