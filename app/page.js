"use client";
import React, { useState } from "react";
import { Input, Checkbox, Button, Typography, Layout } from "antd";
import "antd/dist/antd.css";

import {
  mainContract,
  ownableImport,
  mintFunction
} from "./utils/contractTemplates";

const { TextArea } = Input;
const { Text } = Typography;
const { Header, Footer, Sider, Content } = Layout;

const SuperTokenWizard = () => {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [premintQuantity, setPremintQuantity] = useState(1000);
  const [licenseIdentifier, setLicenseIdentifier] = useState("MIT");
  const [isMintable, setIsMintable] = useState(false);
  const [isOwnable, setIsOwnable] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const handleGenerateCode = () => {
    const contractCode = mainContract
      .replace("$LICENSE_IDENTIFIER$", licenseIdentifier)
      .replace("$OWNABLE_IMPORT$", isOwnable ? ownableImport : "")
      .replace("$OWNABLE_INHERITANCE$", isOwnable ? ", Ownable" : "")
      .replace("$PREMINT_QUANTITY$", premintQuantity)
      .replace("$MINT_FUNCTION$", isMintable ? mintFunction : "")
      .replace("$ONLY_OWNER$", isOwnable ? "onlyOwner" : "");
    setGeneratedCode(contractCode);
  };

  const handleCopyCode = () => {
    // Copy the generated code to the clipboard
    // You can use the Clipboard API or a third-party library here
  };

  const handleOpenRemix = () => {
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
          <h2>Token Options</h2>
          <Input
            placeholder="Token Name"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
          />

          <Input
            placeholder="Token Symbol"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Premint Quantity"
            value={premintQuantity}
            onChange={(e) => setPremintQuantity(e.target.value)}
          />

          <Input
            placeholder="License Identifier"
            value={licenseIdentifier}
            onChange={(e) => setLicenseIdentifier(e.target.value)}
          />

          <Checkbox
            checked={isMintable}
            onChange={(e) => setIsMintable(e.target.checked)}
          >
            Mintable
          </Checkbox>

          <Checkbox
            checked={isOwnable}
            onChange={(e) => setIsOwnable(e.target.checked)}
          >
            Ownable
          </Checkbox>

          <Button type="primary" onClick={handleGenerateCode}>
            Generate Code
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
            <Button onClick={handleOpenRemix}>Open in Remix</Button>
            <Button onClick={handleCompile}>Compile</Button>
            <Button type="primary" onClick={handleDeploy}>
              Deploy
            </Button>
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
