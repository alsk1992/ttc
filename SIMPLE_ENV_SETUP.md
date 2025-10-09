# 🚀 Super Simple Environment Setup

## You only need ONE wallet for everything!

### 1️⃣ Generate Your BNB Wallet

```javascript
// Option A: Use this Node.js script
const { ethers } = require('ethers');
const wallet = ethers.Wallet.createRandom();
console.log('Save these securely:');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
```

```bash
# Option B: Or use online tool (for dev only!)
# Visit: https://vanity-eth.tk/
```

### 2️⃣ Create Your .env File

```env
# Backend .env (only these are REQUIRED)
DATABASE_URL=postgresql://user:password@localhost:5432/tictactoe
PORT=3001

# Your ONE wallet that does everything
GAME_WALLET_PRIVATE_KEY="0x_YOUR_PRIVATE_KEY_FROM_STEP_1"

# BSC Network
BSC_RPC_URL=https://bsc-dataseed.binance.org/
```

### 3️⃣ Fund Your Wallet

Send **0.1 BNB** to your wallet address for gas fees.

### That's it! 🎉

## How it works:
- **Same wallet** receives player deposits
- **Same wallet** keeps the 3% fees
- **Same wallet** pays out winners
- No complicated treasury setup needed!

## Optional Settings:

Only add these if you need them:

```env
# If you want fees sent to a DIFFERENT wallet (optional)
BSC_TREASURY_WALLET_ADDRESS="0x_DIFFERENT_ADDRESS"

# For testing on testnet first (recommended)
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
```

## 🔒 Security Reminder:
- Keep your private key SECRET
- Never commit .env to git
- Use a fresh wallet for production