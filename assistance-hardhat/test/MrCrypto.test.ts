import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect, assert } from "chai";
import { ethers } from "hardhat";

describe("NFT CONTRACT", function () {

  const INITIAL_SUPPLY = 10000;
  let MrCrypto: any;
  let mrCrypto: any;
  let owner: any;
  let user1: any;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();

    MrCrypto = await ethers.getContractFactory("MrCrypto");
    mrCrypto = await MrCrypto.connect(owner).deploy("Mr. Crypto", "MRC");
});

  // testear que se crea una apuesta correctamente 
  describe("Funcionalidad de minteo", function() {
    it("Mintear un nft en fase whitelist", async() => {
      const MINTED_AMOUNT = 5;
      await mrCrypto.connect(owner).addToWhitelist(user1.address);
      await mrCrypto.connect(user1).mint(MINTED_AMOUNT, {value: ethers.utils.parseEther(MINTED_AMOUNT.toString())});
      expect(await mrCrypto.totalSupply()).to.be.equal(MINTED_AMOUNT);
    });

    it("Mintear un nft en fase normal", async() => {
      const MINTED_AMOUNT = 5;
      await mrCrypto.connect(owner).turnOffWhitelist();
      await mrCrypto.connect(user1).mint(MINTED_AMOUNT, {value: ethers.utils.parseEther(MINTED_AMOUNT.toString())});
      expect(await mrCrypto.totalSupply()).to.be.equal(MINTED_AMOUNT);
    });

    it("Checkear que el uri se retorna correctamente", async () => {
      const MINTED_AMOUNT = 5;
      const ID_CHECKED = 1;
      await mrCrypto.connect(owner).addToWhitelist(user1.address);
      await mrCrypto.connect(user1).mint(MINTED_AMOUNT, {value: ethers.utils.parseEther(MINTED_AMOUNT.toString())});
      await mrCrypto.connect(owner).reveal();
      let tokenURI: string = await mrCrypto.connect(owner).tokenURI(ID_CHECKED);
      assert(tokenURI == await mrCrypto.connect(owner).tokenURI(ID_CHECKED));
    });
  });
});