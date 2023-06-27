const hre = require("hardhat");

async function main() {
  const NAME = "Mynted"
  const SYMBOL = "MYNT"
  const COST = ethers.utils.parseUnits("1", "ether")

  const Mynted = await hre.ethers.getContractFactory("Mynted")
  const mynted = await Mynted.deploy(NAME, SYMBOL, COST)
  await mynted.deployed()
  
  console.log(`Deployed MYNT Contract at: ${mynted.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
