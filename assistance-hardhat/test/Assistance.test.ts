import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect, assert } from "chai";
import { ethers } from "hardhat";

describe("ASSISTANCE CONTRACT", function () {
    const NAME = "Disrup3";
    const SYMBOL = "D3";

    async function deployAssistanceFixture() {
        const [owner, student1, student2] = await ethers.getSigners(); // Definir usuarios para las pruebas
        
        const MockToken = await ethers.getContractFactory("MockToken");
        const mockToken = await MockToken.deploy(NAME, SYMBOL/*, INITIAL_SUPPLY*/); // Crear una instancia del contrato MockToken
        
        const AssistanceContract = await ethers.getContractFactory("Assistance");
        const assistanceContract = await AssistanceContract.deploy(mockToken.address); // Crear una instancia del contrato Assistance
        
        const encodedPass = ethers.utils.solidityKeccak256(["string"], ["Disrup3"]);

        const decimals = await mockToken.decimals();
        
        return { owner, student1, student2, mockToken, assistanceContract, decimals, encodedPass };
    }
    
    describe("Assistance contract", function() { // Cada "grupo" de pruebas va en una funcion describe()
        it("Añadir admin", async () => { // Cada prueba va en una funcion it()
            const { owner, student1, assistanceContract } = await deployAssistanceFixture();
            
            await assistanceContract.connect(owner).addAdmin(student1.address);
            
            expect(await assistanceContract.admins(student1.address)).to.be.true;
        });
        it("Eliminar admin", async () => {
            const { owner, student1, assistanceContract } = await deployAssistanceFixture();
            
            await assistanceContract.connect(owner).addAdmin(student1.address);
            await assistanceContract.connect(owner).removeAdmin(student1.address);
            
            expect(await assistanceContract.admins(student1.address)).to.be.false;
        });
        it("Crear una clase", async () => {
            const { owner, assistanceContract, encodedPass } = await deployAssistanceFixture();
            
            await assistanceContract.connect(owner).addLesson(encodedPass);
            const numberOfLessons = await assistanceContract.connect(owner).getNumberOfLessons();
            expect(await numberOfLessons).to.be.equal(1);
        });
        it("Añadir student", async () => {
            const { owner, student1, assistanceContract } = await deployAssistanceFixture();

            await assistanceContract.connect(owner).addStudent(student1.address);
            
            expect(await assistanceContract.students(student1.address)).to.be.true;
        });
        it("Eliminar student", async () => {
            const { owner, student1, assistanceContract } = await deployAssistanceFixture();

            await assistanceContract.connect(owner).addStudent(student1.address);
            await assistanceContract.connect(owner).removeStudent(student1.address);
            
            expect(await assistanceContract.students(student1.address)).to.be.false;
        });
        it("Fichar clase", async () => {
            const { owner, student1, mockToken, assistanceContract, decimals, encodedPass } = await deployAssistanceFixture();

            await assistanceContract.connect(owner).addStudent(student1.address);
            await assistanceContract.connect(owner).addLesson(encodedPass);
            await assistanceContract.connect(student1).attend("Disrup3");
            
            expect(Number(await mockToken.balanceOf(student1.address))).to.be.equal(Number(10 * 10 ** decimals)); // Javascript sufre al comparar BigNumbers, y eso es lo que devuelve solidity. Castearlo
        });
        it("Fichar clase sin ser student", async () => {
            const { owner, student1, mockToken, assistanceContract, encodedPass } = await deployAssistanceFixture();

            await assistanceContract.connect(owner).addLesson(encodedPass);
            
            await expect(assistanceContract.connect(student1).attend("Disrup3")).to.be.revertedWith("You are not a student");
        });
        it("Fichar clase con contraseña incorrecta", async () => {
            const { owner, student1, mockToken, assistanceContract, encodedPass } = await deployAssistanceFixture();

            await assistanceContract.connect(owner).addStudent(student1.address);
            await assistanceContract.connect(owner).addLesson(encodedPass);
            
            await expect(assistanceContract.connect(student1).attend("Disrup2")).to.be.revertedWith("Wrong password");
        });
        it("Añadir otra clase", async () => {
            const { owner, assistanceContract, encodedPass } = await deployAssistanceFixture();

            await assistanceContract.connect(owner).addLesson(encodedPass);
            const latestTime = await time.latest();
            await time.increase(latestTime + 10 * 60);
            await assistanceContract.connect(owner).addLesson(encodedPass);
            const numberOfLessons = await assistanceContract.connect(owner).getNumberOfLessons();
            
            expect(numberOfLessons).to.be.equal(2);
        });
        it("Añadir otra clase antes de tiempo", async () => {
            const { owner, assistanceContract,encodedPass } = await deployAssistanceFixture();

            await assistanceContract.connect(owner).addLesson(encodedPass);
            
            await expect(assistanceContract.connect(owner).addLesson(encodedPass)).to.be.revertedWith("There is already an active check-in");
        });
        it("Obtener 50 D3 (racha de 5 clases)", async () => {
            const { owner, student1, mockToken, assistanceContract, decimals, encodedPass } = await deployAssistanceFixture();

            await assistanceContract.connect(owner).addStudent(student1.address);
            for(let i = 0; i < 5; i++) {
                await assistanceContract.connect(owner).addLesson(encodedPass);
                await assistanceContract.connect(student1).attend("Disrup3");
                const latestTime = await time.latest();
                await time.increase(latestTime + 10 * 60);
            }

            expect(Number(await mockToken.balanceOf(student1.address))).to.be.equal(Number(90 * 10 ** decimals)); // Javascript sufre al comparar BigNumbers, y eso es lo que devuelve solidity. Castearlo
        });
        it("Ver nº de clases asistidas por un student", async () => {
            const { owner, student1, mockToken, assistanceContract, encodedPass } = await deployAssistanceFixture();

            await assistanceContract.connect(owner).addStudent(student1.address);
            for(let i = 0; i < 5; i++) {
                await assistanceContract.connect(owner).addLesson(encodedPass);
                await assistanceContract.connect(student1).attend("Disrup3");
                const latestTime = await time.latest();
                await time.increase(latestTime + 10 * 60);
            }
            const assistanceOfStudent1 = await assistanceContract.getAttendanceOf(student1.address);
            expect(assistanceOfStudent1).to.be.equal(5);
        });
        it("Ver racha de clases seguidas asistidas", async () => {
            const { owner, student1, mockToken, assistanceContract, encodedPass } = await deployAssistanceFixture();

            await assistanceContract.connect(owner).addStudent(student1.address);
            const latestTime = await time.latest();

            await assistanceContract.connect(owner).addLesson(encodedPass);
            await assistanceContract.connect(student1).attend("Disrup3");
            await time.increase(latestTime + 10 * 60);
            await assistanceContract.connect(owner).addLesson(encodedPass); // Student1 don't attend this one
            await time.increase(latestTime + 10 * 60);
            await assistanceContract.connect(owner).addLesson(encodedPass);
            await assistanceContract.connect(student1).attend("Disrup3");
            await time.increase(latestTime + 10 * 60);
            await assistanceContract.connect(owner).addLesson(encodedPass);
            await assistanceContract.connect(student1).attend("Disrup3");
            await time.increase(latestTime + 10 * 60);

            const streakOfStudent1 = await assistanceContract.getStreakOf(student1.address);
            expect(streakOfStudent1).to.be.equal(2);
        });
        it("Ver nº de alumnos asistidos a una clase", async () => {
            const { owner, student1, student2, mockToken, assistanceContract, encodedPass } = await deployAssistanceFixture();

            await assistanceContract.connect(owner).addStudent(student1.address);
            await assistanceContract.connect(owner).addStudent(student2.address);

            await assistanceContract.connect(owner).addLesson(encodedPass);
            await assistanceContract.connect(student1).attend("Disrup3");
            await assistanceContract.connect(student2).attend("Disrup3");

            const lessonAssistance = await assistanceContract.getLessonAssistance(0);
            expect(lessonAssistance).to.be.equal(2);
        });
    });
});