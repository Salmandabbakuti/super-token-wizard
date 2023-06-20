import { getAddress } from "@ethersproject/address";

export const superTokenFactoryAddresses = {
  80001: "0xb798553db6eb3d3c56912378409370145e97324b",
  137: "0x2C90719f25B10Fc5646c82DA3240C76Fa5BcCF34",
  5: "0x94f26B4c8AD12B18c12f38E878618f7664bdcCE2",
  1: "0x0422689cc4087b6B7280e0a7e7F655200ec86Ae1"
};

export const chains = {
  80001: {
    chainId: "0x13881",
    chainName: "Mumbai Testnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    rpcUrls: [
      "https://matic-mumbai.chainstacklabs.com",
      "https://rpc-mumbai.maticvigil.com"
    ],
    blockExplorerUrls: ["https://mumbai.polygonscan.com"]
  },
  137: {
    chainId: "0x89",
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    rpcUrls: [
      "https://rpc-mainnet.maticvigil.com",
      "https://matic-mainnet.chainstacklabs.com"
    ],
    blockExplorerUrls: ["https://polygonscan.com"]
  },
  5: {
    chainId: "0x5",
    chainName: "Goerli"
  },
  1: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet"
  }
};

export const isAddressValid = (address) => {
  try {
    getAddress(address);
    return true;
  } catch (err) {
    return false;
  }
};
