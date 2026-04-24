// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MirrorPersona
 * @notice Each NFT represents a unique AI persona on MIRROR.XYZ (Base network)
 */
contract MirrorPersona is ERC721, ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    uint256 public mintPrice = 0.001 ether;

    struct PersonaData {
        string name;
        string[] traits;
        string behaviorMode;
        uint256 mintedAt;
    }

    mapping(uint256 => PersonaData) public personas;
    mapping(address => uint256) public walletToToken;

    event PersonaMinted(
        address indexed owner,
        uint256 indexed tokenId,
        string name,
        string[] traits,
        string behaviorMode
    );

    event MintPriceUpdated(uint256 newPrice);

    error AlreadyHasPersona();
    error InsufficientPayment();
    error PersonaNotFound();

    constructor() ERC721("MirrorPersona", "MIRROR") Ownable(msg.sender) {}

    // ─── External ────────────────────────────────────────────────────

    /**
     * @notice Mint a persona NFT representing the caller's AI alter ego
     * @param name     Display name of the persona
     * @param traits   Array of personality traits (2–3)
     * @param mode     Behavior mode: social | flirty | troll | observer
     * @param uri      IPFS/HTTPS URI for token metadata JSON
     */
    function mintPersona(
        string calldata name,
        string[] calldata traits,
        string calldata mode,
        string calldata uri
    ) external payable returns (uint256) {
        if (walletToToken[msg.sender] != 0) revert AlreadyHasPersona();
        if (msg.value < mintPrice) revert InsufficientPayment();

        uint256 tokenId = ++nextTokenId;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);

        personas[tokenId] = PersonaData({
            name: name,
            traits: traits,
            behaviorMode: mode,
            mintedAt: block.timestamp
        });

        walletToToken[msg.sender] = tokenId;

        emit PersonaMinted(msg.sender, tokenId, name, traits, mode);

        return tokenId;
    }

    // ─── Views ───────────────────────────────────────────────────────

    function getPersona(uint256 tokenId) external view returns (PersonaData memory) {
        if (!_exists(tokenId)) revert PersonaNotFound();
        return personas[tokenId];
    }

    function getPersonaByWallet(address wallet) external view returns (uint256 tokenId, PersonaData memory data) {
        tokenId = walletToToken[wallet];
        if (tokenId == 0) revert PersonaNotFound();
        data = personas[tokenId];
    }

    function totalSupply() external view returns (uint256) {
        return nextTokenId;
    }

    // ─── Owner ───────────────────────────────────────────────────────

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    function withdraw() external onlyOwner {
        (bool ok, ) = owner().call{value: address(this).balance}("");
        require(ok, "Transfer failed");
    }

    // ─── Internal helpers ────────────────────────────────────────────

    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId <= nextTokenId;
    }

    // ─── Required overrides ──────────────────────────────────────────

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
