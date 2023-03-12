// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
	// Name
	string public name;
	// Symbol
	string public symbol;
	// Decimals
	uint256 public decimals = 18;
	// Total Supply
	uint256 public totalSupply;

	constructor(string memory _name, string memory _symbol, uint256 _totalSupply){
		name = _name;
		symbol = _symbol;
		totalSupply = _totalSupply * (10**decimals);
	}
}
