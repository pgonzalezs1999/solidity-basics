//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) { }

    function mintTo(address student) public { // Al asistir a una clase
        _mint(student, 10 * 10 ** decimals()); // El "**" significa elevado a
    }

    function mintExtraTo(address student) external { // Al asistir a 5 clases seguidas clase
        _mint(student, 50 * 10 ** decimals()); // El "**" significa elevado a
    }
}