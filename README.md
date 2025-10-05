# Solana Tic-Tac-Toe Game

A full-stack Solana-based tic-tac-toe game with betting functionality.

## Project Structure

```
/
├── solana/          # Anchor Solana program
├── backend/         # Node.js API server
├── frontend/        # Next.js frontend
└── README.md        # This file
```

## Quick Start

1. **Deploy Solana Program** (first time setup)
   ```bash
   cd solana
   anchor build
   anchor deploy --provider.cluster devnet
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Deployment

### Solana Program
- Deploy to Solana devnet first for testing
- Update program ID in all configurations
- Deploy to mainnet for production

### Backend (Railway)
```bash
cd backend
# Connect to Railway and deploy
railway login
railway init
railway up
```

### Frontend (Vercel)
```bash
cd frontend
# Deploy to Vercel
vercel --prod
```

## Environment Setup

Each folder contains a `.env.example` file with required environment variables.

## Game Features

- 3x3 tic-tac-toe game
- SOL betting system
- Real-time gameplay via WebSocket
- Wallet integration (Phantom, Solflare)
- Game history and leaderboards
- Responsive mobile-friendly design

## Tech Stack

- **Solana**: Anchor framework
- **Backend**: Node.js, Express, PostgreSQL, WebSocket
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Deployment**: Railway (backend), Vercel (frontend)

## Getting Started

See individual README files in each folder for detailed setup instructions.