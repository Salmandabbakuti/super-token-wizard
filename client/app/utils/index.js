import { getAddress } from "@ethersproject/address";

import {
  baseContract,
  supertokenBaseImport,
  ownableImport,
  mintFunction,
  burnFunction,
  accessControlImport,
  cappedSupplyDefBlock,
  maxSupplyCheck,
  roleDefBlock,
  mintFunctionWithRole,
  burnFunctionWithRole,
  minterRoleDef,
  burnerRoleDef,
  minterRoleSetup,
  burnerRoleSetup
} from "./contractTemplates";

export const superTokenFactoryAddresses = {
  80001: "0xb798553db6eb3d3c56912378409370145e97324b",
  137: "0x2C90719f25B10Fc5646c82DA3240C76Fa5BcCF34",
  5: "0x94f26B4c8AD12B18c12f38E878618f7664bdcCE2",
  1: "0x0422689cc4087b6B7280e0a7e7F655200ec86Ae1",
  56: "0x8bde47397301F0Cd31b9000032fD517a39c946Eb",
  43114: "0x464AADdBB2B80f3Cb666522EB7381bE610F638b4",
  42220: "0x36be86dEe6BC726Ed0Cbd170ccD2F21760BC73D9"
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
      "https://rpc-mumbai.maticvigil.com",
      "https://rpc.ankr.com/polygon_mumbai",
      "https://matic-mumbai.chainstacklabs.com"
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
  },
  56: {
    chainId: "0x38",
    chainName: "Binance Mainnet",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18
    },
    rpcUrls: ["https://bsc-dataseed.binance.org", "https://bsc.nodereal.io"],
    blockExplorerUrls: ["https://bscscan.com"]
  },
  43114: {
    chainId: "0xa86a",
    chainName: "Avalanche Mainnet",
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18
    },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io/"]
  },
  42220: {
    chainId: "0xa4ec",
    chainName: "Celo Mainnet",
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18
    },
    rpcUrls: ["https://forno.celo.org"],
    blockExplorerUrls: ["https://explorer.celo.org"]
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

export const generateCode = (wizardOptions) => {
  const {
    licenseIdentifier = "UNLICENSED",
    premintReceiver = "msg.sender",
    premintQuantity,
    maxSupply,
    isMintable,
    isBurnable,
    isCappedSupply,
    accessControl,
  } = wizardOptions;

  const premintQuantityValue = `${premintQuantity} * 10 ** 18`;

  const hasRolesAccessControl = accessControl === "roles";
  const roleDefBlockValue = hasRolesAccessControl
    ? roleDefBlock
      .replace("$MINTER_ROLE_DEF$", isMintable ? minterRoleDef : "")
      .replace("$BURNER_ROLE_DEF$", isBurnable ? burnerRoleDef : "")
      .replace("$MINTER_ROLE_SETUP$", isMintable ? minterRoleSetup : "-")
      .replace("$BURNER_ROLE_SETUP$", isBurnable ? burnerRoleSetup : "-")
    : "";

  const maxSupplyAssignDef = isCappedSupply ? `maxSupply = ${maxSupply};` : "-";

  // Determine the mint and burn functions based on user acl choice
  const mintFunctionValue = hasRolesAccessControl ? mintFunctionWithRole : mintFunction;
  const burnFunctionValue = hasRolesAccessControl ? burnFunctionWithRole : burnFunction;

  const accessControlImportValue = hasRolesAccessControl ? accessControlImport : ownableImport;
  const accessControlInheritanceValue = hasRolesAccessControl ? ", AccessControl" : ", Ownable";

  const contractCode = baseContract
    .replace("$LICENSE_IDENTIFIER$", licenseIdentifier)
    .replace("$SUPERTOKEN_BASE_IMPORT$", supertokenBaseImport)
    .replace("$ACCESS_CONTROL_IMPORT$", accessControl ? accessControlImportValue : "")
    .replace("$ACCESS_CONTROL_INHERITANCE$", accessControl ? accessControlInheritanceValue : "")
    .replace("$CAPPED_SUPPLY_DEF_BLOCK$", isCappedSupply ? cappedSupplyDefBlock : "")
    .replace("$ROLE_DEF_BLOCK$", roleDefBlockValue)
    .replace("$MAX_SUPPLY_ASSIGN_DEF$", maxSupplyAssignDef)
    .replace("$PREMINT_RECEIVER$", premintReceiver)
    .replace("$PREMINT_QUANTITY$", premintQuantityValue)
    .replace("$MINT_FUNCTION$", isMintable ? mintFunctionValue : "")
    .replace("$MAX_SUPPLY_CHECK$", isCappedSupply ? maxSupplyCheck : "-")
    .replace("$BURN_FUNCTION$", isBurnable ? burnFunctionValue : "")
    .replace("$ONLY_OWNER$", accessControl === "ownable" ? "onlyOwner" : "")
    .replace(/(\n\s*){2,}/gm, "\n$1"); // replace multiple empty lines with a single empty line to preserve indentation

  // Remove "-" placeholders(used to preserve indentation) and empty lines
  const generatedCode = contractCode
    .split("\n")
    .filter((line) => line.trim() !== "-")
    .join("\n");

  return generatedCode;
};

