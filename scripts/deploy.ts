import { ethers } from "hardhat";

async function main() {
  const votingPollFactory = await ethers.deployContract("votingPollFactory");

  await votingPollFactory.waitForDeployment();

  console.log(
    `voting-Poll-Factory Factory contract deployed to ${votingPollFactory.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
