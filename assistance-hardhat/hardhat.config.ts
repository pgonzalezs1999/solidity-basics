import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
import "@nomiclabs/hardhat-etherscan";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    goerli: {
      accounts: [process.env.ACCOUNT1!],
      url: process.env.PROVIDER_URL_GOERLI!,
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN!
  }
};

export default config;