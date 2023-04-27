import { ethers } from "hardhat";

async function main() {
  const MrPablo = await ethers.getContractFactory("MrPablo");
  const mrPablo: any = MrPablo.attach("0x348a761e38FFFA84a6B25AaA07b3F2ef4a6e220e"); 
  
    console.log("------------------> ABI:");
    console.log(mrPablo.address.abi);

  await mrPablo.addToWhitelist("0x960eb276ce3f7332bE14352dB4c710565A6ab1D8");
  await mrPablo.mint(4, {value: ethers.utils.parseEther("0.4")});
  console.log(await mrPablo.tokenURI(1));

  // await mrPablo.withdraw();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});