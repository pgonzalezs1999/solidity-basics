//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // ERC721
import "@openzeppelin/contracts/access/Ownable.sol"; // Ownable
import "@openzeppelin/contracts/utils/Strings.sol"; // Strings

contract MrPablo is ERC721, Ownable {
    using Strings for uint256;
    mapping(address => bool) public isAdmin; // user => is_admin
    mapping(address => bool) public isWhitelisted; // user => is_whitelisted
    string baseURI;
	string URIExtension = ".json";
    uint256 MAX_SUPPLY = 1000;
    uint256 MINT_PRICE = 0.1 ether;
    bool isPaused = false;
    uint256 public supply;

    modifier onlyAdmin {
		require(isAdmin[msg.sender] == true || msg.sender == owner(), "Not an admin");
		_;
	}

    modifier onlyWhitelisted() {
        require(isWhitelisted[msg.sender] == true || msg.sender == owner(), "Not whitelisted");
        _;
    }

    modifier notPaused() {
        require(isPaused == false, "Contract paused");
        _;
    }
    
    constructor(string memory newBaseURI) ERC721("Mr. Pablo", "MRP") {
        baseURI = newBaseURI;
    }

    function addAdmin(address user) public onlyOwner {
        require(user != owner() && user != address(0), "Invalid address");
        require(isAdmin[user] == false, "Already an admin");
		isAdmin[user] = true;
	}

    function removeAdmin(address user) public onlyOwner {
        require(user != owner() && user != address(0), "Invalid address");
        require(isAdmin[user] == true, "Not an admin");
		isAdmin[user] = false;
	}

    function addToWhitelist(address user) external onlyAdmin {
        require(user != address(0), "Invalid address");
        require(isWhitelisted[user] != true, "Already whitelisted");
        isWhitelisted[user] = true;
    }

    function removeFromWhitelist(address user) external onlyAdmin {
        require(user != owner() && user != address(0), "Invalid address");
        require(isWhitelisted[user] == true, "Not whitelisted");
        isWhitelisted[user] = false;
    }

    function mint(uint256 amount) external payable onlyWhitelisted notPaused {
        require(supply + amount <= MAX_SUPPLY, "No tokens left");
        require(msg.value >= MINT_PRICE * amount, "Not enough funds");
        require(amount <= 5, "Max 5 tokens per transaction");
        _togglePause();
        supply += amount;
        for (uint256 i = 1; i <= amount; ++i) {
			_mint(msg.sender, supply + i);
		}
        _togglePause();
    }

    function withdraw() public payable onlyAdmin notPaused {
        // _tooglePause();
        (bool success,) = owner().call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
        // _tooglePause();
    }

    function getContractFunds() external view returns(uint256) {
        return address(this).balance;
    }

    function changeBaseURI(string memory newBaseURI) public onlyAdmin {
        baseURI = newBaseURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
		require(_exists(tokenId), "Nonexistent token");
		return (bytes(baseURI).length > 0)
			? string(abi.encodePacked(baseURI, tokenId.toString(), URIExtension))
			: "";
	}

    function togglePause() public onlyAdmin {
        isPaused = !isPaused;
    }

    function _togglePause() internal {
        isPaused = !isPaused;
    }

    receive() external payable { }
}