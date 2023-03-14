import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect, assert } from "chai";
import { ethers } from "hardhat";


describe("ASSISTANCE CONTRACT", function () {
    const NAME = "Disrup3";
    const SYMBOL = "D3";
    const INITIAL_SUPPLY = 1;

  async function deployBetsFixture() { // Funcion para declarar toda la info que necesitaremos
    const [owner, student1, student2] = await ethers.getSigners(); // Definir usuarios para las pruebas

    const MockToken = await ethers.getContractFactory("MockToken");
    const mocktoken = await MockToken.deploy(NAME, SYMBOL, INITIAL_SUPPLY); // Crear una instancia del contrato MockToken

    const AssistanceContract = await ethers.getContractFactory("Assistance");
    const assistanceContract = await AssistanceContract.deploy(mocktoken.address); // Crear una instancia del contrato Assistance

    return { owner, student1, student2, mocktoken, assistanceContract }; // Parámetros que podremos utilizar al llamar esta funcion
  }

  describe("Setear el entorno", function() { // Cada "grupo" de pruebas va en una funcion describe()
    it("Crear una clase", async () => { // Cada prueba va en una funcion it()
        const { owner, assistanceContract } = await deployBetsFixture()

        await assistanceContract.connect(owner).addLesson();
        
        expect(await assistanceContract.getNumberOfLessons()).to.be.greaterThan(0);
    });
    it("Añadir student", async () => {
        const { owner, student1, assistanceContract } = await deployBetsFixture() // Re-setear todo: cada it() es independiente del anterior
        
        await assistanceContract.connect(owner).addLesson();
        await assistanceContract.connect(owner).addStudent(student1.address);
        
        expect(await assistanceContract.students(student1.address)).to.be.true;
    });
    it("Eliminar student", async () => {
        const { owner, student1, assistanceContract } = await deployBetsFixture()
        
        await assistanceContract.connect(owner).addLesson();
        await assistanceContract.connect(owner).addStudent(student1.address);
        
        expect(await assistanceContract.students(student1.address)).to.be.true;
    });
    it("Fichar clase sin ser student", async () => {
        const { owner, student2, assistanceContract } = await deployBetsFixture()
    
        await assistanceContract.connect(owner).addLesson();
    
        await expect(assistanceContract.connect(student2).attend("Disrup3")).to.be.reverted; // Cuando se busca revert, el await va al principio
    });
    it("Fichar clase siendo student", async () => {
        const { owner, student1, assistanceContract } = await deployBetsFixture()
        
        await assistanceContract.connect(owner).addLesson();
        await assistanceContract.connect(owner).addStudent(student1.address);
        await assistanceContract.connect(student1).attend("Disrup3");
        
        const lesson0 = await assistanceContract.lessons(0);
        expect(await lesson0.attenders).to.be.greaterThan(0);
    });
    /* it("apostar", async () => {
        const { mocktoken, assistanceContract, add1, owner } = await deployBetsFixture();
    
        const BET_AMOUNT = ethers.utils.parseEther("100")
    
        await assistanceContract.createGame(1, 0 , 0);
        await mocktoken.approve(assistanceContract.address, BET_AMOUNT);
    
        await assistanceContract.bet(0, 1, BET_AMOUNT);
        
        const tx = await assistanceContract.userBets(0, owner.address, 0);
    
        expect(tx).to.be.equal(BET_AMOUNT); 
        expect(tx).to
        .emit(mocktoken, "Transfer")
        .withArgs(owner.address, assistanceContract.address, BET_AMOUNT);
    
        await mocktoken.connect(add1).mint();
        await mocktoken.connect(add1).approve(assistanceContract.address, BET_AMOUNT);
        await assistanceContract.connect(add1).bet(0, 2, BET_AMOUNT);
    
        await expect(assistanceContract.setWinner(0, 2)).to.be.revertedWith("game hasn't finished");
    
        const latestTime = await time.latest();
        await time.increase(latestTime + 60 * 60 * 2);
    
        await assistanceContract.setWinner(0, 1);
        await assistanceContract.claimReward(0);
    
        console.log(await mocktoken.balanceOf(owner.address));
        
        expect(await mocktoken.balanceOf(owner.address)).to.be.greaterThan(INITIAL_SUPPLY);
    }) */
})

describe("Ejemplo de otro grupo de pruebas", function() {
    it("Prueba de ejemplo", async () => {
        expect(1).to.be.greaterThan(0);
    });
  })
});