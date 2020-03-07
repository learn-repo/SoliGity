pragma solidity ^0.5.0;

contract Ethbay {
    string public storeName;
    uint256 public totalNumber = 0;

    struct Item {
        uint256 itemId;
        string itemName;
        uint256 itemPrice;
        address payable itemOwner;
        bool isItemSold;
    }

    mapping(uint256 => Item) public items;

    event ItemReady(
        uint256 itemId,
        string itemName,
        uint256 itemPrice,
        address payable itemOwner,
        bool isItemSold
    );

    event ItemSold(
        uint256 itemId,
        string itemName,
        uint256 itemPrice,
        address payable itemOwner,
        bool isItemSold
    );

    constructor() public {
        storeName = "EECE571 ETHBAY.COM";
    }

    function createItem(string memory _itemName, uint256 _itemPrice) public {
        require(bytes(_itemName).length > 0, "Item's name is required!");
        require(_itemPrice > 0, "Item's price is required!");
        totalNumber++;
        items[totalNumber] = Item(
            totalNumber,
            _itemName,
            _itemPrice,
            msg.sender,
            false
        );
        emit ItemReady(totalNumber, _itemName, _itemPrice, msg.sender, false);
    }

    function buyItem(uint256 _itemId) public payable {
        Item memory _item = items[_itemId];
        address payable _seller = _item.itemOwner;
        require(
            _item.itemId > 0 && _item.itemId <= totalNumber,
            "Item should be ready to sell!"
        );
        require(msg.value >= _item.itemPrice, "Payment should be enough!");
        require(!_item.isItemSold, "Item should not been sold yet!");
        require(msg.sender != _seller, "Cannot buy himself/herself");

        _item.itemOwner = msg.sender;
        _item.isItemSold = true;
        items[_itemId] = _item;
        _seller.transfer(msg.value);
        emit ItemSold(
            _item.itemId,
            _item.itemName,
            _item.itemPrice,
            msg.sender,
            true
        );
    }

}
