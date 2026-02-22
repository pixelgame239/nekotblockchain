// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract DelayedReSaleAsset is ERC721, AccessControl {
    bytes32 public constant MARKETPLACE_ROLE = keccak256("MARKETPLACE_ROLE");
    uint256 private _nextTokenId;
    mapping(uint256 => uint256) private _lastSaleTime;

    constructor() ERC721("DelayedReSaleAsset", "DRSA") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createAsset() public returns (uint256) {
        uint256 tokenId = ++_nextTokenId;
        _safeMint(msg.sender, tokenId);
        // start the cooldown on mint so it cannot be listed immediately
        _lastSaleTime[tokenId] = block.timestamp;
        return tokenId;
    }

    // Allow marketplace to set the last sale timestamp AFTER a successful transfer
    function updateSaleTime(uint256 tokenId) external onlyRole(MARKETPLACE_ROLE) {
        _lastSaleTime[tokenId] = block.timestamp;
    }

    function getLastSaleTime(uint256 tokenId) public view returns (uint256) {
        return _lastSaleTime[tokenId];
    }

    function authorizeMarketplace(address marketplaceAddr) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MARKETPLACE_ROLE, marketplaceAddr);
    }

    // Keep ERC165 support merging ERC721 and AccessControl
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}