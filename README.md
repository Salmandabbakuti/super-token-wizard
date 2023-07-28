# SuperToken Wizard

The SuperToken Wizard is a web-based interface that allows developers or individuals to easily deploy a Super Token contract without the need for manually searching for the right contracts and parameters or configuring them individually. With this wizard, you can quickly generate a customized Super Token contract based on your specific needs, copy it or open in remix directly for further customization and deployment, Wizard also allow you to deploy and initialize Super Token contract right from the app. You can also switch between different blockchain networks with in the wizard to deploy Super Tokens on your preferred network.

![Screen1](https://github.com/Salmandabbakuti/super-token-wizard/assets/29351207/6092aad0-fb29-4f2c-981f-1da56df22d4f)

![Screen2](https://github.com/Salmandabbakuti/super-token-wizard/assets/29351207/95c61074-9a7b-4bbb-beb2-6d2c5eacaf42)

## Features

**1. Connect Wallet and Switch Networks:** The wizard allows you to connect your wallet and switch between different blockchain networks, enabling you to deploy Super Tokens on your preferred network.

**2. Customizable Contract Generation:** You can input parameters such as token name, token symbol, premint quantity, and premint receiver address to generate a customized contract code for your Super Token. Additionally, you can enable or disable features like mintable, burnable and access control(ownable or roles) for the token.

**3. Copy and Open in Remix:** The generated contract code can be easily copied or opened in Remix IDE directly for further customization and deployment.

**4. Compile and Copy Artifacts:** The wizard provides the functionality to compile the contract code and copy the compiled artifacts, including the ABI and bytecode, for future reference or integration with other tools.

**5. Deploy and Initialize:** The wizard allows you to deploy and initialize the Super Token contract right from the app. You can also view the transaction details and the deployed contract address.

#### Tech Stack

- Frontend: Next.js, Antd
- Backend: Node.js, Express.js
- Web3 Client: ethers.js
- Smartcontracts: Solidity, Hardhat, OpenZeppelin, Superfluid Contracts

## Getting Started

### Prerequisites

- [Node.js 16+](https://nodejs.org/en/download/)

First, run the backend development server(hardhat compiler API):

```bash
npm install
npm run dev
```

## Usage(Compiler API)

```
curl -X POST -H "Content-Type: application/json" -d '{"code": "pragma solidity ^0.8.0; contract MyToken { string public name; constructor(string memory _name) { name = _name; } }"}' http://localhost:4000/api/compile
```

The response will contain the compiled ABI and bytecode of the contract.

Then, run the frontend development server:

> Note: Copy `client/.env.example` to `client/.env` and update compiler API URL accordingly.

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Demo

https://github.com/Salmandabbakuti/super-token-wizard/assets/29351207/3784a598-ae2f-4557-905a-7425c336e853

## Credits & Resources:

- [Superfluid Bounties](https://github.com/superfluid-finance/custom-supertokens/issues/25)
- [Superfluid Guides](https://docs.superfluid.finance/superfluid/resources/integration-guides)
- [Hardhat](https://hardhat.org/getting-started/)
- [Ethers.js](https://docs.ethers.io/v5/)
- [Next.js](https://nextjs.org/docs/getting-started)

## Safety

This is experimental software and subject to change over time.

The SuperToken Wizard is provided as a convenience tool and does not guarantee the accuracy or security of the generated contract code or deployments. Please review and audit the generated code before using it in a production environment. Use at your own risk.
I do not give any warranties and will not be liable for any loss incurred through any use of this codebase.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details
