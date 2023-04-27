import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect, assert } from "chai";
import { ethers } from "hardhat";

describe("MRPABLO CONTRACT", function () {

    async function deployAssistanceFixture() {
        const [owner, user1, user2, user3] = await ethers.getSigners();

        const MrPablo = await ethers.getContractFactory("MrPablo");
        const mrPablo = await MrPablo.deploy("https://apinft.racksmafia.com/api/");

        return { owner, user1, user2, user3, mrPablo };
    }

    describe("Mr. Pablo contract", function () {
        it("-> Añadir admin", async () => {
            const { owner, user1, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);

            expect(await mrPablo.isAdmin(user1.address)).to.be.true;
        });
        it("-> Eliminar admin", async () => {
            const { owner, user1, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(owner).removeAdmin(user1.address);

            expect(await mrPablo.isAdmin(user1.address)).to.be.false;
        });
        it("-> Añadir user a whitelist", async () => {
            const { owner, user1, user2, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(user1).addToWhitelist(user2.address);

            expect(await mrPablo.isWhitelisted(user2.address)).to.be.true;
        });
        it("-> Eliminar user de whitelist", async () => {
            const { owner, user1, user2, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(user1).addToWhitelist(user2.address);
            await mrPablo.connect(user1).removeFromWhitelist(user2.address);

            expect(await mrPablo.isWhitelisted(user2.address)).to.be.false;
        });
        it("-> Mintear 1", async () => {
            const { owner, user1, user2, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(user1).addToWhitelist(user2.address);
            await mrPablo.connect(user2).mint(1, {
                value: ethers.utils.parseEther("0.1")
            });

            expect(await mrPablo.balanceOf(user2.address)).to.be.equal(1);
        });
        it("-> Mintear 5", async () => {
            const { owner, user1, user2, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(user1).addToWhitelist(user2.address);
            await mrPablo.connect(user2).mint(5, {
                value: ethers.utils.parseEther("0.5")
            });

            expect(await mrPablo.balanceOf(user2.address)).to.be.equal(5);
        });
        it("!! Mintear 6", async () => {
            const { owner, user1, user2, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(user1).addToWhitelist(user2.address);

            await expect(mrPablo.connect(user2).mint(6, {
                value: ethers.utils.parseEther("0.6")
            })).to.be.revertedWith("Max 5 tokens per transaction");
        });
        it("!! Mintear 1 por menos eth", async () => {
            const { owner, user1, user2, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(user1).addToWhitelist(user2.address);

            await expect(mrPablo.connect(user2).mint(1, {
                value: ethers.utils.parseEther("0.05")
            })).to.be.revertedWith("Not enough funds");
        });
        it("!! Mintear 3 por menos eth", async () => {
            const { owner, user1, user2, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(user1).addToWhitelist(user2.address);

            await expect(mrPablo.connect(user2).mint(3, {
                value: ethers.utils.parseEther("0.25")
            })).to.be.revertedWith("Not enough funds");
        });
        it("-> Balances correctos (1 mint x1)", async () => {
            const { owner, user1, user2, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(user1).addToWhitelist(user2.address);
            await mrPablo.connect(user2).mint(1, {
                value: ethers.utils.parseEther("0.1")
            });

            const ethReceived = Number(ethers.utils.formatEther(await mrPablo.getContractFunds()));
            expect(ethReceived).to.be.equal(0.1);
        });
        it("-> Balances correctos (1 mint x2)", async () => {
            const { owner, user1, user2, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(user1).addToWhitelist(user2.address);
            await mrPablo.connect(user2).mint(2, {
                value: ethers.utils.parseEther("0.5")
            });

            const ethReceived = Number(ethers.utils.formatEther(await mrPablo.getContractFunds()));
            expect(ethReceived).to.be.equal(0.5);
        });
        it("-> Balances correctos (2 mints x2)", async () => {
            const { owner, user1, user2, user3, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(user1).addToWhitelist(user2.address);
            await mrPablo.connect(user1).addToWhitelist(user3.address);
            await mrPablo.connect(user2).mint(2, {
                value: ethers.utils.parseEther("0.5")
            });
            await mrPablo.connect(user3).mint(2, {
                value: ethers.utils.parseEther("0.5")
            });

            const ethReceived = Number(ethers.utils.formatEther(await mrPablo.getContractFunds()));
            expect(ethReceived).to.be.equal(1);
        });
        it("-> Supply correcto", async () => {
            const { owner, user1, user2, user3, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(user1).addToWhitelist(user2.address);
            await mrPablo.connect(user1).addToWhitelist(user3.address);
            await mrPablo.connect(user2).mint(2, {
                value: ethers.utils.parseEther("0.2")
            });
            await mrPablo.connect(user3).mint(3, {
                value: ethers.utils.parseEther("0.3")
            });

            expect(await mrPablo.supply()).to.be.equal(5);
        });
        it("!! Pausar contrato", async () => {
            const { owner, user1, user2, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(user1).togglePause();
            await mrPablo.connect(user1).addToWhitelist(user2.address);
            
            await expect(mrPablo.connect(user2).mint(1, {
                value: ethers.utils.parseEther("0.1")
            })).to.be.revertedWith("Contract paused");
        });
        it("!! Reanudar contrato", async () => {
            const { owner, user1, user2, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(user1).togglePause();
            await mrPablo.connect(user1).togglePause();
            await mrPablo.connect(user1).addToWhitelist(user2.address);
            
            expect(await mrPablo.isWhitelisted(user2.address)).to.be.true;
        });
        it("-> Retirar ingresos", async () => {
            const { owner, user1, user2, mrPablo } = await deployAssistanceFixture();

            await mrPablo.connect(owner).addAdmin(user1.address);
            await mrPablo.connect(user1).addToWhitelist(user2.address);
            await mrPablo.connect(user2).mint(1, {
                value: ethers.utils.parseEther("0.1")
            });
            const previousBalance = await ethers.provider.getBalance(owner.address);
            await mrPablo.connect(owner).withdraw();
            
            expect(await ethers.provider.getBalance(owner.address)).to.be.greaterThan(previousBalance);
        });
    });
});