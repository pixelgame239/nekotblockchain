// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IDelayedAsset {
    function updateSaleTime(uint256 tokenId) external;
}

contract DigitalAssetMarketplace is ReentrancyGuard {
    uint256 private _itemIdCounter;

    struct MarketItem {
        uint256 itemId;
        uint256 tokenId;
        address payable seller;
        address nftContract;
        uint256 price;
        bool sold;
        bool cancelled;
    }

    mapping(uint256 => MarketItem) private _items;

    event MarketItemCreated(uint256 indexed itemId, address indexed seller, address nftContract, uint256 tokenId, uint256 price);
    event ItemSold(uint256 indexed itemId, address indexed buyer, address indexed seller, uint256 price);
    event MarketItemCancelled(uint256 indexed itemId, address indexed seller);
    event MarketItemPriceUpdated(uint256 indexed itemId, uint256 oldPrice, uint256 newPrice);

    function createMarketItem(address nftContract, uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Only owner can list");

        // Transfer NFT from seller to marketplace (must be approved)
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        _itemIdCounter++;
        uint256 newItemId = _itemIdCounter;

        _items[newItemId] = MarketItem({
            itemId: newItemId,
            tokenId: tokenId,
            seller: payable(msg.sender),
            nftContract: nftContract,
            price: price,
            sold: false,
            cancelled: false
        });

        emit MarketItemCreated(newItemId, msg.sender, nftContract, tokenId, price);
    }

    function buyMarketItem(uint256 itemId) external payable nonReentrant {
        MarketItem storage item = _items[itemId];
        require(item.itemId != 0, "Item does not exist");
        require(!item.sold, "Item already sold");
        require(!item.cancelled, "Item was cancelled");
        require(msg.value == item.price, "Incorrect price");
        require(msg.sender != item.seller, "Cannot buy own item");

        item.sold = true;

        // Payout seller
        (bool sent, ) = item.seller.call{value: msg.value}("");
        require(sent, "Failed to send Ether to seller");

        // Transfer NFT to buyer
        IERC721(item.nftContract).safeTransferFrom(address(this), msg.sender, item.tokenId);

        // If the NFT contract supports updateSaleTime, call it (best-effort)
        try IDelayedAsset(item.nftContract).updateSaleTime(item.tokenId) {
            // success: do nothing
        } catch {
            // ignore failures - optional functionality
        }

        emit ItemSold(itemId, msg.sender, item.seller, item.price);
    }

    function cancelMarketItem(uint256 itemId) external nonReentrant {
        MarketItem storage item = _items[itemId];
        require(item.itemId != 0, "Item does not exist");
        require(!item.sold, "Item already sold");
        require(!item.cancelled, "Item already cancelled");
        require(msg.sender == item.seller, "Only seller can cancel");

        item.cancelled = true;

        // Return NFT to seller
        IERC721(item.nftContract).safeTransferFrom(address(this), item.seller, item.tokenId);

        emit MarketItemCancelled(itemId, item.seller);
    }

    function updateMarketItemPrice(uint256 itemId, uint256 newPrice) external nonReentrant {
        MarketItem storage item = _items[itemId];
        require(item.itemId != 0, "Item does not exist");
        require(!item.sold, "Item already sold");
        require(!item.cancelled, "Item cancelled");
        require(msg.sender == item.seller, "Only seller can update price");
        require(newPrice > 0, "Price must be > 0");

        uint256 oldPrice = item.price;
        item.price = newPrice;

        emit MarketItemPriceUpdated(itemId, oldPrice, newPrice);
    }

    function getMarketItem(uint256 itemId) external view returns (MarketItem memory) {
        return _items[itemId];
    }
}