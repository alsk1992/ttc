# Escrow-Based Treasury System Setup

## Overview

This implementation uses a simple escrow approach instead of smart contracts:
- Players send funds to a game wallet when creating/joining games
- Backend handles payout logic when games complete
- Treasury fees are automatically deducted and sent to treasury wallet
- No smart contract deployment needed!

## Setup Instructions

### 1. Create Wallets

You need two wallets:

1. **Game Wallet** (Escrow)
   - Holds funds during active games
   - Processes payouts when games complete
   - Needs some SOL for transaction fees

2. **Treasury Wallet**
   - Receives platform fees (3% on wins, 1% on draws)
   - Your profit collection wallet

### 2. Configure Environment Variables

Add to your backend `.env` file:

```bash
# Game wallet private key (JSON array format)
GAME_WALLET_PRIVATE_KEY=[123,45,67,89,...] 

# Treasury wallet public key (where fees go)
TREASURY_WALLET=YourTreasuryWalletPublicKeyHere

# Solana RPC (optional, defaults to mainnet)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### 3. Update Treasury Configuration

Edit `backend/src/config/treasury.ts`:

```typescript
export const TREASURY_CONFIG = {
  // Replace with your actual treasury wallet
  TREASURY_WALLET: 'YourTreasuryWalletPublicKeyHere',
  
  // Adjust fees if needed
  WIN_FEE_PERCENT: 3,     // 3% fee on wins
  DRAW_FEE_PERCENT: 1,    // 1% fee on draws
};
```

### 4. Fund the Game Wallet

The game wallet needs SOL to pay for transaction fees:
- Start with ~1 SOL for testing
- Each payout transaction costs ~0.000005 SOL

## How It Works

### Game Creation Flow
1. Player 1 creates game with bet amount
2. Frontend sends player's bet to game wallet
3. Game waits for player 2

### Game Join Flow
1. Player 2 joins game
2. Frontend sends player 2's bet to game wallet
3. Game starts with both bets in escrow

### Game Completion Flow
1. Game ends (win or draw)
2. Backend calculates:
   - Treasury fee (3% for wins, 1% for draws)
   - Player payouts (remaining after fee)
3. Backend sends transactions:
   - Treasury fee → Treasury wallet
   - Payouts → Winner (or refunds for draw)

## Frontend Integration

### Update Game Creation
Players need to send funds to the game wallet:

```typescript
// In CreateGameModal.tsx
const gameWalletAddress = "YourGameWalletPublicKeyHere";

// When creating game
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: new PublicKey(gameWalletAddress),
    lamports: betAmount,
  })
);
await wallet.sendTransaction(transaction, connection);
```

### Display Fees
Show players the fee structure:

```typescript
// In game UI
<div className="text-sm text-gray-500">
  Platform fee: 3% (winner receives 97% of pot)
</div>
```

## Testing

1. **Local Testing**
   ```bash
   # Start backend
   cd backend
   npm run dev
   
   # Create test game with small bet (0.01 SOL)
   # Play through to completion
   # Check treasury wallet received fee
   ```

2. **Monitor Transactions**
   - Game wallet: Check escrow balance
   - Treasury wallet: Check fee accumulation
   - Use Solana Explorer to verify transactions

## Security Considerations

1. **Game Wallet Security**
   - Keep private key secure
   - Use environment variables
   - Consider using a hardware wallet for production
   - Monitor for unusual activity

2. **Payout Validation**
   - All payouts are logged
   - Failed payouts are tracked
   - Consider implementing retry logic

3. **Rate Limiting**
   - Limit game creation rate
   - Prevent spam games
   - Monitor for abuse

## Revenue Tracking

Check treasury stats:
```
GET /api/treasury/stats
```

Response:
```json
{
  "treasury": {
    "wallet": "YourTreasuryWallet...",
    "balance": 10.5,
    "config": {
      "winFeePercent": 3,
      "drawFeePercent": 1
    }
  },
  "gameWallet": {
    "balance": 2.3
  }
}
```

## Advantages of Escrow Approach

✅ **No Smart Contract Costs**
- No deployment fees
- No program upgrade costs
- Faster iteration

✅ **Flexibility**
- Easy to update fee structure
- Can add features without redeploying
- Quick bug fixes

✅ **Simplicity**
- Standard Solana transfers
- No complex program logic
- Easy to audit

✅ **Control**
- Direct treasury management
- Instant fee updates
- Custom payout logic

## Next Steps

1. **Set up wallets** and add keys to `.env`
2. **Test with small amounts** on mainnet
3. **Monitor first games** closely
4. **Add admin dashboard** for treasury monitoring
5. **Implement payout retry** for failed transactions