"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Layout,
  Radio
} from "antd";
import {
  CopyOutlined,
  WalletOutlined,
  WalletFilled,
  ThunderboltOutlined,
  LinkOutlined,
  SendOutlined
} from "@ant-design/icons";
import styles from "./page.module.css";
import "antd/dist/antd.css";

import {
  baseContract,
  supertokenBaseImport,
  supertokenBaseImportLocalPath,
  ownableImport,
  mintFunction,
  burnFunction,
  accessControlImport,
  roleDefBlock,
  mintFunctionWithRole,
  burnFunctionWithRole,
  minterRoleDef,
  burnerRoleDef,
  minterRoleSetup,
  burnerRoleSetup
} from "./utils/contractTemplates";

import { superTokenFactoryAddresses, chains, isAddressValid } from "./utils";

const { Content, Footer } = Layout;

const compilerUrl = process.env.NEXT_PUBLIC_COMPILER_URL || "api/compile";

export default function Home() {
  const [wizardOptions, setWizardOptions] = useState({
    premintQuantity: 1000,
    licenseIdentifier: "MIT",
    tokenName: "",
    tokenSymbol: "",
    accessControl: ""
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
      premintReceiver,
      premintQuantity,
      isMintable,
      isBurnable,
      accessControl
    } = wizardOptions;

    if (!premintQuantity)
      return message.error("Valid premint quantity is required");
    if (premintReceiver && !isAddressValid(premintReceiver))
      return message.error("Invalid premint receiver address");

    // Determine the mint and burn functions based on user acl choice
    const mintFunctionValue = accessControl === "roles"
      ? mintFunctionWithRole
      : mintFunction;

    const burnFunctionValue = accessControl === "roles"
      ? burnFunctionWithRole
      : burnFunction;

    const accessControlImportValue = accessControl === "roles"
      ? accessControlImport
      : ownableImport;

    const accessControlInheritanceValue = accessControl === "roles"
      ? ", AccessControl"
      : ", Ownable";

    const roleDefBlockValue =
      accessControl === "roles"
        ? roleDefBlock
          .replace("$MINTER_ROLE_DEF$", isMintable ? minterRoleDef : "")
          .replace("$BURNER_ROLE_DEF$", isBurnable ? burnerRoleDef : "")
          .replace("$MINTER_ROLE_SETUP$", isMintable ? minterRoleSetup : "")
          .replace("$BURNER_ROLE_SETUP$", isBurnable ? burnerRoleSetup : "")
        : "";
    const licenseIdentifierValue = licenseIdentifier || "UNLICENSED";
    const premintReceiverValue = premintReceiver || "msg.sender";
    const premintQuantityValue = `${premintQuantity} * 10 ** 18`;
    const contractCode = baseContract
      .replace("$LICENSE_IDENTIFIER$", licenseIdentifierValue)
      .replace("$SUPERTOKEN_BASE_IMPORT$", supertokenBaseImport)
      .replace("$ACCESS_CONTROL_IMPORT$", accessControl ? accessControlImportValue : "")
      .replace("$ACCESS_CONTROL_INHERITANCE$", accessControl ? accessControlInheritanceValue : "")
      .replace("$ROLE_DEF_BLOCK$", roleDefBlockValue)
      .replace("$PREMINT_RECEIVER$", premintReceiverValue)
      .replace("$PREMINT_QUANTITY$", premintQuantityValue)
      .replace("$MINT_FUNCTION$", isMintable ? mintFunctionValue : "")
      .replace("$BURN_FUNCTION$", isBurnable ? burnFunctionValue : "")
      .replace("$ONLY_OWNER$", accessControl === "ownable" ? "onlyOwner" : "")
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
      return message.error(
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
      setAccount(account1);
      if (!selectedChain) {
        setLoading({ connect: false });
        return message.error(
          "Unsupported chain. Please switch to supported chain"
        );
      }
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
      return message.error(
        "Please install Metamask or any other web3 enabled browser"
      );
    console.log("Selected chainId:", selectedChainId);
    const selectedChain = chains[selectedChainId];
    if (!selectedChain) return message.error("Unsupported chain selected");
    setLoading({ switch: true });
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: selectedChain.chainId }]
      });
      const provider = new Web3Provider(window.ethereum);
      const { chainId } = await provider.getNetwork();
      console.log("Switched chainId:", chainId);
      setProvider(provider);
      message.success(`Switched to ${selectedChain.chainName}`);
    } catch (err) {
      if (err.code === 4902) {
        // This error code indicates that the chain has not been added to MetaMask.
        message.info(`Adding ${selectedChain.chainName} to metamask`);
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [selectedChain]
          });
          const provider = new Web3Provider(window.ethereum);
          const { chainId } = await provider.getNetwork();
          console.log("switched chainId:", chainId);
          if (chainId != selectedChainId)
            return message.error(
              `Failed switching to ${selectedChain.chainName}`
            );
          setProvider(provider);
          message.success(`Switched to ${selectedChain.chainName}`);
        } catch (err) {
          console.error("Error adding chain:", err);
          message.error(`Failed to add ${selectedChain.chainName} to metamask`);
        }
      } else {
        message.error(`Failed switching to ${selectedChain.chainName}`);
      }
    } finally {
      const provider = new Web3Provider(window.ethereum);
      const { chainId: currentChainId } = await provider.getNetwork();
      setSelectedChainId(
        chains[currentChainId]
          ? currentChainId?.toString()
          : "⚠ Unsupported chain"
      );
      setLoading({ switch: false });
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
      const data = await response.json();
      if (data.code && data.message) {
        setLoading({ compile: false });
        return message.error(data.message);
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
    if (!account || !provider)
      return message.error("Please connect your wallet first");
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
    if (!account || !provider)
      return message.error("Please connect your wallet first");
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

  useEffect(() => {
    handleGenerateCode();
  }, [
    wizardOptions.premintQuantity,
    wizardOptions.premintReceiver,
    wizardOptions.isMintable,
    wizardOptions.isBurnable,
    wizardOptions.isOwnable,
    wizardOptions.licenseIdentifier,
    wizardOptions.accessControl
  ]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <div className={styles.navbar}>
        <div className={styles.logo}>
          <Image
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
            <>
              <Button
                icon={<WalletOutlined />}
                type="secondary"
                onClick={handleDisconnectWallet}
                className={styles.actionsButton}
              >
                {account.slice(0, 8) + "..." + account.slice(-5)}
              </Button>
              <Select
                name="chainId"
                id="chainId"
                value={selectedChainId}
                onChange={(value) => setSelectedChainId(value)}
                onSelect={(value) => handleSwitchChain(value)}
                style={{ width: 140 }}
                className={styles.actionsButton}
                loading={loading.switch}
              >
                {Object.keys(chains).map((chainId) => (
                  <Select.Option key={chainId} value={chainId}>
                    {chains[chainId]?.chainName?.split(" ")[0]}
                  </Select.Option>
                ))}
              </Select>
            </>
          ) : (
            <Button
              icon={<WalletFilled />}
              type="secondary"
              onClick={handleConnectWallet}
              className={styles.actionsButton}
              loading={loading.connect}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
      <Content style={{ minHeight: 300 }}>
        <div className={styles.container}>
          <div className={styles.options}>
            <div className={styles.section}>
              <h3>Token Options</h3>
              <label htmlFor="tokenName">Name *</label>
              <Input
                id="tokenName"
                name="tokenName"
                placeholder="Name"
                value={wizardOptions?.tokenName}
                onChange={handleWizardOptionsChange}
                maxLength={32}
              />
              <label htmlFor="tokenSymbol">Symbol *</label>
              <Input
                id="tokenSymbol"
                name="tokenSymbol"
                placeholder="Symbol"
                value={wizardOptions?.tokenSymbol}
                onChange={handleWizardOptionsChange}
                maxLength={15}
              />
              <label htmlFor="premintQuantity">Premint Quantity *</label>
              <Input
                id="premintQuantity"
                name="premintQuantity"
                type="number"
                placeholder="Premint Quantity"
                value={wizardOptions?.premintQuantity}
                onChange={handleWizardOptionsChange}
                status={!wizardOptions?.premintQuantity ? "error" : ""}
                min={1}
                max={1000000000000}
              />
              <label htmlFor="premintReceiver">Premint Receiver</label>
              <Input
                id="premintReceiver"
                name="premintReceiver"
                type="text"
                placeholder="Premint Receiver Address"
                value={wizardOptions?.premintReceiver}
                maxLength={42}
                allowClear
                status={
                  wizardOptions?.premintReceiver &&
                    !isAddressValid(wizardOptions?.premintReceiver)
                    ? "error"
                    : ""
                }
                onChange={handleWizardOptionsChange}
              />
            </div>
            <div className={styles.section}>
              <h3>Features</h3>
              <Space direction="vertical">
                <Checkbox
                  id="isMintable"
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
                  id="isBurnable"
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
              </Space>
            </div>
            <div className={styles.section}>
              <h3>Access Control</h3>
              <Radio.Group
                id="accessControl"
                name="accessControl"
                value={wizardOptions?.accessControl}
                buttonStyle="solid"
                size="small"
                options={
                  [
                    { label: "None", value: "" },
                    { label: "Ownable", value: "ownable" },
                    { label: "Roles", value: "roles" }
                  ]
                }
                onChange={(e) =>
                  setWizardOptions({
                    ...wizardOptions,
                    accessControl: e.target.value
                  })
                }
              />
            </div>
            <div className={styles.section}>
              <h3>Miscellaneous</h3>
              <label htmlFor="licenseIdentifier">License Identifier</label>
              <Input
                id="licenseIdentifier"
                name="licenseIdentifier"
                placeholder="License Identifier"
                value={wizardOptions?.licenseIdentifier}
                onChange={handleWizardOptionsChange}
                maxLength={32}
              />
            </div>
          </div>
          <div className={styles.code}>
            <div className={styles.codeHeader}>
              <Button
                icon={<CopyOutlined />}
                onClick={handleCopyCode}
                disabled={!generatedCode}
                title="Copy Code"
              />
              <Link
                href={`https://remix.ethereum.org/?#code=${btoa(
                  generatedCode
                )}`}
                target="_blank"
              >
                <Button
                  disabled={!generatedCode}
                  title="Open in Remix"
                  icon={
                    <Image
                      src="/remix_logo.svg"
                      alt="remix-logo"
                      className={styles.remixLogo}
                      width={15}
                      height={15}
                    />
                  }
                />
              </Link>
            </div>
            <Input.TextArea
              id="generatedCode"
              value={generatedCode}
              style={{
                fontFamily: "monospace",
                fontSize: "14px",
                backgroundColor: "#1f2430",
                color: "#fff",
                width: "100%",
                height: "100%",
                whiteSpace: "pre"
              }}
              readOnly
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              rows={25}
              cols={100}
            />
            <div className={styles.codeButtons}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleCompile}
                disabled={!generatedCode || loading.compile}
                loading={loading.compile}
              >
                Compile
              </Button>

              <Button
                icon={<CopyOutlined />}
                onClick={handleCopyArtifacts}
                disabled={!compiledOutput?.bytecode}
                title="Copy Artifacts"
              >
                Artifacts
              </Button>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={handleDeploy}
                disabled={!compiledOutput?.bytecode || loading.deploy}
                loading={loading.deploy}
              >
                Deploy
              </Button>
              <Button
                type="primary"
                icon={<LinkOutlined />}
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
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <a
          href="https://github.com/Salmandabbakuti"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made with ❤️ by Salman Dabbakuti. Powered by Nextjs & Ant Design
        </a>
      </Footer>
    </Layout>
  );
}
