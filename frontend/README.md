# Tic-Tac-Toe Frontend

Next.js 14 frontend application for the Solana tic-tac-toe game with real-time gameplay and wallet integration.

## Features

- **Wallet Integration**: Support for Phantom, Solflare, and other Solana wallets
- **Real-time Gameplay**: WebSocket-powered live game updates
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Game Management**: Create, join, and play games with optional SOL betting
- **Game History**: Track your wins, losses, and earnings
- **Interactive Board**: Smooth animations and hover effects
- **TypeScript**: Full type safety throughout the application

## Quick Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=your_program_id
```

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (game lobby)
│   ├── game/[id]/          # Dynamic game pages
│   └── history/            # Game history page
├── components/             # React components
│   ├── WalletProvider.tsx  # Solana wallet context
│   ├── Navbar.tsx          # Navigation component
│   ├── GameBoard.tsx       # Interactive game board
│   ├── GameList.tsx        # Available games list
│   ├── GameStatus.tsx      # Game status display
│   ├── CreateGameModal.tsx # Game creation modal
│   └── StatsCard.tsx       # Statistics display
├── hooks/                  # Custom React hooks
│   ├── usePlayerStats.ts   # Player statistics
│   └── useWebSocket.ts     # WebSocket connection
├── lib/                    # Utility libraries
│   ├── api.ts              # API client
│   ├── solana.ts           # Solana utilities
│   └── websocket.ts        # WebSocket manager
└── types/                  # TypeScript type definitions
    └── index.ts            # Shared types
```

## Components

### WalletProvider
Provides Solana wallet context throughout the application with support for multiple wallet adapters.

### GameBoard
Interactive 3x3 tic-tac-toe board with:
- Click handlers for making moves
- Hover effects for move preview
- Turn indicators
- Winning animations

### GameList
Displays available games with:
- Real-time updates
- Bet amount display
- Join game functionality
- Player information

### CreateGameModal
Modal for creating new games with:
- Bet amount input
- Validation
- Success/error handling

## Real-time Features

The application uses WebSocket connections for real-time updates:

- **Game Updates**: Live board state changes
- **Player Joins**: Notifications when players join
- **Move Made**: Instant move updates
- **Game Completion**: Win/draw notifications

## Wallet Integration

Supports multiple Solana wallets:
- Phantom
- Solflare
- Torus
- Ledger

Features:
- Auto-connect on page load
- Balance display
- Transaction signing for game moves
- Network switching (devnet/mainnet)

## Pages

### Home (`/`)
- Game lobby with available games
- Player statistics
- Create game button
- Wallet connection

### Game (`/game/[id]`)
- Interactive game board
- Real-time updates
- Player information
- Game status
- Join game functionality

### History (`/history`)
- Player's game history
- Win/loss statistics
- Earnings tracking
- Game details

## Styling

Uses Tailwind CSS with custom components:
- Responsive design
- Dark/light theme support
- Custom animations
- Component variants

### Custom CSS Classes
```css
.btn              # Base button styles
.btn-primary      # Primary button variant
.btn-secondary    # Secondary button variant
.card             # Card container
.game-cell        # Tic-tac-toe cell
.input            # Form input
```

## API Integration

The frontend communicates with the backend API for:
- Game creation and management
- Player statistics
- Game history
- Move validation

Error handling includes:
- Network errors
- API errors
- Validation errors
- User-friendly messages

## WebSocket Events

### Outgoing Events
- `join-game`: Join a game room
- `leave-game`: Leave a game room

### Incoming Events
- `game-updated`: Game state changed
- `player-joined`: Player joined game
- `move-made`: Move was made
- `game-completed`: Game finished

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checker

### Code Quality
- ESLint configuration
- TypeScript strict mode
- Prettier formatting
- Consistent code style

## Deployment

### Vercel Deployment

1. **Connect Repository**
   ```bash
   # Deploy via Vercel CLI
   npm i -g vercel
   vercel --prod
   ```

2. **Environment Variables**
   Set in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SOLANA_RPC`
   - `NEXT_PUBLIC_PROGRAM_ID`

3. **Custom Domain**
   Configure domain in Vercel dashboard

### Manual Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Deploy Static Files**
   Upload `.next` directory to hosting provider

## Performance

- **Next.js 14**: Latest React features and optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Static generation where possible

## Security

- **CSP Headers**: Content Security Policy
- **XSS Protection**: Cross-site scripting prevention
- **Input Validation**: Client and server-side validation
- **Wallet Security**: Secure transaction signing

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Common Issues

1. **Wallet Connection Issues**
   - Ensure wallet extension is installed
   - Check network configuration
   - Clear browser cache

2. **WebSocket Connection Failed**
   - Verify backend server is running
   - Check CORS configuration
   - Ensure correct API URL

3. **Transaction Failures**
   - Check wallet balance
   - Verify network connection
   - Ensure correct program ID

### Debug Mode

Enable debug logging:
```bash
NEXT_PUBLIC_DEBUG=true npm run dev
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Follow code review process