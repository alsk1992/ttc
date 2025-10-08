# Treasury and Fee System Implementation

## Overview

The Solana Tic-Tac-Toe game includes a treasury system that collects fees from betting games to support the platform.

## Fee Structure

### Win Scenario
- **Total Pot**: Player 1 bet + Player 2 bet
- **Treasury Fee**: 3% of total pot
- **Winner Payout**: 97% of total pot

Example: If each player bets 1 SOL:
- Total pot: 2 SOL
- Treasury fee: 0.06 SOL (3%)
- Winner receives: 1.94 SOL

### Draw Scenario
- **Total Pot**: Player 1 bet + Player 2 bet
- **Treasury Fee**: 1% of total pot (reduced for draws)
- **Player Refunds**: Each player gets (99% of pot) / 2

Example: If each player bets 1 SOL:
- Total pot: 2 SOL
- Treasury fee: 0.02 SOL (1%)
- Each player receives: 0.99 SOL back

## Implementation Status

### ✅ Smart Contract Implementation
The file `solana/programs/tic_tac_toe/src/lib_with_treasury.rs` contains:
- Treasury wallet constant (needs to be set)
- Fee calculation logic
- Automatic fee transfer on game completion
- Admin functions to update treasury wallet and fees

### ⚠️ TODO - Required Updates

1. **Set Treasury Wallet**
   - Replace `TREASURY_WALLET_PUBKEY_HERE` with your actual treasury wallet public key
   - This wallet will receive all fees

2. **Deploy Updated Contract**
   ```bash
   cd solana
   anchor build
   anchor deploy
   ```

3. **Update Frontend**
   - Update the program ID in frontend after deployment
   - Add treasury fee display in game UI
   - Show net winnings (after fees) to players

4. **Create Admin Dashboard**
   - View total fees collected
   - Monitor active games
   - Treasury balance tracking
   - Fee adjustment interface

## Security Considerations

1. **Treasury Wallet Security**
   - Use a multi-sig wallet for treasury
   - Keep private keys secure
   - Regular security audits

2. **Fee Limits**
   - Maximum fee is capped at 10%
   - Only treasury wallet can update fees
   - All fee changes are logged on-chain

3. **Transparency**
   - All fees are visible on-chain
   - Players can verify fee calculations
   - Game results and payouts are immutable

## Revenue Projections

Assuming average bet size of 0.5 SOL and 100 games per day:
- Daily betting volume: 100 SOL
- Daily treasury revenue: 3 SOL (3% of volume)
- Monthly revenue: ~90 SOL

## Next Steps

1. **Immediate Actions**
   - Set your treasury wallet address
   - Test the contract on devnet
   - Audit the fee calculations

2. **Frontend Updates**
   - Show fees in game creation modal
   - Display net winnings calculations
   - Add "Platform fee: 3%" notice

3. **Admin Tools**
   - Build treasury dashboard
   - Implement withdrawal functions
   - Add analytics and reporting

## Code Changes Required

### 1. Update Treasury Wallet
In `lib_with_treasury.rs`, line 6:
```rust
pub const TREASURY_WALLET: Pubkey = pubkey!("YOUR_TREASURY_WALLET_HERE");
```

### 2. Update Frontend Fee Display
In `CreateGameModal.tsx`, add fee notice:
```typescript
<p className="text-sm text-gray-500">
  Platform fee: 3% of total pot (winner receives 97%)
</p>
```

### 3. Update Payout Display
In `GameStatus.tsx`, show net winnings:
```typescript
const grossWinnings = game.betAmount * 2;
const treasuryFee = grossWinnings * 0.03;
const netWinnings = grossWinnings - treasuryFee;
```

## Testing

1. **Local Testing**
   ```bash
   # Start local validator
   solana-test-validator
   
   # Deploy contract
   anchor deploy --provider.cluster localnet
   
   # Run tests
   anchor test
   ```

2. **Devnet Testing**
   - Deploy to devnet first
   - Test with small amounts
   - Verify fee transfers

3. **Mainnet Deployment**
   - Full audit required
   - Test all edge cases
   - Monitor initial games closely