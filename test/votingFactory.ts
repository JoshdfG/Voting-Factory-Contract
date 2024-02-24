import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Voting-poll-factory", function () {
  async function deployVotingPollFactoryFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const VotingPollFactory = await ethers.getContractFactory(
      "VotingPollFactory"
    );
    const votingPollFactory = await VotingPollFactory.deploy();

    const VotingPoll = await ethers.getContractFactory("VotingPoll");
    const votingPoll = await VotingPoll.deploy("Presidential Poll", [
      "Donald Trump",
      "John Franklin",
    ]);

    return { votingPollFactory, votingPoll, owner, otherAccount };
  }

  describe("Events", function () {
    it("Should deploy a new instance of Voting contract", async function () {
      const { votingPollFactory, owner } = await loadFixture(
        deployVotingPollFactoryFixture
      );

      const approveTx = await votingPollFactory.createVotingPoll("President", [
        "Obi",
      ]);
      await approveTx.wait();

      // Retrieve the deployed poll address
      const pollAddress = await votingPollFactory.getDeployedPolls();
      const deployedPolls = await votingPollFactory.getDeployedPolls();

      // Ensure the PollDeployed event is emitted with the correct arguments
      await expect(approveTx)
        .to.emit(votingPollFactory, "PollDeployed")
        .withArgs(deployedPolls[deployedPolls.length - 1], owner);
    });
  });

  describe("VotingPollFactory", function () {
    it("Should return the deployed polls", async function () {
      // Assuming deployVotingPollFactoryFixture returns a valid fixture
      const { votingPollFactory, owner } = await loadFixture(
        deployVotingPollFactoryFixture
      );

      const approveTx = await votingPollFactory.createVotingPoll("President", [
        "Obi",
      ]);
      await approveTx.wait();

      // Retrieve the deployed polls
      const deployedPolls = await votingPollFactory.getDeployedPolls();

      // Ensure the array contains at least one address
      expect(deployedPolls).to.have.length.at.least(1);
    });
  });

  describe("VotingPoll", function () {
    it("Should allow a user to cast a valid vote", async function () {
      const { votingPoll, owner, otherAccount } =
        await deployVotingPollFactoryFixture();

      const votingPollWithOtherAccount = votingPoll.connect(otherAccount);

      // Cast a valid vote
      const optionToVote = "Donald Trump";
      await votingPollWithOtherAccount.vote(optionToVote);

      // Check that the user is marked as having voted
      const hasVoted = await votingPoll.hasVoted(otherAccount.address);
      expect(hasVoted).to.equal(true);

      // Check that the vote count for the chosen option has increased by 1
      const votesForOption = await votingPoll.votesCount(optionToVote);
      expect(votesForOption).to.equal(1);

      // Check that the VoteCasted event is emitted with the correct arguments
      const voteEvent = await votingPoll.filters.VoteCasted(
        otherAccount.address,
        optionToVote
      );
      const voteEventLogs = await votingPoll.queryFilter(voteEvent);
      expect(voteEventLogs.length).to.equal(1);

      // Add more assertions based on your contract's logic
    });

    it("Should revert when a user tries to vote multiple times", async function () {
      const { votingPoll, otherAccount } =
        await deployVotingPollFactoryFixture();

      // Connect otherAccount to the VotingPoll contract
      const votingPollWithOtherAccount = votingPoll.connect(otherAccount);

      // Cast a valid vote
      const optionToVote = "John Franklin";
      await votingPollWithOtherAccount.vote(optionToVote);

      // Attempt to vote again (should revert)
      await expect(
        votingPollWithOtherAccount.vote(optionToVote)
      ).to.be.revertedWithCustomError(votingPoll, "YOU_HAVE_ALREADY_VOTED");

      // Add more assertions based on your contract's logic
    });

    it("Should revert when a user tries to vote with an invalid option", async function () {
      const { votingPoll, otherAccount } =
        await deployVotingPollFactoryFixture();

      // Connect otherAccount to the VotingPoll contract
      const votingPollWithOtherAccount = votingPoll.connect(otherAccount);

      const invalidOption = "InvalidOption";
      await expect(
        votingPollWithOtherAccount.vote(invalidOption)
      ).to.be.revertedWithCustomError(votingPoll, "INVALID_OPTION");
    });
  });

  describe("getVotesCount", async () => {
    it("Should revert when a user tries to vote with an invalid option", async function () {
      const { votingPoll, otherAccount } =
        await deployVotingPollFactoryFixture();

      // Connect otherAccount to the VotingPoll contract
      const votingPollWithOtherAccount = votingPoll.connect(otherAccount);

      const invalidOption = "InvalidOption";
      await expect(
        votingPollWithOtherAccount.vote(invalidOption)
      ).to.be.revertedWithCustomError(votingPoll, "INVALID_OPTION");
    });

    it("Should return the number of votes for a given option", async function () {
      const { votingPoll } = await deployVotingPollFactoryFixture();

      // Cast a valid vote
      const optionToVote = "Donald Trump";
      await votingPoll.vote(optionToVote);

      // Check that the vote count for the chosen option has increased by 1
      const votesForOption = await votingPoll.votesCount(optionToVote);
      expect(votesForOption).to.equal(1);
    });
  });

  describe("VotingPoll", function () {
    it("Should validate a valid option", async function () {
      const { votingPoll } = await deployVotingPollFactoryFixture();

      // Call validateOption with a valid option
      const isValidOption = await votingPoll.validateOption("Donald Trump");

      // Expect the result to be true
      expect(isValidOption).to.equal(true);
    });

    it("Should not validate an invalid option", async function () {
      const { votingPoll } = await deployVotingPollFactoryFixture();

      // Call validateOption with an invalid option
      const isValidOption = await votingPoll.validateOption("InvalidOption");

      // Expect the result to be false
      expect(isValidOption).to.equal(false);
    });

    // Add more test cases based on your contract's logic and requirements
  });

  // it("Should set the right owner", async function () {
  //   const { lock, owner } = await loadFixture(deployOneYearLockFixture);

  //   expect(await lock.owner()).to.equal(owner.address);
  // });

  // it("Should receive and store the funds to lock", async function () {
  //   const { lock, lockedAmount } = await loadFixture(
  //     deployOneYearLockFixture
  //   );

  //   expect(await ethers.provider.getBalance(lock.target)).to.equal(
  //     lockedAmount
  //   );
  // });

  //   it("Should fail if the unlockTime is not in the future", async function () {
  //     // We don't use the fixture here because we want a different deployment
  //     const latestTime = await time.latest();
  //     const Lock = await ethers.getContractFactory("Lock");
  //     await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
  //       "Unlock time should be in the future"
  //     );
  //   });
  // });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
  //   });
  // });
  //   });
  // });
});
