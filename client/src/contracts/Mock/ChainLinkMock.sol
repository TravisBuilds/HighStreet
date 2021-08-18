
pragma solidity ^0.8.2;


contract ChainLinkMock {

    int256 answer;

    constructor(int256 _answer) public {
        answer = _answer;
    }

    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80) {
        //fake values
        uint80 roundId = 18446744073709557726;
        uint256 startedAt  = 1629291929;
        uint256 updatedAt = 1629291929;
        uint80 answeredInRound = 18446744073709557726;
        return (roundId, answer, startedAt, updatedAt, answeredInRound);
    }
}