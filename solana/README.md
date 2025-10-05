# Solana Tic-Tac-Toe Program

An Anchor-based Solana program for playing tic-tac-toe with optional SOL betting.

## Features

- 3x3 tic-tac-toe game logic
- Two-player turn-based gameplay
- Optional SOL betting with escrow
- Winner takes all, draw returns bets
- PDA-based game accounts
- Comprehensive error handling

## Quick Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build Program**
   ```bash
   anchor build
   ```

3. **Test Program**
   ```bash
   anchor test
   ```

4. **Deploy to Devnet**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

## Game Instructions

### Creating a Game
- Call `initialize_game` with unique game ID and bet amount
- Player 1 deposits bet amount (if > 0) into game escrow
- Game waits for second player

### Joining a Game
- Call `join_game` with existing game account
- Player 2 deposits matching bet amount into escrow
- Game becomes active

### Making Moves
- Players alternate turns (X goes first)
- Call `make_move` with position (0-8)
- Win detection: 3 in a row horizontally, vertically, or diagonally
- Draw detection: board full with no winner

### Payouts
- **Win**: Winner receives entire pot (2x bet amount)
- **Draw**: Both players get their bet back
- **No bet**: No SOL transferred

## Program Structure

### Accounts
- `Game`: Stores game state, players, board, bets
- Uses PDA with seeds: `["game", game_id]`

### Instructions
1. `initialize_game(game_id, bet_amount)` - Create new game
2. `join_game()` - Join existing game as player 2
3. `make_move(position)` - Make a move on the board

### Data Types
- `Player`: X or O
- `GameStatus`: Active, Won, Draw
- `Game`: Complete game state with 9-cell board

## Testing

Run the test suite:
```bash
anchor test
```

Tests cover:
- Game initialization with/without bets
- Player joining
- Valid/invalid moves
- Win condition detection
- Error handling

## Deployment

### Devnet
```bash
anchor deploy --provider.cluster devnet
```

### Mainnet
```bash
anchor deploy --provider.cluster mainnet
```

Update the program ID in:
- `Anchor.toml`
- `lib.rs` (declare_id! macro)
- Frontend configuration

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
ANCHOR_WALLET=~/.config/solana/id.json
PROGRAM_ID=your_deployed_program_id
```

## Security Considerations

- Game accounts use PDA for deterministic addresses
- Bet amounts held in escrow until game completion
- Only current turn player can make moves
- Position validation prevents out-of-bounds moves
- Game state validation prevents invalid operations