const contractTemplate = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {SuperTokenBase} from "@superfluid-finance/custom-supertokens/contracts/base/SuperTokenBase.sol";
$OWNABLE_IMPORT$

contract MyToken is SuperTokenBase$OWNABLE_INHERITANCE$ {

	function initialize(address factory, string memory name, string memory symbol) external {
		_initialize(factory, name, symbol);
		_mint(msg.sender, $PREMINT_AMOUNT$, "");
	}

	function mint(address receiver, uint256 amount, bytes memory userData) external $ONLY_OWNER$ {
		_mint(receiver, amount, userData);
	}
}
`;

export default contractTemplate;