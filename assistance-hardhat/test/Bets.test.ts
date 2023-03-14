import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect, assert } from "chai";
import { ethers } from "hardhat";

describe("Bets", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBetsFixture() {
    const NAME = "Bets";
    const SYMBOL = "BTS";
    const INITIAL_SUPPLY = 10000;

    // Contracts are deployed using the first signer/account by default
    const [owner, add1, add2] = await ethers.getSigners();

    const MockToken = await ethers.getContractFactory("MockToken"); 
    const mockToken = await MockToken.deploy(NAME, SYMBOL, INITIAL_SUPPLY); // Desplegar ficticiamente un contrato tipo MockToken

    const BetsContract = await ethers.getContractFactory("Bets"); 
    const betsContract = await BetsContract.deploy(mockToken.address); // Desplegar ficticiamente un contrato tipo Bets

    return { owner, add1, add2, mockToken, betsContract };
  }

  describe("Funcionalidad de apuestas", function() {
    it("Crear apuesta", async () => {
        const { betsContract } = await deployBetsFixture();

        await betsContract.createGame(1, 0, 0); // Llamamos al contrato para crear una apuesta

        expect(await betsContract.games(0)).to.exist; // Checkeamos que esta apuesta se haya creado
                        // (llamando a la funcion pub. games y comprobando que haya algo en la pos. 0)
                        
    })
    it("Apostar", async () => {
        const BET_AMOUNT = ethers.utils.parseEther("100");
        const { add1, mockToken, betsContract } = await deployBetsFixture();

        await betsContract.createGame(1, 0, 0); // Crear la apuesta 0
        await mockToken.connect(add1.address).approve(betsContract.address, BET_AMOUNT); // Que add1 dé allowance a Bets para gastar sus MockToken
        await betsContract.connect(add1.address).bet(0, 1, BET_AMOUNT); // Add1 apuesta al equipo "1" en la apuesta "0"
        expect(await betsContract.userBets(0, add1.address, 1)).to.be.equal(BET_AMOUNT); // Comprobar que haya dinero en el bote del equipo "1" de la apuesta "0"
        // expect(await mockToken.balanceOf(betsContract.address)).to.be.equal(BET_AMOUNT);
        // const tx = await betsContract.userBets(0, add1.address, 1);
        // expect(tx).to.be.equal(BET_AMOUNT);
        // expect(tx).to.emit(mockToken, "Transfer").withArgs(add1.address, betsContract.address, BET_AMOUNT);
    })
  })
});