const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execPromise = promisify(exec);

const app = express();
app.use(
  cors({
    origin: "*"
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res
    .status(200)
    .json({
      message:
        "Welcome to SuperToken Wizard API. Please navigate to https://super-token-wizard-develop.vercel.app/"
    });
});

app.post("/api/compile", async (req, res) => {
  if (!req?.body?.code)
    return res
      .status(400)
      .json({ code: "Bad request", message: "Missing required code" });
  const id = new Date().toISOString().replace(/[^0-9]/gi, "");
  const fileName = `MyToken_${id}.sol`;
  const filePath = path.join(__dirname, `contracts/${fileName}`);
  try {
    await fs.promises.writeFile(filePath, req.body.code);
    const commandRes = await execPromise("npx hardhat compile");
    console.log("commandRes", commandRes);

    const artifactPath = path.join(
      __dirname,
      `artifacts/contracts/${fileName}/MyToken.json`
    );
    const artifactData = fs.readFileSync(artifactPath, "utf8");
    const { abi, bytecode } = JSON.parse(artifactData);

    return res.status(200).json({ abi, bytecode });
  } catch (error) {
    console.log(`api error: ${error.message}`);
    return res.status(500).json({ code: "500", message: "Compilation failed" });
  } finally {
    fs.unlinkSync(filePath);
    fs.rmSync(path.join(__dirname, `artifacts/contracts/${fileName}`), {
      recursive: true,
      force: true
    });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () =>
  console.log(`🔥 Server listening at http://localhost:${port} 🚀`)
);
