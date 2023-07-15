# Mynted: A Simple NFT Minting Application

Mynted is a web application designed to mint Non-Fungible Tokens (NFTs). 

Built with Solidity for smart contracts, React for the frontend, and the OpenZeppelin libraries, it creates an ERC721 token with the help of the ERC721URIStorage contract and implements a custom "mint" function. 

The mint function creates new tokens and assigns them to the caller of the function (the address that initiated the transaction), as well as setting the tokenURI. 

Each token has a unique URI (the metadata of the token) which can link to information about the token, such as a JSON file stored on IPFS, a decentralized file storage system.

<h2>Code Structure</h2>

<h3>Smart Contract<h3>

The smart contract is designed using Solidity and OpenZeppelin libraries. 

It extends from ERC721URIStorage and Ownable.

ERC721URIStorage is a contract including all standard ERC721 functions along with functionality to associate URIs with tokens. 

Ownable is a contract which provides basic authorization control functions.

Mynted.sol: A custom contract named Mynted that extends from ERC721URIStorage to implement an NFT contract. 

<h3>Frontend</h3>
The frontend of the application is created with React.

App.js: The main entry point of the application, managing the routing and the wallet context of the application.

LandingPage.js: The home page of the application, allowing users to connect their wallet to the app.

MintForm.js: This page allows users to mint new NFTs. It provides an interface to input data (NFT name, description, image, and media) and mint an NFT.

<h2>How to Use</h2>

Connect your Ethereum wallet by clicking the "Connect Metamask" button on the Landing Page.

Once connected, it will automatically navigate to the Mint Form.

Fill in the required details for your NFT - Name, Description, Image (try to keep it under 1MB), and any other Media you may have.

Click on the "Upload Media" button to upload your image and media to IPFS via the nft.storage service.

Finally, click on the "Mint" button to mint your new NFT. Note that minting requires 1 ETH which is set in the smart contract.

<h2>Resources and Links</h2>

<a href="https://docs.soliditylang.org/en/v0.8.7/" target="_new">Solidity Docs</a>

<a href="https://docs.openzeppelin.com/contracts/4.x/" target="_new">OpenZeppelin Contracts Docs</a>

<a href="https://reactjs.org/docs/getting-started.html" target="_new">React Documentation</a>

<a href="https://nft.storage/docs/" target="_new">NFT Storage</a>

<a href="https://docs.ethers.io/v5/" target="_new">Ethers.js Documentation</a>

<h2>Prerequisites</h2>
Node.js

NPM

MetaMask 

<h2>Install and Run Locally</h2>


```shell
# Clone the repository
git clone https://github.com/keyannam/mynted

# Go into the repository
cd mynted

# Install dependencies
npm install

# Start the local development server
npm run start
```

NOTE: Don't forget to create your .env file and put all your required keys. 
