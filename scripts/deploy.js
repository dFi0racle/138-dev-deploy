const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Tether = await ethers.getContractFactory("Tether");
  const tether = await Tether.deploy(1000000);

  console.log("Tether contract deployed to:", tether.address);

  // Wait for deployment confirmations
  await tether.deployed();
  await tether.deployTransaction.wait(6);

  // Verify contract
  if (network.name !== "hardhat") {
    await hre.run("verify:verify", {
      address: tether.address,
      constructorArguments: [1000000],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
