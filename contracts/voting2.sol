// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

error ONLY_THE_OWNER_CAN_CALL_THIS_FUNCTION();
error YOU_HAVE_ALREADY_VOTED();
error INVALID_OPTION();
error AT_LEAST_ONE_OPTION_IS_REQUIRED();

contract VotingPoll {
    address owner;
    string public pollQuestion;
    string[] public options;

    mapping(address => bool) public hasVoted;
    mapping(string => uint256) public votesCount;

    event VoteCasted(address indexed voter, string indexed option);

    function onlyOwner() private view {
        require(msg.sender == owner, "Only the owner can call this function");
        if (msg.sender != owner) {
            revert ONLY_THE_OWNER_CAN_CALL_THIS_FUNCTION();
        }
    }

    function hasNotVoted() private view {
        if (hasVoted[msg.sender]) {
            revert YOU_HAVE_ALREADY_VOTED();
        }
    }

    constructor(string memory _pollQuestion, string[] memory _options) {
        if (_options.length < 1) {
            revert AT_LEAST_ONE_OPTION_IS_REQUIRED();
        }
        owner = msg.sender;
        pollQuestion = _pollQuestion;
        options = _options;
    }

    function vote(string memory _option) external {
        hasNotVoted();
        if (!validateOption(_option)) {
            revert INVALID_OPTION();
        }

        hasVoted[msg.sender] = true;
        votesCount[_option]++;
        emit VoteCasted(msg.sender, _option);
    }

    function getVotesCount(
        string memory _option
    ) external view returns (uint256) {
        if (!validateOption(_option)) {
            revert INVALID_OPTION();
        }
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
