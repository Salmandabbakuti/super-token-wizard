"use client";
import React, { useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { ContractFactory } from "@ethersproject/contracts";
import { Input, Checkbox, Button, Typography, Layout, message } from "antd";
import "antd/dist/antd.css";
import Link from "next/link";

import {
  mainContract,
  ownableImport,
  mintFunction
} from "./utils/contractTemplates";

const { TextArea } = Input;
const { Text } = Typography;
const { Header, Footer, Sider, Content } = Layout;

const compiledOutput = {
  abi: [
    {
      inputs: [],
      name: "Initialized",
      type: "error"
    },
    {
      inputs: [],
      name: "ZeroAddress",
      type: "error"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address"
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address"
        }
      ],
      name: "OwnershipTransferred",
      type: "event"
    },
    {
      stateMutability: "payable",
      type: "fallback"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "factory",
          type: "address"
        },
        {
          internalType: "string",
          name: "name",
          type: "string"
        },
        {
          internalType: "string",
          name: "symbol",
          type: "string"
        }
      ],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "initialAddress",
          type: "address"
        }
      ],
      name: "initializeProxy",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "receiver",
          type: "address"
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        },
        {
          internalType: "bytes",
          name: "userData",
          type: "bytes"
        }
      ],
      name: "mint",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address"
        }
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      stateMutability: "payable",
      type: "receive"
    }
  ],
  bytecode:
    "608060405234801561001057600080fd5b5061002d61002261003260201b60201c565b61003a60201b60201c565b610100565b600033905090565b6000602060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081602060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b610d938061010f6000396000f3fe6080604052600436106100595760003560e01c80634a0687ef14610072578063715018a61461009b5780638da5cb5b146100b257806390657147146100dd57806394d008ef14610106578063f2fde38b1461012f57610068565b3661006857610066610158565b005b610070610158565b005b34801561007e57600080fd5b50610099600480360381019061009491906106d6565b610172565b005b3480156100a757600080fd5b506100b061026b565b005b3480156100be57600080fd5b506100c761027f565b6040516100d49190610712565b60405180910390f35b3480156100e957600080fd5b5061010460048036038101906100ff9190610873565b6102a9565b005b34801561011257600080fd5b5061012d600480360381019061012891906109d5565b6102d5565b005b34801561013b57600080fd5b50610156600480360381019061015191906106d6565b6102ed565b005b610160610370565b61017061016b610372565b61039b565b565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036101d8576040517fd92e233d00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff166101f8610372565b73ffffffffffffffffffffffffffffffffffffffff1614610245576040517f5daa87a000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b807f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5550565b6102736103c1565b61027d600061043f565b565b6000602060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6102b4838383610505565b6102d0336103e8604051806020016040528060008152506105e8565b505050565b6102dd6103c1565b6102e88383836105e8565b505050565b6102f56103c1565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610364576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161035b90610ac7565b60405180910390fd5b61036d8161043f565b50565b565b60007f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc54905090565b3660008037600080366000845af43d6000803e80600081146103bc573d6000f35b3d6000fd5b6103c961065c565b73ffffffffffffffffffffffffffffffffffffffff166103e761027f565b73ffffffffffffffffffffffffffffffffffffffff161461043d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161043490610b33565b60405180910390fd5b565b6000602060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081602060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b8273ffffffffffffffffffffffffffffffffffffffff1663d412d344306040518263ffffffff1660e01b815260040161053e9190610712565b600060405180830381600087803b15801561055857600080fd5b505af115801561056c573d6000803e3d6000fd5b505050503073ffffffffffffffffffffffffffffffffffffffff166342fe09806000601285856040518563ffffffff1660e01b81526004016105b19493929190610c68565b600060405180830381600087803b1580156105cb57600080fd5b505af11580156105df573d6000803e3d6000fd5b50505050505050565b3073ffffffffffffffffffffffffffffffffffffffff1663c68d42838484846040518463ffffffff1660e01b815260040161062593929190610d1f565b600060405180830381600087803b15801561063f57600080fd5b505af1158015610653573d6000803e3d6000fd5b50505050505050565b600033905090565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006106a382610678565b9050919050565b6106b381610698565b81146106be57600080fd5b50565b6000813590506106d0816106aa565b92915050565b6000602082840312156106ec576106eb61066e565b5b60006106fa848285016106c1565b91505092915050565b61070c81610698565b82525050565b60006020820190506107276000830184610703565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b61078082610737565b810181811067ffffffffffffffff8211171561079f5761079e610748565b5b80604052505050565b60006107b2610664565b90506107be8282610777565b919050565b600067ffffffffffffffff8211156107de576107dd610748565b5b6107e782610737565b9050602081019050919050565b82818337600083830152505050565b6000610816610811846107c3565b6107a8565b90508281526020810184848401111561083257610831610732565b5b61083d8482856107f4565b509392505050565b600082601f83011261085a5761085961072d565b5b813561086a848260208601610803565b91505092915050565b60008060006060848603121561088c5761088b61066e565b5b600061089a868287016106c1565b935050602084013567ffffffffffffffff8111156108bb576108ba610673565b5b6108c786828701610845565b925050604084013567ffffffffffffffff8111156108e8576108e7610673565b5b6108f486828701610845565b9150509250925092565b6000819050919050565b610911816108fe565b811461091c57600080fd5b50565b60008135905061092e81610908565b92915050565b600067ffffffffffffffff82111561094f5761094e610748565b5b61095882610737565b9050602081019050919050565b600061097861097384610934565b6107a8565b90508281526020810184848401111561099457610993610732565b5b61099f8482856107f4565b509392505050565b600082601f8301126109bc576109bb61072d565b5b81356109cc848260208601610965565b91505092915050565b6000806000606084860312156109ee576109ed61066e565b5b60006109fc868287016106c1565b9350506020610a0d8682870161091f565b925050604084013567ffffffffffffffff811115610a2e57610a2d610673565b5b610a3a868287016109a7565b9150509250925092565b600082825260208201905092915050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b6000610ab1602683610a44565b9150610abc82610a55565b604082019050919050565b60006020820190508181036000830152610ae081610aa4565b9050919050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b6000610b1d602083610a44565b9150610b2882610ae7565b602082019050919050565b60006020820190508181036000830152610b4c81610b10565b9050919050565b6000819050919050565b6000610b78610b73610b6e84610678565b610b53565b610678565b9050919050565b6000610b8a82610b5d565b9050919050565b6000610b9c82610b7f565b9050919050565b610bac81610b91565b82525050565b6000819050919050565b600060ff82169050919050565b6000610be4610bdf610bda84610bb2565b610b53565b610bbc565b9050919050565b610bf481610bc9565b82525050565b600081519050919050565b60005b83811015610c23578082015181840152602081019050610c08565b60008484015250505050565b6000610c3a82610bfa565b610c448185610a44565b9350610c54818560208601610c05565b610c5d81610737565b840191505092915050565b6000608082019050610c7d6000830187610ba3565b610c8a6020830186610beb565b8181036040830152610c9c8185610c2f565b90508181036060830152610cb08184610c2f565b905095945050505050565b610cc4816108fe565b82525050565b600081519050919050565b600082825260208201905092915050565b6000610cf182610cca565b610cfb8185610cd5565b9350610d0b818560208601610c05565b610d1481610737565b840191505092915050565b6000606082019050610d346000830186610703565b610d416020830185610cbb565b8181036040830152610d538184610ce6565b905094935050505056fea26469706673582212200b2125291600ecf4b134756dc181b36cb9e75deb6ab6f2970108dc69d6a482e364736f6c63430008120033"
};

const SuperTokenWizard = () => {
  const [wizardOptions, setWizardOptions] = useState({
    premintQuantity: 1000,
    licenseIdentifier: "MIT"
  });
  const [generatedCode, setGeneratedCode] = useState("");
  // const [compiledOutput, setCompiledOutput] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [deployedContractAddress, setDeployedContractAddress] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const handleWizardOptionsChange = (e) => {
    setWizardOptions({ ...wizardOptions, [e.target.name]: e.target.value });
  };

  const handleGenerateCode = () => {
    const contractCode = mainContract
      .replace("$LICENSE_IDENTIFIER$", wizardOptions.licenseIdentifier)
      .replace("$OWNABLE_IMPORT$", wizardOptions.isOwnable ? ownableImport : "")
      .replace(
        "$OWNABLE_INHERITANCE$",
        wizardOptions.isOwnable ? ", Ownable" : ""
      )
      .replace("$PREMINT_QUANTITY$", wizardOptions.premintQuantity)
      .replace("$MINT_FUNCTION$", wizardOptions.isMintable ? mintFunction : "")
      .replace("$ONLY_OWNER$", wizardOptions.isOwnable ? "onlyOwner" : "");
    setGeneratedCode(contractCode);
  };

  const handleCopyCode = () => {
    if (!generatedCode) return message.warning("No code to copy");
    navigator.clipboard.writeText(generatedCode);
    message.success("Code copied to clipboard");
  };

  const handleConnectWallet = async () => {
    if (window?.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      console.log("Using account: ", accounts[0]);
      const provider = new Web3Provider(window.ethereum);
      const { chainId } = await provider.getNetwork();
      if (chainId !== 80001) {
        message.info("Switching to mumbai testnet");
        // switch to the mumbai testnet
        await window.ethereum
          .request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x13881" }]
          })
          .catch(async (err) => {
            // This error code indicates that the chain has not been added to MetaMask.
            console.log("err on switch", err);
            if (err.code === 4902) {
              message.info("Adding mumbai testnet to metamask");
              await window.ethereum
                .request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0x13881",
                      chainName: "Polygon Mumbai Testnet",
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
                    }
                  ]
                })
                .then(() => message.info("Switched to mumbai testnet"))
                .catch((err) => {
                  message.error("Error adding mumbai testnet to metamask");
                  console.error(err);
                });
            }
          });
      }
      console.log("chainId:", chainId);
      setAccount(accounts[0]);
      setProvider(provider);
    } else {
      console.warn("Please use web3 enabled browser");
      message.warning(
        "Please install Metamask or any other web3 enabled browser"
      );
    }
  };

  const handleSwitchNetwork = () => {
    // Handle the logic to switch the Ethereum network
    // You can use web3.js or ethers.js to switch the network
  };

  const handleCompile = () => {
    // Handle the logic to compile the generated code
    // You can use a Solidity compiler library, such as solc, to compile the code
  };

  const handleDeploy = async () => {
    if (!provider) return message.error("Please connect your wallet first");
    if (!compiledOutput?.abi?.length)
      return message.error("Please compile the code first");
    try {
      const contractFactory = new ContractFactory(
        compiledOutput.abi,
        compiledOutput.bytecode,
        provider.getSigner()
      );
      const contract = await contractFactory.deploy();
      await contract.deployed();
      setDeployedContractAddress(contract.address);
      setContract(contract);
      message.success("Contract deployed successfully");
    } catch (err) {
      console.error("Error deploying contract", err);
      message.error("Something went wrong while deploying the contract");
    }
  };

  const handleInitialize = async () => {
    if (!provider) return message.error("Please connect your wallet first");
    if (!contract) return message.error("Please deploy the contract first");
    try {
      const tx = await contract.initialize();
      setTransactionHash(tx.hash);
      await tx.wait();
    } catch (err) {
      console.error("Error initializing contract", err);
      message.error("Something went wrong while initializing the contract");
    }
  };

  return (
    <>
      <div className="navbar">
        <div className="logo">
          <img
            src="/wizard_logo.svg"
            alt="Logo"
            className="logo-image"
            width={40}
            height={40}
          />
          <Text strong className="logo-text">
            SuperToken Wizard
          </Text>
        </div>
        <div className="navbar-buttons">
          {account ? (
            <span>{account.slice(0, 8) + "..." + account.slice(-5)}</span>
          ) : (
            <Button
              type="text"
              // icon={<WalletOutlined />}
              onClick={handleConnectWallet}
            >
              Connect Wallet
            </Button>
          )}
          <Button
            type="text"
            // icon={<SwapOutlined />}
            onClick={handleSwitchNetwork}
          >
            Switch Network
          </Button>
        </div>
      </div>
      <div className="container">
        <div className="options">
          <div className="section">
            <h3>Token Options</h3>
            <Input
              placeholder="Token Name"
              value={wizardOptions?.tokenName}
              onChange={handleWizardOptionsChange}
            />

            <Input
              name="tokenSymbol"
              placeholder="Token Symbol"
              value={wizardOptions?.tokenSymbol}
              onChange={handleWizardOptionsChange}
            />

            <Input
              name="premintQuantity"
              type="number"
              placeholder="Premint Quantity"
              value={wizardOptions?.premintQuantity}
              onChange={handleWizardOptionsChange}
            />

            <Input
              name="licenseIdentifier"
              placeholder="License Identifier"
              value={wizardOptions?.licenseIdentifier}
              onChange={handleWizardOptionsChange}
            />
          </div>
          <div className="section">
            <h3>Features</h3>
            <Checkbox
              checked={wizardOptions?.isMintable}
              onChange={(e) =>
                setWizardOptions({
                  ...wizardOptions,
                  isMintable: e.target.checked
                })
              }
            >
              Mintable
            </Checkbox>

            <Checkbox
              checked={wizardOptions?.isOwnable}
              onChange={(e) =>
                setWizardOptions({
                  ...wizardOptions,
                  isOwnable: e.target.checked
                })
              }
            >
              Ownable
            </Checkbox>
          </div>
          <div className="section">
            <Button type="primary" onClick={handleGenerateCode}>
              Generate
            </Button>
          </div>

          <div className="code">
            <TextArea
              value={generatedCode}
              autoSize={{ minRows: 10, maxRows: 80 }}
              style={{
                fontFamily: "monospace",
                fontSize: "14px",
                backgroundColor: "#282c34",
                color: "#fff",
                width: "100%",
                height: "100%"
              }}
              readOnly
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              rows={20}
              cols={80}
            />
            <div className="code-buttons">
              <Button onClick={handleCopyCode}>Copy Code</Button>
              <Link
                href={`https://remix.ethereum.org/?#code=${btoa(
                  generatedCode
                )}`}
                target="_blank"
              >
                <Button>Open in Remix</Button>
              </Link>
              <Button type="primary" onClick={handleCompile}>
                Compile
              </Button>
              <Button type="primary" onClick={handleDeploy}>
                Deploy
              </Button>
              {contract && (
                <Button type="primary" onClick={handleInitialize}>
                  Initialize
                </Button>
              )}
            </div>
          </div>
          <div className="log-box">
            {deployedContractAddress && (
              <div>
                <strong>Deployed Contract Address:</strong>
                <p>{deployedContractAddress}</p>
              </div>
            )}
            {transactionHash && (
              <div>
                <strong>Transaction Hash:</strong>
                <p>{transactionHash}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          background-color: #f5f5f5;
        }

        .logo {
          display: flex;
          align-items: center;
        }

        .logo-image {
          width: 40px;
          height: 40px;
          margin-right: 10px;
        }

        .logo-text {
          font-size: 18px;
        }

        .navbar-buttons {
          display: flex;
          gap: 10px;
        }

        .container {
          display: flex;
          flex-direction: row;
        }

        .options {
          flex: 1;
          padding: 20px;
        }

        .section {
          padding: 20px;
        }

        .code {
          flex: 2;
          padding: 20px;
        }

        .code-buttons {
          margin-top: 10px;
          display: flex;
          gap: 10px;
        }

        .log-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 20px;
          padding: 20px;
          background-color: #f5f5f5;
        }

        .log-box strong {
          margin-bottom: 10px;
        }

        .actions {
          flex: 1;
          padding: 20px;
          display: flex;
          justify-content: flex-end;
        }

        .actions button {
          margin-left: 10px;
        }
      `}</style>
    </>
  );
};

export default SuperTokenWizard;
