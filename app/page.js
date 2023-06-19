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
  Select,
  Space,
  Layout
} from "antd";
import Link from "next/link";
import styles from "./page.module.css";
import "antd/dist/antd.css";

import {
  mainContract,
  supertokenBaseImport,
  supertokenBaseImportLocalPath,
  ownableImport,
  mintFunction,
  burnFunction
} from "./utils/contractTemplates";

const superTokenFactoryAddresses = {
  80001: "0xb798553db6eb3d3c56912378409370145e97324b",
  137: "0x2C90719f25B10Fc5646c82DA3240C76Fa5BcCF34",
  5: "0x94f26B4c8AD12B18c12f38E878618f7664bdcCE2",
  1: "0x0422689cc4087b6B7280e0a7e7F655200ec86Ae1"
};

const chains = {
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

export default function Home() {
  const [wizardOptions, setWizardOptions] = useState({
    premintQuantity: 1000,
    licenseIdentifier: "MIT",
    tokenName: "",
    tokenSymbol: ""
  });
  const [generatedCode, setGeneratedCode] = useState("");
  const [compiledOutput, setCompiledOutput] = useState(null);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [logMessage, setLogMessage] = useState("");
  const [selectedChainId, setSelectedChainId] = useState("80001");
  const [loading, setLoading] = useState({
    connect: false,
    switch: false,
    compile: false,
    deploy: false,
    initialize: false
  });

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
      .replace(
        "$PREMINT_RECEIVER$",
        wizardOptions?.premintReceiver || "msg.sender"
      )
      .replace(
        "$PREMINT_QUANTITY$",
        `${wizardOptions?.premintQuantity} * 10 ** 18`
      )
      .replace("$MINT_FUNCTION$", wizardOptions.isMintable ? mintFunction : "")
      .replace("$BURN_FUNCTION$", wizardOptions.isBurnable ? burnFunction : "")
      .replace("$ONLY_OWNER$", wizardOptions.isOwnable ? "onlyOwner" : "");
    setGeneratedCode(contractCode);
  };

  const handleCopyCode = () => {
    if (!generatedCode) return message.warning("No code to copy");
    navigator.clipboard.writeText(generatedCode);
    message.success("Code copied to clipboard");
  };

  const handleConnectWallet = async () => {
    if (!window?.ethereum)
      return message.warning(
        "Please install Metamask or any other web3 enabled browser"
      );
    setLoading({ connect: true });
    try {
      const [account1] = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      console.log("Using account: ", account1);
      const provider = new Web3Provider(window.ethereum);
      const { chainId } = await provider.getNetwork();
      console.log("current chainId:", chainId);
      // set selected chainid to the one user is connected to
      const selectedChain = chains[chainId];
      setSelectedChainId(
        selectedChain ? chainId?.toString() : "⚠ Unsupported chain"
      );
      if (!selectedChain)
        return message.error(
          "Unsupported chain. Please switch to supported chain"
        );
      setAccount(account1);
      setProvider(provider);
      message.success("Wallet connected");
      setLoading({ connect: false });
    } catch (err) {
      setLoading({ connect: false });
      console.log("err connecting wallet", err);
      message.error("Failed to connect wallet!");
    }
  };

  const handleDisconnectWallet = async () => {
    setAccount(null);
    setProvider(null);
    message.success("Wallet disconnected");
  };

  const handleSwitchChain = async (selectedChainId) => {
    if (!window?.ethereum)
      return message.warning(
        "Please install Metamask or any other web3 enabled browser"
      );
    console.log("selectedChainId", selectedChainId);
    const selectedChain = chains[selectedChainId];
    if (!selectedChain) return message.error("Unsupported chain selected");
    setLoading({ switch: true });
    try {
      await window.ethereum
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: selectedChain.chainId }]
        })
        .then(() => message.success(`Switched to ${selectedChain.chainName}`))
        .catch(async (err) => {
          console.log("err on switch", err);
          // This error code indicates that the chain has not been added to MetaMask.
          if (err.code === 4902) {
            message.info(`Adding ${selectedChain.chainName} to metamask`);
            await window.ethereum
              .request({
                method: "wallet_addEthereumChain",
                params: [selectedChain]
              })
              .then(() =>
                message.info(`Added ${selectedChain.chainName} to metamask`)
              )
              .catch((err) => {
                message.error(
                  `Failed to add ${selectedChain.chainName} to metamask`
                );
                console.error(err);
              });
          } else {
            message.error(`Failed switching to ${selectedChain.chainName}`);
          }
        });
      const provider = new Web3Provider(window.ethereum);
      const { chainId } = await provider.getNetwork();
      console.log("switched chainId:", chainId);
      setProvider(provider);
      setLoading({ switch: false });
    } catch (err) {
      setLoading({ switch: false });
      console.log("err switching chain:", err);
      message.error("Failed to switch chain!");
    }
  };

  const handleCompile = async () => {
    if (!generatedCode) return message.error("Please generate the code first");
    try {
      setLoading({ compile: true });
      // using local import path for compilation
      const codeForCompilation = generatedCode.replace(
        supertokenBaseImport,
        supertokenBaseImportLocalPath
      );
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: codeForCompilation })
      });

      if (!response.ok) {
        setLoading({ compile: false });
        return message.error("Something went wrong while compiling the code");
      }
      const data = await response.json();
      if (data.code && data.message) {
        setLoading({ compile: false });
        return message.error("Something went wrong while compiling the code");
      }
      setCompiledOutput(data);
      setLoading({ compile: false });
      message.success("Code compiled successfully");
    } catch (err) {
      setLoading({ compile: false });
      console.error("Error compiling code", err);
      message.error("Something went wrong while compiling the code");
    }
  };

  const handleCopyArtifacts = () => {
    if (!compiledOutput?.abi?.length || !compiledOutput?.bytecode)
      return message.error("Please compile the code first");
    navigator.clipboard.writeText(JSON.stringify(compiledOutput));
    message.success("Contract artifacts copied to clipboard");
  };

  const handleDeploy = async () => {
    if (!provider) return message.error("Please connect your wallet first");
    if (!compiledOutput?.abi?.length || !compiledOutput?.bytecode)
      return message.error("Please compile the code first");
    setLoading({ deploy: true });
    try {
      const contractFactory = new ContractFactory(
        compiledOutput.abi,
        compiledOutput.bytecode,
        provider.getSigner()
      );
      const contract = await contractFactory.deploy();
      setLogMessage(
        `Contract being deployed. Transaction hash: ${contract.deployTransaction.hash}`
      );
      await contract.deployed();
      setLogMessage(`Contract deployed at address: ${contract.address}`);
      setContract(contract);
      message.success("Contract deployed successfully");
      setLoading({ deploy: false });
    } catch (err) {
      setLoading({ deploy: false });
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
    setLoading({ initialize: true });
    try {
      const { chainId } = await provider.getNetwork();
      const factoryAddress = superTokenFactoryAddresses[chainId];
      const tx = await contract.initialize(
        factoryAddress,
        wizardOptions?.tokenName,
        wizardOptions?.tokenSymbol
      );
      setLogMessage(`Contract being initialized. Transaction hash: ${tx.hash}`);
      await tx.wait();
      message.success("Contract initialized successfully");
      setContract(null);
      setLogMessage(`Contract initialized successfully`);
      setLoading({ initialize: false });
    } catch (err) {
      setLoading({ initialize: false });
      console.error("Error initializing contract", err);
      message.error("Something went wrong while initializing the contract");
    }
  };

  return (
    <>
      <div className={styles.navbar}>
        <div className={styles.logo}>
          <img
            src="/wizard_logo.svg"
            alt="Logo"
            className={styles.logoImage}
            width={40}
            height={40}
          />
          <Typography.Text strong className={styles.logoText}>
            SuperToken Wizard
          </Typography.Text>
        </div>
        <div className={styles.navbarButtons}>
          {account ? (
            <Button
              type="secondary"
              onClick={handleDisconnectWallet}
              className={styles.actionsButton}
            >
              {account.slice(0, 8) + "..." + account.slice(-5)}
            </Button>
          ) : (
            <Button
              type="secondary"
              onClick={handleConnectWallet}
              className={styles.actionsButton}
              loading={loading.connect}
            >
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
            className={styles.actionsButton}
            loading={loading.switch}
          >
            {Object.keys(chains).map((chainId) => (
              <Select.Option key={chainId} value={chainId}>
                {chains[chainId]?.chainName?.split(" ")[0]}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.options}>
          <div className={styles.section}>
            <h3>Token Options</h3>
            <label htmlFor="tokenName">Name</label>
            <Input
              id="tokenName"
              name="tokenName"
              placeholder="Name"
              value={wizardOptions?.tokenName}
              onChange={handleWizardOptionsChange}
            />
            <label htmlFor="tokenSymbol">Symbol</label>
            <Input
              id="tokenSymbol"
              name="tokenSymbol"
              placeholder="Symbol"
              value={wizardOptions?.tokenSymbol}
              onChange={handleWizardOptionsChange}
            />
            <label htmlFor="premintQuantity">Premint Quantity</label>
            <Input
              id="premintQuantity"
              name="premintQuantity"
              type="number"
              placeholder="Premint Quantity"
              value={wizardOptions?.premintQuantity}
              onChange={handleWizardOptionsChange}
            />
            <label htmlFor="premintReceiver">Premint Receiver</label>
            <Input
              id="premintReceiver"
              name="premintReceiver"
              type="text"
              placeholder="Premint Receiver Address"
              value={wizardOptions?.premintReceiver}
              maxLength={42}
              minLength={42}
              onChange={handleWizardOptionsChange}
            />
          </div>
          <div className={styles.section}>
            <h3>Features</h3>
            <Space direction="vertical">
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
                checked={wizardOptions?.isBurnable}
                onChange={(e) =>
                  setWizardOptions({
                    ...wizardOptions,
                    isBurnable: e.target.checked
                  })
                }
              >
                Burnable
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
            </Space>
          </div>
          <div className={styles.section}>
            <h3>Miscellaneous</h3>
            <label htmlFor="licenseIdentifier">License Identifier</label>
            <Input
              name="licenseIdentifier"
              placeholder="License Identifier"
              value={wizardOptions?.licenseIdentifier}
              onChange={handleWizardOptionsChange}
            />
          </div>
        </div>
        <div className={styles.actions}>
          <Button type="primary" onClick={handleGenerateCode}>
            Generate
          </Button>
        </div>
        <div className={styles.code}>
          <Input.TextArea
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
          <div className={styles.codeButtons}>
            <Button onClick={handleCopyCode} disabled={!generatedCode}>
              Copy Code
            </Button>
            <Link
              href={`https://remix.ethereum.org/?#code=${btoa(generatedCode)}`}
              target="_blank"
            >
              <Button disabled={!generatedCode}>Open in Remix</Button>
            </Link>
            <Button
              type="primary"
              onClick={handleCompile}
              disabled={!generatedCode || loading.compile}
              loading={loading.compile}
            >
              Compile
            </Button>

            <Button
              type="primary"
              onClick={handleCopyArtifacts}
              disabled={!compiledOutput?.bytecode}
            >
              Copy Artifacts
            </Button>
            <Button
              type="primary"
              onClick={handleDeploy}
              disabled={!compiledOutput?.bytecode || loading.deploy}
              loading={loading.deploy}
            >
              Deploy
            </Button>
            <Button
              type="primary"
              disabled={!contract || loading.initialize}
              onClick={handleInitialize}
              loading={loading.initialize}
            >
              Initialize
            </Button>
          </div>
        </div>
        {logMessage && (
          <div className={styles.logBox}>
            <p>{logMessage}</p>
          </div>
        )}
      </div>
      <Layout.Footer style={{ textAlign: "center" }}>
        <a
          href="https://github.com/Salmandabbakuti"
          target="_blank"
          rel="noopener noreferrer"
        >
          © {new Date().getFullYear()} Salman Dabbakuti. Powered by Nextjs
        </a>
      </Layout.Footer>
    </>
  );
}
