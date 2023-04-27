//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CoinFlipHack {
    uint256 lastHash;
    uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

    function flip() public returns (bool) {
        uint256 blockValue = uint256(blockhash(block.number-1));
        if(lastHash == blockValue) {
            revert();
        }
        lastHash = blockValue;
        uint256 coinFlip = blockValue / FACTOR;
        bool side = (coinFlip == 1);

        return side;
    }
}

// Logica del hack (pendiente de probar):
    // Ejecutar este flip (casi copy-paste del de Ethernaut) y
    // llamar al original de Ethernaut con el valor que devuelva esta
    // así aseguro que sea el valor correcto, y poder acertar las 10 veces seguidas