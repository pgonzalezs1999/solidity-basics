import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const MrPablo = await ethers.getContractFactory("MrPablo");
  const mrPablo: any = await MrPablo.deploy("https://apinft.racksmafia.com/api/"); 

  await mrPablo.deployed();
  console.log("------------------> ADDRESS:");
  console.log(mrPablo.address);
  console.log("------------------> ABI:");
  console.log(mrPablo.abi);

  await mrPablo.mint(2, {value: ethers.utils.parseEther("0.2")});
  console.log(await mrPablo.tokenURI(1));

  const constants = {
    address: mrPablo.address,
    abi: mrPablo.interface.format(ethers.utils.FormatTypes.json),
  }
  fs.writeFileSync("../primer-mint/web3Constants/constant.json", JSON.stringify(constants));

  console.log("Constantes escritas");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});