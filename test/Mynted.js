const { expect } = require('chai')
const { ethers } = require('hardhat')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Mynted", function () {
  let deployer
  let creator
  let mynted

  const NAME = "Mynted"
  const SYMBOL = "MYNT"
  const FEE = tokens(1) // Equals 1 ETH
  const URL = "ipfs://Qm123456789"
  const DESCRIPTION = "This is my NFT"
  const IMAGE_URI = "ipfs://QmImageURI"
  const MEDIA_URI = "ipfs://QmMediaURI"

  // Deployment
  beforeEach(async () => {
    // Get accounts setup
    [deployer, creator] = await ethers.getSigners()

    const Mynted = await ethers.getContractFactory('Mynted')
    mynted = await Mynted.deploy(NAME, SYMBOL, FEE)
    await mynted.deployed()

    // Minting
    const transaction = await mynted.connect(creator).mintNFT(URL, DESCRIPTION, IMAGE_URI, MEDIA_URI, { value: FEE })
    await transaction.wait()
  })

  describe('Deployment', () => {
    it('Returns the owner', async () => {
      const result = await mynted.owner()
      expect(result).to.be.equal(deployer.address)
    })

    it('Returns the cost', async () => {
      const result = await mynted.fee()
      expect(result).to.be.equal(FEE)
    })
  })

  describe('Minting', () => {

    it('Mints an NFT with correct token URI', async () => {
      const tokenURI = await mynted.tokenURI(1); // Retrieve the token URI of the first minted NFT
      expect(tokenURI).to.be.equal(URL)
    })

    it('Mints an NFT with correct metadata', async () => {
      const metadata = await mynted.tokenURI(1); // Update function name
      expect(metadata).to.be.equal(URL)
    })

    it('Emits NFTMinted event with correct parameters', async () => {
      const transaction = await mynted.connect(creator).mintNFT(URL, DESCRIPTION, IMAGE_URI, MEDIA_URI, { value: FEE })

      await expect(transaction)
        .to.emit(mynted, 'NFTMinted')
        .withArgs(creator.address, 2, URL, DESCRIPTION, IMAGE_URI, MEDIA_URI) // Adjust the expected token ID according to the number of minted NFTs
    })
  })

  describe('Total Supply', () => {
    it('Returns the total number of minted NFTs', async () => {
      const result = await mynted.totalSupply();
      expect(result).to.equal(1);
    })
  })

  describe('Withdraw', () => {
    it('Allows the owner to withdraw fees', async () => {
      const initialBalance = await ethers.provider.getBalance(deployer.address);
      const transaction = await mynted.connect(deployer).withdraw();
      await transaction.wait();
      const finalBalance = await ethers.provider.getBalance(deployer.address);    

      expect(finalBalance.sub(initialBalance)).to.be.closeTo(FEE, tokens(0.1)); // Compare within a small range
    })

    it('Does not allow non-owners to withdraw fees', async () => {
      await expect(mynted.connect(creator).withdraw()).to.be.revertedWith("Ownable: caller is not the owner")
    })
  })
})

