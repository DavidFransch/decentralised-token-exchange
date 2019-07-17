pragma solidity ^0.5.0;

import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Exchange{
using SafeMath for uint;

//Varaiables
address public feeAccount;//the account that receives exchange
uint256 public feePercent;//the fee percentage
address constant ETHER = address(0); //store Ether in tokens mapping with blank address
mapping(address => mapping(address=> uint256)) public tokens; //1=>token 2=>userAddress 3=>TokenNumber

//Events
event Deposit(address token, address user, uint256 amount, uint256 balance);

    constructor(address _feeAccount, uint _feePercent) public{
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //Fallback reverts if Ether is sent to this smart contract by mistake
    function() external{
        revert();
    }

    function depositEther() public payable {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function depositToken(address _token, uint _amount) public {
        require(_token != ETHER, "Dont allow Ether deposits");
        require(Token(_token).transferFrom(msg.sender, address(this), _amount), "");
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }
}

