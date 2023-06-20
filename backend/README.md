# SuperToken Wizard Backend

## Getting Started

```bash
npm install
npm run dev
```

## Usage

```
curl -X POST -H "Content-Type: application/json" -d '{"code": "pragma solidity ^0.8.0; contract MyToken { string public name; constructor(string memory _name) { name = _name; } }"}' http://localhost:4000/api/compile
```

The response will contain the compiled ABI and bytecode of the contract.
