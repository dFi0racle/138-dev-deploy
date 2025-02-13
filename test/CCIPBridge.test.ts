import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { AddressZero as ZeroAddress } from "@ethersproject/constants";
import { ChainConfigs } from "../config/chains";

import { ContractFactory as EthersContractFactory } from "ethers";

interface ContractFactory extends EthersContractFactory {
    deploy(...args: any[]): Promise<Contract>;
}

interface DeployedContract extends Contract {
    address: string;
    grantRole(role: string, account: string): Promise<any>;
    REPORTER_ROLE(): Promise<string>;
}

interface TestContext {
    ccipBridge: Contract;
    reporter: Contract;
    owner: any;
    user: any;
    router: Contract;
}

describe("CCIPBridge", function () {
    let context: TestContext;

    beforeEach(async function () {
        const [owner, user] = await ethers.getSigners();

        // Deploy mock router
        const MockRouter = await ethers.getContractFactory("MockCCIPRouter") as ContractFactory;
        const router = await MockRouter.deploy();

        // Deploy Reporter
        const Reporter = await ethers.getContractFactory("Reporter") as ContractFactory;
        const reporter = await Reporter.deploy();

        // Deploy CCIPBridge
        const CCIPBridge = await ethers.getContractFactory("CCIPBridge") as ContractFactory;
        const supportedChains = Object.values(ChainConfigs)
            .map(c => BigInt(c.selector));
        
        const ccipBridge = await CCIPBridge.deploy(router.address, supportedChains);

        context = { ccipBridge, reporter, owner, user, router };

        // Set up roles
        await reporter.grantRole(await reporter.REPORTER_ROLE(), ccipBridge.address);
    });

    describe("High Volume Support", function () {
        it("should handle large batches of transfers", async function () {
            const batchSize = 100;
            const amount = parseEther("1.0");
            
            // Create mock token
            const Token = await ethers.getContractFactory("MockToken");
            const token = await Token.deploy();
            
            // Approve and transfer
            await token.approve(context.ccipBridge.address, amount);
            
            // Send multiple transfers
            for (let i = 0; i < batchSize; i++) {
                await context.ccipBridge.bridgeToken(
                    token.address,
                    amount,
                    ChainConfigs.POLYGON.id
                );
            }
            
            // Verify transfers processed
            const events = await context.ccipBridge.queryFilter(context.ccipBridge.filters.TokensSent());
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
                token: ZeroAddress,
                price: parseEther("1000"),
                volume24h: parseEther("1000000"),
                tvl: parseEther("10000000"),
                timestamp: Math.floor(Date.now() / 1000),
                source: "TestSource"
            };

            await context.ccipBridge.sendMessage(
                ChainConfigs.POLYGON.selector,
                context.reporter.address,
                ethers.AbiCoder.defaultAbiCoder().encode(
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
            const message = ethers.AbiCoder.defaultAbiCoder().encode(
                ["string", "uint256", "bytes"],
                ["TestMessage", 123, "0x1234"]
            );

            await context.ccipBridge.sendMessage(
                ChainConfigs.POLYGON.selector,
                context.reporter.address,
                message
            );

            const events = await context.ccipBridge.queryFilter(context.ccipBridge.filters.MessageSent());
            expect(events.length).to.equal(1);
            const args = (events[0] as any).args;
            expect(args.message).to.equal(message);
        });
    });
});
