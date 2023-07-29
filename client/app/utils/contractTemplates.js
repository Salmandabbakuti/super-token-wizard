export const baseContract = `// SPDX-License-Identifier: $LICENSE_IDENTIFIER$
pragma solidity ^0.8.0;

$SUPERTOKEN_BASE_IMPORT$
$ACCESS_CONTROL_IMPORT$

contract MySuperToken is SuperTokenBase$ACCESS_CONTROL_INHERITANCE$ {
	$CAPPED_SUPPLY_DEF_BLOCK$

	$ROLE_DEF_BLOCK$

	function initialize(address factory, string memory name, string memory symbol) external {
		_initialize(factory, name, symbol);
		$MAX_SUPPLY_ASSIGN_DEF$
		_mint($PREMINT_RECEIVER$, $PREMINT_QUANTITY$, "");
	}

	$MINT_FUNCTION$

	$BURN_FUNCTION$
}
`;

export const ownableImport = `import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";`;

export const accessControlImport = `import "@openzeppelin/contracts/access/AccessControl.sol";`;

export const supertokenBaseImport = `import {SuperTokenBase} from "github.com/superfluid-finance/custom-supertokens/contracts/base/SuperTokenBase.sol";`;

export const supertokenBaseImportLocalPath = `import {SuperTokenBase} from "./base/SuperTokenBase.sol";`;

export const minterRoleDef = `bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");`;
export const burnerRoleDef = `bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");`;
export const minterRoleGrant = "_grantRole(MINTER_ROLE, msg.sender);";
export const burnerRoleGrant = "_grantRole(BURNER_ROLE, msg.sender);";

export const roleDefBlock = `$MINTER_ROLE_DEF$
	$BURNER_ROLE_DEF$
	
	constructor() {
		_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
		$MINTER_ROLE_GRANT$
		$BURNER_ROLE_GRANT$
	}`;

export const cappedSupplyDefBlock = `error SupplyCapped();
	uint256 public maxSupply;
`;

export const maxSupplyCheck = `if (_totalSupply() + amount > maxSupply) revert SupplyCapped();`;

export const mintFunction = `function mint(address receiver, uint256 amount, bytes memory userData) external $ONLY_OWNER$ {
		$MAX_SUPPLY_CHECK$
		_mint(receiver, amount, userData);
	}`;

export const burnFunction = `function burn(uint256 amount, bytes memory userData) external {
		_burn(msg.sender, amount, userData);
	}`;

export const mintFunctionWithRole = `function mint(address receiver, uint256 amount, bytes memory userData) external $ONLY_OWNER$ {
		$MAX_SUPPLY_CHECK$
		require(hasRole(MINTER_ROLE, msg.sender), "SuperToken: must have minter role to mint");
		_mint(receiver, amount, userData);
	}`;

export const burnFunctionWithRole = `function burn(uint256 amount, bytes memory userData) external {
		require(hasRole(BURNER_ROLE, msg.sender), "SuperToken: must have burner role to burn");
		_burn(msg.sender, amount, userData);
	}`;
