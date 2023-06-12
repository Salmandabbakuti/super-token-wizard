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

import compiledOutput from "./utils/MyToken.json";

const { TextArea } = Input;
const { Text } = Typography;

const SuperTokenWizard = () => {
  const [wizardOptions, setWizardOptions] = useState({
    premintQuantity: 1000,
    licenseIdentifier: "MIT",
    tokenName: "",
    tokenSymbol: "",
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
      setTransactionHash(contract.deployTransaction.hash);
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
    if (
      /^\s*$/.test(wizardOptions?.tokenName) ||
      /^\s*$/.test(wizardOptions?.tokenSymbol)
    )
      return message.error("Please set token name and symbol");
    try {
      const tx = await contract.initialize(
        contract.address,
        wizardOptions?.tokenName,
        wizardOptions?.tokenSymbol
      );
      setTransactionHash(tx.hash);
      await tx.wait();
      message.success("Contract initialized successfully");
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
              name="tokenName"
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
    </>
  );
};

export default SuperTokenWizard;
