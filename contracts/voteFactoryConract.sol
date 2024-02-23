// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./votingContract.sol";

contract VotingPollFactory {
    address[] public deployedPolls;

    event PollDeployed(address indexed pollAddress, address indexed owner);

    function createVotingPoll(
        string memory _pollQuestion,
        string[] memory _options
    ) external {
        VotingPoll newPoll = new VotingPoll(_pollQuestion, _options);
        deployedPolls.push(address(newPoll));

        emit PollDeployed(address(newPoll), msg.sender);
    }

    function getDeployedPolls() external view returns (address[] memory) {
        return deployedPolls;
    }
}
