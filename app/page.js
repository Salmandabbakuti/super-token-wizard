"use client";
import React, { useState } from "react";
import contractTemplate from "./utils/contractTemplate";

const SuperTokenWizard = () => {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [premintAmount, setPremintAmount] = useState("");
  const [isMintable, setIsMintable] = useState(false);
  const [isOwnable, setIsOwnable] = useState(false);
  const [network, setNetwork] = useState("mainnet");
  const [generatedCode, setGeneratedCode] = useState("");
  const [deployedAddress, setDeployedAddress] = useState("");

  const generateContractCode = () => {
    const code = contractTemplate
      .replace(
        "$OWNABLE_IMPORT$",
        isOwnable
          ? "import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';"
          : ""
      )
      .replace("$OWNABLE_INHERITANCE$", isOwnable ? ", Ownable" : "")
      .replace("$PREMINT_AMOUNT$", premintAmount)
      .replace("$ONLY_OWNER$", isOwnable ? "onlyOwner" : "");
    setGeneratedCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    // Show a success message or notification to the user
  };

  const handleDeploy = async () => {
    // Connect to the selected network using web3.js or ethers.js
    // Deploy the contract using the generated code and the user's connected wallet
    // Set the deployed address after a successful deployment
    // Display an error message if the deployment fails
    try {
      // Deployment logic goes here
      const deployedAddress = "0x123abc";
      setDeployedAddress(deployedAddress);
    } catch (error) {
      console.error("Contract deployment failed:", error);
      // Display an error message to the user
    }
  };

  return (
    <div>
      <h1>Super Token Wizard</h1>

      <label>
        Token Name:
        <input
          type="text"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
        />
      </label>

      <label>
        Token Symbol:
        <input
          type="text"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
        />
      </label>

      <label>
        Premint Amount:
        <input
          type="number"
          value={premintAmount}
          onChange={(e) => setPremintAmount(e.target.value)}
        />
      </label>

      <label>
        Mintable:
        <input
          type="checkbox"
          checked={isMintable}
          onChange={(e) => setIsMintable(e.target.checked)}
        />
      </label>

      {isMintable && (
        <label>
          Ownable:
          <input
            type="checkbox"
            checked={isOwnable}
            onChange={(e) => setIsOwnable(e.target.checked)}
          />
        </label>
      )}

      <button onClick={generateContractCode}>Generate Contract Code</button>

      {generatedCode && (
        <div>
          <h2>Generated Contract Code</h2>
          <textarea
            value={generatedCode}
            rows={40}
            cols={200}
            wrap="hard"
            readOnly />
          <button onClick={copyToClipboard}>Copy to Remix</button>
        </div>
      )}

      <label>
        Select Network:
        <select value={network} onChange={(e) => setNetwork(e.target.value)}>
          <option value="mainnet">Mainnet</option>
          <option value="ropsten">Ropsten</option>
          <option value="rinkeby">Rinkeby</option>
          {/* Add more network options as needed */}
        </select>
      </label>

      <button onClick={handleDeploy}>Deploy</button>

      {deployedAddress && (
        <div>
          <h2>Deployed Address</h2>
          <p>{deployedAddress}</p>
        </div>
      )}
    </div>
  );
};

export default SuperTokenWizard;
