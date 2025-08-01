// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChain {
    enum Stage {
        Created,
        InProduction,
        ReadyToShip,
        InTransit,
        Delivered,
        Completed
    }

    struct StageDetail {
        Stage stage;
        string location;
        string action;
        uint256 timestamp;
    }

    struct Product {
        uint256 productId;
        string description;
        address currentOwner;
        string location;
        Stage stage;
        Stage[] stageHistory;
        address[] ownerHistory;
        StageDetail[] stageDetails;
        bool isEthical;
        bool isCompliant;
        bool exists;
    }

    address public admin;
    mapping(uint256 => Product) private products;

    event ProductAdded(
        uint256 indexed productId,
        address indexed owner,
        string description,
        string location
    );

    event StageUpdated(
        uint256 indexed productId,
        Stage stage,
        string location,
        string action
    );

    event OwnershipTransferred(
        uint256 indexed productId,
        address indexed oldOwner,
        address indexed newOwner
    );

    event ComplianceMarked(
        uint256 indexed productId,
        bool ethical,
        bool compliant
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyOwner(uint256 productId) {
        require(products[productId].currentOwner == msg.sender, "Not owner");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addProduct(
        uint256 productId,
        string calldata description,
        string calldata location
    ) external onlyAdmin {
        require(!products[productId].exists, "Product exists");
        Product storage p = products[productId];
        p.productId = productId;
        p.description = description;
        p.currentOwner = msg.sender;
        p.location = location;
        p.stage = Stage.Created;
        p.isEthical = false;
        p.isCompliant = false;
        p.exists = true;
        p.stageHistory.push(Stage.Created);
        p.ownerHistory.push(msg.sender);
        p.stageDetails.push(
            StageDetail(
                Stage.Created,
                location,
                "Product Created",
                block.timestamp
            )
        );
        emit ProductAdded(productId, msg.sender, description, location);
    }

    function updateStage(
        uint256 productId,
        Stage newStage,
        string calldata location,
        string calldata action
    ) external onlyOwner(productId) {
        require(products[productId].exists, "Product missing");

        Product storage p = products[productId];
        p.stage = newStage;
        p.location = location; // keep current location in sync
        p.stageHistory.push(newStage);
        p.ownerHistory.push(msg.sender); // track who performed this update
        p.stageDetails.push(
            StageDetail(newStage, location, action, block.timestamp)
        );

        emit StageUpdated(productId, newStage, location, action);
    }

    function transferOwnership(
        uint256 productId,
        address newOwner
    ) external onlyOwner(productId) {
        require(products[productId].exists, "Product missing");
        address old = products[productId].currentOwner;
        products[productId].currentOwner = newOwner;
        products[productId].ownerHistory.push(newOwner);
        emit OwnershipTransferred(productId, old, newOwner);
    }

    function markCompliance(
        uint256 productId,
        bool ethical,
        bool compliant
    ) external onlyAdmin {
        require(products[productId].exists, "Product missing");
        products[productId].isEthical = ethical;
        products[productId].isCompliant = compliant;
        emit ComplianceMarked(productId, ethical, compliant);
    }

    function getProduct(
        uint256 productId
    )
        external
        view
        returns (
            uint256 id,
            string memory description,
            address owner,
            string memory location,
            Stage stage,
            bool ethical,
            bool compliant
        )
    {
        require(products[productId].exists, "Product missing");
        Product storage p = products[productId];
        return (
            p.productId,
            p.description,
            p.currentOwner,
            p.location,
            p.stage,
            p.isEthical,
            p.isCompliant
        );
    }

    function getHistory(
        uint256 productId
    )
        external
        view
        returns (StageDetail[] memory details, address[] memory owners)
    {
        require(products[productId].exists, "Product missing");
        return (
            products[productId].stageDetails,
            products[productId].ownerHistory
        );
    }
}
