const { exec } = require('child_process');
import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET(req) {
  return NextResponse.json({ message: 'Hello, Please POST to compile contract!' });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const id = new Date().toISOString().replace(/[^0-9]/gi, "");
    const fileName = `MyToken_${id}.sol`;
    await fs.promises.writeFile(`contracts/${fileName}`, body.code);
    const commandRes = await execPromise("npx hardhat compile");
    console.log("commandRes", commandRes);
    // if (commandRes.stderr) {
    //   console.log(`stderr: ${commandRes.stderr}`);
    //   return NextResponse.json({ error: 'Compilation failed' });
    // }

    // delete the contract file
    await fs.promises.unlink(`contracts/${fileName}`);

    // Read the contract artifacts
    const artifactPath = `artifacts/contracts/${fileName}/MyToken.json`;
    const artifactData = fs.readFileSync(artifactPath, 'utf8');
    const { abi, bytecode } = JSON.parse(artifactData);

    // delete the artifact
    await fs.promises.rm(`artifacts/contracts/${fileName}`, { recursive: true, force: true });

    // Return the ABI and bytecode
    return NextResponse.json({ abi, bytecode });
  } catch (error) {
    console.log(`api error: ${error.message}`);
    return NextResponse.json({ code: "500", message: 'Compilation failed' });
  }
}
