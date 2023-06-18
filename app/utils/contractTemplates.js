export const mainContract = `// SPDX-License-Identifier: $LICENSE_IDENTIFIER$
pragma solidity ^0.8.0;

import {SuperTokenBase} from "github.com/superfluid-finance/custom-supertokens/contracts/base/SuperTokenBase.sol";
$OWNABLE_IMPORT$

contract MyToken is SuperTokenBase$OWNABLE_INHERITANCE$ {

	function initialize(address factory, string memory name, string memory symbol) external {
		_initialize(factory, name, symbol);
		_mint($PREMINT_RECEIVER$, $PREMINT_QUANTITY$, "");
	}

	$MINT_FUNCTION$

	$BURN_FUNCTION$
}
`;

export const ownableImport = "import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';";

export const mintFunction = `function mint(address receiver, uint256 amount, bytes memory userData) external $ONLY_OWNER$ {
		_mint(receiver, amount, userData);
	}`;

export const burnFunction = `function burn(uint256 amount, bytes memory userData) external {
		_burn(msg.sender, amount, userData);
	}`;