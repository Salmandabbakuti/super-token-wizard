"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ContractFactory } from "@ethersproject/contracts";
import { useAddress, useSigner } from "@thirdweb-dev/react";
import { Input, Checkbox, Button, message, Space, Radio, Tour } from "antd";
import {
  CopyOutlined,
  ThunderboltOutlined,
  LinkOutlined,
  SendOutlined
} from "@ant-design/icons";
import styles from "./page.module.css";
import "antd/dist/reset.css";

import {
  supertokenBaseImport,
  supertokenBaseImportLocalPath
} from "./utils/contractTemplates";

import {
  superTokenFactoryAddresses,
  isAddressValid,
  generateCode
} from "./utils";

const compilerEndpoint =
  process.env.NEXT_PUBLIC_COMPILER_ENDPOINT || "api/compile";

export default function Home() {
  const [wizardOptions, setWizardOptions] = useState({
    premintQuantity: 1000,
    maxSupply: 1000000,
    licenseIdentifier: "MIT",
    tokenName: "",
    tokenSymbol: "",
    accessControl: ""
  });
  const [generatedCode, setGeneratedCode] = useState("");
  const [compiledOutput, setCompiledOutput] = useState(null);
  const [contract, setContract] = useState(null);
  const [logMessage, setLogMessage] = useState("");
  const [loading, setLoading] = useState({
    connect: false,
    switch: false,
    compile: false,
    deploy: false,
    initialize: false
  });
  const [showTour, setShowTour] = useState(false);

  const codeHeaderRef = useRef(null);
  const tokenOptionsRef = useRef(null);
  const actionsRef = useRef(null);

  const account = useAddress();
  const signer = useSigner();

  const handleWizardOptionsChange = (e) => {
    setWizardOptions({ ...wizardOptions, [e.target.name]: e.target.value });
  };

  const handleGenerateCode = () => {
    setCompiledOutput(null);
    setContract(null);
    const { premintReceiver, premintQuantity, maxSupply, isCappedSupply } =
      wizardOptions;

    if (!premintQuantity)
      return message.error("Valid premint quantity is required");
    if (premintReceiver && !isAddressValid(premintReceiver))
      return message.error("Invalid premint receiver address");
    if (isCappedSupply && !maxSupply)
      return message.error("Max supply is required");

    const generatedCode = generateCode(wizardOptions);
    setGeneratedCode(generatedCode);
  };

  const handleCopyCode = () => {
    if (!generatedCode) return message.warning("No code to copy");
    navigator.clipboard.writeText(generatedCode);
    message.success("Code copied to clipboard");
  };

  const handleCompile = async () => {
    if (!generatedCode) return message.error("Please generate the code first");
    setLoading({ compile: true });
    try {
      // using local import path for compilation
      const codeForCompilation = generatedCode.replace(
        supertokenBaseImport,
        supertokenBaseImportLocalPath
      );
      const response = await fetch(compilerEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: codeForCompilation })
      });
      const data = await response.json();
      if (data.code && data.message) return message.error(data.message);
      setCompiledOutput(data);
      message.success("Code compiled successfully");
    } catch (err) {
      console.error("Error compiling code", err);
      message.error("Something went wrong while compiling the code");
    } finally {
      setLoading({ compile: false });
    }
  };

  const handleCopyArtifacts = () => {
    if (!compiledOutput?.abi?.length || !compiledOutput?.bytecode)
      return message.error("Please compile the code first");
    navigator.clipboard.writeText(JSON.stringify(compiledOutput));
    message.success("Contract artifacts copied to clipboard");
  };

  const handleDeploy = async () => {
    if (!account || !signer)
      return message.error("Please connect your wallet first");
    if (!compiledOutput?.abi?.length || !compiledOutput?.bytecode)
      return message.error("Please compile the code first");
    setLoading({ deploy: true });
    try {
      const chainId = await signer.getChainId();
      const factoryAddress = superTokenFactoryAddresses[chainId];
      if (!factoryAddress)
        return message.error(
          "Unsupported chain. Please switch to supported chain"
        );
      const contractFactory = new ContractFactory(
        compiledOutput.abi,
        compiledOutput.bytecode,
        signer
      );
      const contract = await contractFactory.deploy();
      setLogMessage(
        `Contract being deployed. Transaction hash: ${contract.deployTransaction.hash}`
      );
      await contract.deployed();
      setLogMessage(`Contract deployed at address: ${contract.address}`);
      setContract(contract);
      message.success("Contract deployed successfully");
    } catch (err) {
      console.error("Error deploying contract", err);
      message.error("Something went wrong while deploying the contract");
    } finally {
      setLoading({ deploy: false });
    }
  };

  const handleInitialize = async () => {
    if (!account || !signer)
      return message.error("Please connect your wallet first");
    if (!contract) return message.error("Please deploy the contract first");
    if (
      /^\s*$/.test(wizardOptions?.tokenName) ||
      /^\s*$/.test(wizardOptions?.tokenSymbol)
    )
      return message.error("Please set token name and symbol");
    setLoading({ initialize: true });
    try {
      const chainId = await signer.getChainId();
      const factoryAddress = superTokenFactoryAddresses[chainId];
      if (!factoryAddress)
        return message.error(
          "Unsupported chain. Please switch to supported chain"
        );
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
    } catch (err) {
      console.error("Error initializing contract", err);
      message.error("Something went wrong while initializing the contract");
    } finally {
      setLoading({ initialize: false });
    }
  };

  useEffect(() => {
    handleGenerateCode();
  }, [
    wizardOptions.premintQuantity,
    wizardOptions.maxSupply,
    wizardOptions.premintReceiver,
    wizardOptions.isMintable,
    wizardOptions.isBurnable,
    wizardOptions.isCappedSupply,
    wizardOptions.licenseIdentifier,
    wizardOptions.accessControl
  ]);

  useEffect(() => {
    const productTour = localStorage.getItem("product_tour") === null;
    if (productTour) {
      setShowTour(true);
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.options} ref={tokenOptionsRef}>
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
          {wizardOptions?.isCappedSupply && (
            <>
              <label htmlFor="maxSupply">Max Supply *</label>
              <Input
                id="maxSupply"
                name="maxSupply"
                type="number"
                placeholder="Max Supply"
                value={wizardOptions?.maxSupply}
                onChange={handleWizardOptionsChange}
                status={!wizardOptions?.maxSupply ? "error" : ""}
                min={1}
                max={1000000000000}
              />
            </>
          )}
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
            <Checkbox
              id="isCappedSupply"
              checked={wizardOptions?.isCappedSupply}
              onChange={(e) =>
                setWizardOptions({
                  ...wizardOptions,
                  isCappedSupply: e.target.checked
                })
              }
            >
              Capped Supply
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
            options={[
              { label: "None", value: "" },
              { label: "Ownable", value: "ownable" },
              { label: "Roles", value: "roles" }
            ]}
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
        <div className={styles.codeHeader} ref={codeHeaderRef}>
          <Button
            icon={<CopyOutlined />}
            onClick={handleCopyCode}
            disabled={!generatedCode}
            title="Copy Code"
          />
          <Link
            href={`https://remix.ethereum.org/?#code=${btoa(generatedCode)}`}
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
            fontSize: "13px",
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
          rows={30}
          cols={90}
        />
        <div className={styles.codeButtons} ref={actionsRef}>
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
        {showTour && (
          <Tour
            placement="top"
            open={showTour}
            onClose={() => {
              setShowTour(false);
              localStorage.setItem("product_tour", "done");
            }}
            steps={[
              {
                title: "Welcome to SuperToken Wizard",
                description:
                  "A simple and ligthweight wizard for Super Tokens. Quickly generate a customized Super Token contract based on your specific needs.",
                target: () => null
              },
              {
                title: "Customizable Contract Options",
                description:
                  "Customize your Super Token contract options. Enable or disable features, set token name, symbol, premint quantity, max supply, access control and more.",
                placement: "right",
                target: () => tokenOptionsRef.current
              },
              {
                title: "Copy or Open in Remix",
                description:
                  "Copy the generated code or open directly in Remix.",
                placement: "bottom",
                target: () => codeHeaderRef.current
              },
              {
                title: "Actions",
                description:
                  "Compile, Copy Artifacts, deploy and initialize the contract.",
                placement: "top",
                target: () => actionsRef.current
              }
            ]}
          />
        )}
      </div>
    </div>
  );
}
