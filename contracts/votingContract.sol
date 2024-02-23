// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingPoll {
    address public owner;
    string public pollQuestion;
    string[] public options;

    mapping(address => bool) public hasVoted;
    mapping(string => uint256) public votesCount;

    event VoteCasted(address indexed voter, string indexed option);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "You have already voted");
        _;
    }

    constructor(string memory _pollQuestion, string[] memory _options) {
        require(_options.length > 0, "At least one option is required");
        owner = msg.sender;
        pollQuestion = _pollQuestion;
        options = _options;
    }

    function vote(string memory _option) external hasNotVoted {
        require(validateOption(_option), "Invalid option");

        hasVoted[msg.sender] = true;
        votesCount[_option]++;

        emit VoteCasted(msg.sender, _option);
    }

    function getVotesCount(
        string memory _option
    ) external view returns (uint256) {
        require(validateOption(_option), "Invalid option");
        return votesCount[_option];
    }

    function validateOption(
        string memory _option
    ) internal view returns (bool) {
        for (uint256 i = 0; i < options.length; i++) {
            if (
                keccak256(abi.encodePacked(options[i])) ==
                keccak256(abi.encodePacked(_option))
            ) {
                return true;
            }
        }
        return false;
    }
}
