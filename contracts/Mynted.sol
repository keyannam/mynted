// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // Import the Ownable contract

contract Mynted is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public fee;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _fee
    ) ERC721(_name, _symbol) {
        fee = _fee;
    }

    event NFTMinted(
        address indexed creator,
        uint256 indexed tokenId,
        string tokenURI,
        string description,
        string imageURI,
        string mediaURI
    );

    function mintNFT(
        string memory tokenURI,
        string memory description,
        string memory imageURI,
        string memory mediaURI
    ) public payable {
        require(msg.value >= fee, "Insufficient payment");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        emit NFTMinted(msg.sender, newTokenId, tokenURI, description, imageURI, mediaURI);
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

	function tokenIds() public view returns (uint256) {
	  	return _tokenIds.current();
	}

    function withdraw() public onlyOwner { // Add onlyOwner modifier here
        require(address(this).balance > 0, "Contract balance is zero");
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
