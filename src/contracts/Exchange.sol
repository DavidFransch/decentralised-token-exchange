pragma solidity ^0.5.0;

contract Exchange{
//Varaiables
address public feeAccount;//the account that receives exchange
uint256 public feePercent;//the fee percentage

    constructor(address _feeAccount, uint _feePercent) public{
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
}

//TODO
//[] Set the fee account
//[] Deposit Ether
//[] Withdraw Ether
//[] Deposit Tokens
//[] Withdraw tokens
//[] Check balances
//[] Make order
//[] Cancel order
//[] Charge fees