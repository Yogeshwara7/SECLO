import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as tenderly from "@tenderly/hardhat-tenderly";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

tenderly.setup({ automaticVerifications: true });

const config: HardhatUserConfig = {
  solidity: "0.8.26",
  networks: {
    virtualHoodi: {
      url: "https://virtual.hoodi.eu.rpc.tenderly.co/bf548619-5cbe-41b3-b4a1-7ad47a31d3e8",
      chainId: 40875, // Hoodi chain ID
      accounts: process.env.DEPLOYER_PRIVATE_KEY 
        ? [process.env.DEPLOYER_PRIVATE_KEY.startsWith('0x') 
            ? process.env.DEPLOYER_PRIVATE_KEY 
            : `0x${process.env.DEPLOYER_PRIVATE_KEY}`]
        : []
    }
  },
  tenderly: {
    project: "seclo-payroll",
    username: "Yogii"
  }
};

export default config;
