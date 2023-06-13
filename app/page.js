"use client";
import React, { useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { ContractFactory } from "@ethersproject/contracts";
// import {
//   getCompilerVersions,
//   solidityCompiler,
// } from '@agnostico/browser-solidity-compiler';
import {
  Input,
  Checkbox,
  Button,
  Typography,
  message,
  Select
} from "antd";
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

const superTokenFactoryAddresses = {
  "80001": "0xb798553db6eb3d3c56912378409370145e97324b",
  "137": "0x2C90719f25B10Fc5646c82DA3240C76Fa5BcCF34",
  "5": "0x94f26B4c8AD12B18c12f38E878618f7664bdcCE2",
  "1": "0x0422689cc4087b6B7280e0a7e7F655200ec86Ae1"
};

const chains = {
  "80001": {
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
  "137": {
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
  "5": {
    chainId: "0x5",
    chainName: "Goerli"
  },
  "1": {
    chainId: "0x1",
    chainName: "Ethereum Mainnet"
  },
};

export default function Home() {
  const [wizardOptions, setWizardOptions] = useState({
    premintQuantity: 1000,
    licenseIdentifier: "MIT",
    tokenName: "",
    tokenSymbol: ""
  });
  const [generatedCode, setGeneratedCode] = useState("");
  // const [compiledOutput, setCompiledOutput] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [logMessage, setLogMessage] = useState("");
  const [selectedChainId, setSelectedChainId] = useState("80001");

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
      .replace("$PREMINT_RECEIVER$", wizardOptions?.premintReceiver || "msg.sender")
      .replace(
        "$PREMINT_QUANTITY$",
        `${wizardOptions?.premintQuantity} * 10 ** 18`
      )
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
      console.log("current chainId:", chainId);
      // set selected chainid to the one user is connected to
      const selectedChain = chains[chainId];
      setSelectedChainId(selectedChain ? chainId?.toString() : "Unsupported chain");
      if (!selectedChain) return message.error("Unsupported chain. Please switch to supported chain");
      setAccount(accounts[0]);
      setProvider(provider);
      message.success("Wallet connected");
    } else {
      console.warn("Please use web3 enabled browser");
      message.warning(
        "Please install Metamask or any other web3 enabled browser"
      );
    }
  };

  const handleDisconnectWallet = async () => {
    setAccount(null);
    setProvider(null);
    message.success("Wallet disconnected");
  };

  const handleSwitchChain = async (selectedChainId) => {
    console.log("selectedChainId", selectedChainId);
    const selectedChain = chains[selectedChainId];
    if (!selectedChain) return message.error("Unsupported chain selected");
    if (window?.ethereum) {
      window.ethereum
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: selectedChain.chainId }]
        })
        .then(() => message.info(`Switched to ${selectedChain.chainName}`))
        .catch((err) => {
          // This error code indicates that the chain has not been added to MetaMask.
          console.log("err on switch", err);
          if (err.code === 4902) {
            message.info(`Adding ${selectedChain.chainName} to metamask`);
            window.ethereum
              .request({
                method: "wallet_addEthereumChain",
                params: [selectedChain]
              })
              .then(() =>
                message.info(`Switched to ${selectedChain.chainName}`)
              )
              .catch((err) => {
                message.error(`Error adding ${selectedChain.chainName}`);
                console.error(err);
              });
          }
        });
      const provider = new Web3Provider(window.ethereum);
      const { chainId } = await provider.getNetwork();
      console.log("switched chainId:", chainId);
      setProvider(provider);
    } else {
      console.warn("Please use web3 enabled browser");
      message.warning(
        "Please install Metamask or any other web3 enabled browser"
      );
    }
  };

  const handleCompile = async () => {
    if (!generatedCode) return message.error("Please generate the code first");
    return message.info("Coming soon...");
    // const releases = await getCompilerVersions();
    // console.log("releases", releases);
    // try {
    //   const compiled = await solidityCompiler({
    //     version: "https://binaries.soliditylang.org/emscripten-wasm32/solc-emscripten-wasm32-v0.8.0+commit.c7dfd78e.js",
    //     contractBody: generatedCode,
    //     options: {
    //       optimizer: {
    //         enabled: false,
    //         runs: 200
    //       }
    //     },
    //   });
    //   console.log("compiled", compiled);
    //   if (compiled?.errors) {
    //     console.error("Error compiling code", compiled.errors);
    //     const errors = compiled?.errors?.map((err) => err.formattedMessage);
    //     return message.error(errors.join(", "));
    //   }
    //   setCompiledOutput({
    //     abi: compiled?.contracts?.Compiled_Contracts["MyToken"]?.abi,
    //     bytecode: compiled?.contracts?.Compiled_Contracts["MyToken"]?.evm?.bytecode?.object
    //   });
    //   message.success("Code compiled successfully");
    // } catch (err) {
    //   console.error("Error compiling code", err);
    //   message.error("Something went wrong while compiling the code");
    // }
  };

  const handleDeploy = async () => {
    if (!provider) return message.error("Please connect your wallet first");
    if (!compiledOutput?.abi?.length)
      return message.error("Please compile the code first");
    message.info("Since compiler is not ready, using precompiled artifacts to deploy for demo purpose");
    try {
      const contractFactory = new ContractFactory(
        compiledOutput.abi,
        compiledOutput.bytecode,
        provider.getSigner()
      );
      const contract = await contractFactory.deploy();
      setLogMessage(
        `Contract being Deployed.Transaction hash: ${contract.deployTransaction.hash}`
      );
      await contract.deployed();
      setLogMessage(`Contract deployed at address: ${contract.address}`);
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
    const { chainId } = await provider.getNetwork();
    const factoryAddress = superTokenFactoryAddresses[chainId];
    try {
      const tx = await contract.initialize(
        factoryAddress,
        wizardOptions?.tokenName,
        wizardOptions?.tokenSymbol
      );
      setLogMessage(`Contract being Initialized.Transaction hash: ${tx.hash}`);
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
            <Button type="secondary" onClick={handleDisconnectWallet}>
              {account.slice(0, 8) + "..." + account.slice(-5)}
            </Button>
          ) : (
            <Button type="secondary" onClick={handleConnectWallet}>
              Connect Wallet
            </Button>
          )}
          <Select
            name="chainId"
            id="chainId"
            value={selectedChainId}
            onChange={(value) => setSelectedChainId(value)}
            onSelect={(value) => handleSwitchChain(value)}
            style={{ width: 120 }}
          >
            {
              Object.keys(chains).map((chainId) => (
                <Select.Option key={chainId} value={chainId}>
                  {chains[chainId]?.chainName?.split(" ")[0]}
                </Select.Option>
              ))
            }
          </Select>
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
              name="premintReceiver"
              type="text"
              placeholder="Premint Receiver Address"
              value={wizardOptions?.premintReceiver}
              maxLength={42}
              minLength={42}
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
          {logMessage && (
            <div className="log-box">
              <p>{logMessage}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
