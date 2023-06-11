"use client";
import React, { useState } from "react";
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

const SuperTokenWizard = () => {
  const [wizardOptions, setWizardOptions] = useState({
    premintQuantity: 1000,
    licenseIdentifier: "MIT"
  });
  const [generatedCode, setGeneratedCode] = useState("");
  const [compiledOutput, setCompiledOutput] = useState(null);
  const [contract, setContract] = useState(null);

  const handleWizardOptionsChange = (e) => {
    setWizardOptions({ ...wizardOptions, [e.target.name]: e.target.value });
  };

  const handleGenerateCode = () => {
    const contractCode = mainContract
      .replace("$LICENSE_IDENTIFIER$", wizardOptions.licenseIdentifier)
      .replace("$OWNABLE_IMPORT$", wizardOptions.isOwnable ? ownableImport : "")
      .replace("$OWNABLE_INHERITANCE$", wizardOptions.isOwnable ? ", Ownable" : "")
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

  const handleOpenInRemix = () => {
    // Open the generated code in Remix IDE
    // You can redirect the user to the Remix IDE URL with the generated code as a parameter
  };

  const handleConnectWallet = () => {
    // Handle the logic to connect the user's wallet
    // You can use web3.js or ethers.js to connect the wallet
  };

  const handleSwitchNetwork = () => {
    // Handle the logic to switch the Ethereum network
    // You can use web3.js or ethers.js to switch the network
  };

  const handleCompile = () => {
    // Handle the logic to compile the generated code
    // You can use a Solidity compiler library, such as solc, to compile the code
  };

  const handleDeploy = () => {
    // Handle the logic to deploy the compiled contract
    // You can use ethers.js or other libraries to deploy the contract
  };

  const handleInitialize = () => {
    // Handle the logic to initialize protocol
    // You can use ethers.js or other libraries to interact with contract
  };

  return (
    <>
      <div className="navbar">
        <div className="logo">
          <img
            src="https://global-uploads.webflow.com/63bbb06bcc33535ccdd1b9ef/63bbb06bcc33536b3fd1bc6e_Diamonds%20Symbol%20Grey.svg"
            alt="Logo"
            className="logo-image"
          />
          <Text strong className="logo-text">
            SuperToken Wizard
          </Text>
        </div>
        <div className="navbar-buttons">
          <Button
            type="text"
            // icon={<WalletOutlined />}
            onClick={handleConnectWallet}
          >
            Connect Wallet
          </Button>
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
              onChange={(e) => setWizardOptions({ ...wizardOptions, isMintable: e.target.checked })}
            >
              Mintable
            </Checkbox>

            <Checkbox
              checked={wizardOptions?.isOwnable}
              onChange={(e) => setWizardOptions({ ...wizardOptions, isOwnable: e.target.checked })}
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
              <Link href={
                `https://remix.ethereum.org/?#code=${btoa(generatedCode)}`
              } target="_blank">
                <Button>Open in Remix</Button>
              </Link>
              <Button type="primary" onClick={handleCompile}>Compile</Button>
              <Button type="primary" onClick={handleDeploy}>
                Deploy
              </Button>
              {
                contract && (
                  <Button type="primary" onClick={handleInitialize}>
                    Initialize
                  </Button>
                )
              }
            </div>
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
