const { exec } = require('child_process');
import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET(req) {
  try {
    await execPromise("npx hardhat compile");

    // Read the contract artifacts
    const artifactPath = 'artifacts/contracts/MyToken.sol/MyToken.json';
    const artifactData = fs.readFileSync(artifactPath, 'utf8');
    const { abi, bytecode } = JSON.parse(artifactData);

    // Return the ABI and bytecode
    return NextResponse.json({ abi, bytecode });
  } catch (error) {
    console.log(`error: ${error.message}`);
    return NextResponse.error({ error: 'Compilation failed' });
  }
}

export async function POST(req) {
  try {
    const id = new Date().toISOString().replace(/[^0-9]/gi, "");
    const fileName = `MyToken_${id}.sol`;
    await fs.promises.writeFile(`contracts/${fileName}`, req.body.code);
    await execPromise("npx hardhat compile");

    // Read the contract artifacts
    const artifactPath = `artifacts/contracts/${fileName}/MyToken.json`;
    const artifactData = fs.readFileSync(artifactPath, 'utf8');
    const { abi, bytecode } = JSON.parse(artifactData);

    // delete the file
    await fs.promises.unlink(`contracts/${fileName}`);

    // Return the ABI and bytecode
    return NextResponse.json({ abi, bytecode });
  } catch (error) {
    console.log(`error: ${error.message}`);
    return NextResponse.json({ code: "500", message: error.message });
  }
}
