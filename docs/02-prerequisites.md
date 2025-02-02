# Prerequisites

## Supported Operating Systems
- Linux (x86_64)
- macOS (Intel processor; M1 support under evaluation)
- Windows (64-bit edition with Windows Subsystem for Linux 2 enabled)

## Required Software
- Docker and Docker Compose – For containerizing nodes and services
- Node.js (v12 or higher) – For scripting and blockchain tooling
- Git – For version control
- cURL – For command-line data transfers
- Additional CLI tools as required by your blockchain frameworks

## Network Access Requirements
- Access to a reliable Ethereum Mainnet RPC endpoint (for forking purposes)
- Connection details for a Polygon PoS node or endpoint

## Installation Verification
Run the following commands to verify your installations:

```bash
docker --version
docker-compose --version
node --version
git --version
curl --version
```
