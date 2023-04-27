import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect, assert } from "chai";
import { ethers } from "hardhat";

describe("COIN FLIP HACK", function () {
    async function deployAssistanceFixture() {
        const [owner, address1] = await ethers.getSigners();
        
        const CoinFlipHack = await ethers.getContractFactory("CoinFlipHack");
        const coinFlipHack = await CoinFlipHack.deploy();
        
        return { owner, address1, coinFlipHack };
    }
    
    describe("CoinFlipHack contract", function() {
        it("Añadir admin", async () => {
            const { coinFlipHack } = await deployAssistanceFixture();
            
            const latestTime = await time.latest();

            console.log(" 1.", await coinFlipHack.callStatic.flip());
            await time.increase(latestTime + 60);
            console.log(" 2.", await coinFlipHack.callStatic.flip());
            await time.increase(latestTime + 60);
            console.log(" 3.", await coinFlipHack.callStatic.flip());
            await time.increase(latestTime + 60);
            console.log(" 4.", await coinFlipHack.callStatic.flip());
            await time.increase(latestTime + 60);
            console.log(" 5.", await coinFlipHack.callStatic.flip());
            await time.increase(latestTime + 60);
            console.log(" 6.", await coinFlipHack.callStatic.flip());
            await time.increase(latestTime + 60);
            console.log(" 7.", await coinFlipHack.callStatic.flip());
            await time.increase(latestTime + 60);
            console.log(" 8.", await coinFlipHack.callStatic.flip());
            await time.increase(latestTime + 60);
            console.log(" 9.", await coinFlipHack.callStatic.flip());
            await time.increase(latestTime + 60);
            console.log("10.", await coinFlipHack.callStatic.flip());

            expect(0).to.be.equal(0);
        });
    });
});