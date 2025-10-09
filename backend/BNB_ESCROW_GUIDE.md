# BNB Chain Escrow System Guide

## 🔐 How the Escrow System Works

Unlike Solana's program-based approach, this BNB implementation uses a simpler escrow wallet system:

### 1. **Game Wallet (Escrow)**
- A single BSC wallet that holds all game funds
- Players send BNB directly to this wallet to join games
- Automatically distributes winnings after game completion

### 2. **Player Flow**
```
Player 1 creates game → Sets bet amount → 
Player 1 sends BNB to escrow → Game waits for Player 2 →
Player 2 joins → Player 2 sends BNB to escrow →
Game starts → Winner determined →
Escrow pays out automatically
```

### 3. **Security Features**
- Server verifies all deposits via transaction hash
- Amount must match exactly
- Only pays out after game completion
- Treasury fees deducted automatically

## 💰 Fee Structure

- **Win**: Winner gets 97% of pot (3% to treasury)
- **Draw**: Each player gets 49.5% back (1% to treasury)
- **Example**: 1 BNB bet each = 2 BNB pot
  - Win: Winner gets 1.94 BNB
  - Draw: Each gets 0.99 BNB

## 🛠 Setup Instructions

### 1. Create Game Wallet
```bash
# Using ethers.js to generate wallet
node -e "console.log(require('ethers').Wallet.createRandom())"
```
Save the private key securely!

### 2. Configure Environment
```env
# .env file
BSC_RPC_URL=https://bsc-dataseed.binance.org/
GAME_WALLET_PRIVATE_KEY="0x_YOUR_PRIVATE_KEY"
BSC_TREASURY_WALLET_ADDRESS="0x_YOUR_TREASURY_ADDRESS"
```

### 3. Fund Game Wallet
- Send small amount of BNB for gas fees
- Recommended: 0.1 BNB for operations

### 4. Test on BSC Testnet First
```env
# For testing
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
```
Get test BNB from: https://testnet.bnbchain.org/faucet-smart

## 📋 Escrow Transaction Flow

### Creating Game (Player 1)
1. Creates game in database
2. Frontend shows deposit address
3. Player sends exact BNB amount
4. Backend verifies transaction
5. Game marked as "funded by player 1"

### Joining Game (Player 2)
1. Sees available game
2. Frontend shows deposit requirement
3. Player sends exact BNB amount
4. Backend verifies transaction
5. Game starts automatically

### Game Completion
1. Winner determined
2. Backend calculates payouts
3. Sends BNB from escrow to winner
4. Sends treasury fee
5. Updates game as "paid out"

## 🔍 Verification Process

```typescript
// Backend verifies deposits
async function verifyDeposit(txHash: string, expectedAmount: bigint) {
  const receipt = await provider.getTransactionReceipt(txHash);
  return receipt.to === GAME_WALLET && receipt.value === expectedAmount;
}
```

## ⚠️ Important Security Notes

1. **Never expose game wallet private key**
2. **Always verify deposit amounts exactly**
3. **Check transaction confirmations (12+ blocks)**
4. **Monitor gas prices for payouts**
5. **Keep minimal BNB in game wallet**

## 🚀 Production Checklist

- [ ] Generate new game wallet for production
- [ ] Set up treasury wallet
- [ ] Configure proper RPC endpoint
- [ ] Test full flow on testnet
- [ ] Set up monitoring for wallet balance
- [ ] Implement backup payout mechanism
- [ ] Add rate limiting for game creation
- [ ] Log all transactions

## 💡 BSC vs Solana Comparison

| Feature | Solana | BSC |
|---------|---------|-----|
| Transaction Cost | ~$0.00025 | ~$0.10-0.50 |
| Speed | <1 second | ~3 seconds |
| Escrow Type | Smart Contract | Wallet-based |
| Complexity | High | Low |
| Setup Cost | Program deployment | Just wallet creation |

## 🆘 Troubleshooting

### "Insufficient gas"
- Ensure game wallet has BNB for fees
- Each payout needs ~0.001-0.002 BNB

### "Transaction failed"
- Check wallet balance
- Verify correct network (mainnet vs testnet)
- Ensure recipient addresses are valid

### "Deposit not recognized"
- Wait for more confirmations
- Verify transaction hash is correct
- Check amount matches exactly