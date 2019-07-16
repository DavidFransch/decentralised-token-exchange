pragma solidity ^0.5.0;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/math/SafeMath.sol";

contract Token{
    using SafeMath for uint;

    //variables
    string public name = "DApp Token";
    string public symbol = "DAPP";
    uint256 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    //address1 =>deployer address2=>exchange uint256=> amount exchange can spend
    mapping(address => mapping(address=> uint256)) public allowance;

    //Events
    event Transfer(address indexed from, address to, uint256 value);

        constructor() public{
        totalSupply = 1000000 * (10**decimals);
        balanceOf[msg.sender] = totalSupply;//person who deployed contract
    }

    function transfer(address _to, uint256 _value) public returns (bool success){
        require(_to != address(0), "");
        require(balanceOf[msg.sender] >= _value, "");
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    //Approve tokens
    function approve(address _spender, uint256 _value) public returns (bool success){
       allowance[msg.sender][_spender]= _value;
       return true;
    }

    //Transfer from
    //function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)
}