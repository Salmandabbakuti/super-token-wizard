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
  minterRoleGrant,
  burnerRoleGrant,
} from "./contractTemplates";

export const superTokenFactoryAddresses = {
  80001: "0xb798553db6eb3d3c56912378409370145e97324b",
  137: "0x2C90719f25B10Fc5646c82DA3240C76Fa5BcCF34",
  5: "0x94f26B4c8AD12B18c12f38E878618f7664bdcCE2",
  1: "0x0422689cc4087b6B7280e0a7e7F655200ec86Ae1",
  56: "0x8bde47397301F0Cd31b9000032fD517a39c946Eb",
  43114: "0x464AADdBB2B80f3Cb666522EB7381bE610F638b4",
  42220: "0x36be86dEe6BC726Ed0Cbd170ccD2F21760BC73D9",
  8453: "0xe20B9a38E0c96F61d1bA6b42a61512D56Fea1Eb3"
};

export const isAddressValid = (address) => {
  console.log("isAddressValid server", address);
  try {
    getAddress(address);
    return true;
  } catch (err) {
    return false;
  }
};

export const generateCode = (wizardOptions) => {
  const {
    licenseIdentifier,
    premintReceiver,
    premintQuantity,
    maxSupply,
    isMintable,
    isBurnable,
    isCappedSupply,
    accessControl,
  } = wizardOptions;

  const licenseIdentifierValue = licenseIdentifier || "UNLICENSED";
  const premintReceiverValue = premintReceiver || "msg.sender";
  const premintQuantityValue = `${premintQuantity} * 10 ** 18`;

  const hasRolesAccessControl = accessControl === "roles";
  const roleDefBlockValue = hasRolesAccessControl
    ? roleDefBlock
      .replace("$MINTER_ROLE_DEF$", isMintable ? minterRoleDef : "")
      .replace("$BURNER_ROLE_DEF$", isBurnable ? burnerRoleDef : "")
      .replace("$MINTER_ROLE_GRANT$", isMintable ? minterRoleGrant : "-")
      .replace("$BURNER_ROLE_GRANT$", isBurnable ? burnerRoleGrant : "-")
    : "";

  const maxSupplyAssignDef = isCappedSupply ? `maxSupply = ${maxSupply} * 10 ** 18;` : "-";

  // Determine the mint and burn functions based on user acl choice
  const mintFunctionValue = hasRolesAccessControl ? mintFunctionWithRole : mintFunction;
  const burnFunctionValue = hasRolesAccessControl ? burnFunctionWithRole : burnFunction;

  const accessControlImportValue = hasRolesAccessControl ? accessControlImport : ownableImport;
  const accessControlInheritanceValue = hasRolesAccessControl ? ", AccessControl" : ", Ownable";

  const contractCode = baseContract
    .replace("$LICENSE_IDENTIFIER$", licenseIdentifierValue)
    .replace("$SUPERTOKEN_BASE_IMPORT$", supertokenBaseImport)
    .replace("$ACCESS_CONTROL_IMPORT$", accessControl ? accessControlImportValue : "")
    .replace("$ACCESS_CONTROL_INHERITANCE$", accessControl ? accessControlInheritanceValue : "")
    .replace("$CAPPED_SUPPLY_DEF_BLOCK$", isCappedSupply ? cappedSupplyDefBlock : "")
    .replace("$ROLE_DEF_BLOCK$", roleDefBlockValue)
    .replace("$MAX_SUPPLY_ASSIGN_DEF$", maxSupplyAssignDef)
    .replace("$PREMINT_RECEIVER$", premintReceiverValue)
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

