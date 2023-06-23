"use client";
import { useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { ContractFactory } from "@ethersproject/contracts";
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

import {
  superTokenFactoryAddresses,
  chains,
  isAddressValid
} from "./utils";

const compilerUrl = process.env.NEXT_PUBLIC_COMPILER_URL || "api/compile";

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
    setCompiledOutput(null);
    setContract(null);
    const {
      licenseIdentifier,
      isOwnable,
      premintReceiver,
      premintQuantity,
      isMintable,
      isBurnable,
    } = wizardOptions;

    if (!premintQuantity) return message.error("Valid premint quantity is required");
    if (premintReceiver && !isAddressValid(premintReceiver)) return message.error("Invalid premint receiver address");

    const premintReceiverValue = premintReceiver || "msg.sender";
    const premintQuantityValue = `${premintQuantity} * 10 ** 18`;
    const contractCode = mainContract
      .replace("$LICENSE_IDENTIFIER$", licenseIdentifier)
      .replace("$SUPERTOKEN_BASE_IMPORT$", supertokenBaseImport)
      .replace("$OWNABLE_IMPORT$", isOwnable ? ownableImport : "")
      .replace("$OWNABLE_INHERITANCE$", isOwnable ? ", Ownable" : "")
      .replace("$PREMINT_RECEIVER$", premintReceiverValue)
      .replace("$PREMINT_QUANTITY$", premintQuantityValue)
      .replace("$MINT_FUNCTION$", isMintable ? mintFunction : "")
      .replace("$BURN_FUNCTION$", isBurnable ? burnFunction : "")
      .replace("$ONLY_OWNER$", isOwnable ? "onlyOwner" : "")
      .replace(/(\n\s*){2,}/gm, "\n$1");

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
      const response = await fetch(compilerUrl, {
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
          <div className={styles.section}>
            <Button type="primary" onClick={handleGenerateCode}>
              Generate
            </Button>
          </div>
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
          {logMessage && (
            <div className={styles.logBox}>
              <p>{logMessage}</p>
            </div>
          )}
        </div>
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
