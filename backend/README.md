# Tic-Tac-Toe Backend API

Express.js API server for the Solana tic-tac-toe game with WebSocket support for real-time gameplay.

## Features

- RESTful API for game management
- Real-time WebSocket connections
- PostgreSQL database integration
- Solana blockchain integration
- Comprehensive error handling
- Input validation with Zod
- CORS and security middleware

## Quick Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Make sure PostgreSQL is running
   # Database tables are created automatically on startup
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Game Management

#### Create Game
```http
POST /api/games/create
Content-Type: application/json

{
  "player1": "wallet_address",
  "betAmount": 1000000000
}
```

#### Get Active Games
```http
GET /api/games/active
```

#### Get Game Details
```http
GET /api/games/:id
```

#### Join Game
```http
POST /api/games/:id/join
Content-Type: application/json

{
  "player2": "wallet_address"
}
```

#### Make Move
```http
POST /api/games/:id/move
Content-Type: application/json

{
  "player": "wallet_address",
  "position": 4
}
```

#### Get Player Games
```http
GET /api/games/player/:wallet
```

### Health Check
```http
GET /health
```

## WebSocket Events

### Client to Server
- `join-game`: Join a game room for real-time updates
- `leave-game`: Leave a game room

### Server to Client
- `game-updated`: Game state has been updated
- `player-joined`: A player joined the game
- `move-made`: A move was made in the game
- `game-completed`: Game has ended with winner/draw

## Database Schema

### Games Table
```sql
CREATE TABLE games (
  id VARCHAR(255) PRIMARY KEY,
  player1 VARCHAR(255) NOT NULL,
  player2 VARCHAR(255),
  current_turn VARCHAR(1) NOT NULL DEFAULT 'X',
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  winner VARCHAR(10),
  board JSONB NOT NULL DEFAULT '[null,null,null,null,null,null,null,null,null]',
  bet_amount BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Environment Variables

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/tic_tac_toe

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=your_program_id

# CORS
FRONTEND_URL=http://localhost:3000
```

## Deployment

### Railway Deployment

1. **Connect Repository**
   ```bash
   railway login
   railway init
   ```

2. **Set Environment Variables**
   ```bash
   railway variables set DATABASE_URL=your_db_url
   railway variables set SOLANA_RPC_URL=your_rpc_url
   railway variables set PROGRAM_ID=your_program_id
   railway variables set FRONTEND_URL=your_frontend_url
   ```

3. **Deploy**
   ```bash
   railway up
   ```

### Manual Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues

### Project Structure
```
src/
├── index.ts              # Main server file
├── routes/
│   └── games.ts          # Game API routes
├── services/
│   ├── database.ts       # Database operations
│   ├── websocket.ts      # WebSocket handling
│   └── solana.ts         # Solana integration
├── middleware/
│   └── errorHandler.ts   # Error handling middleware
├── types/
│   └── index.ts          # TypeScript type definitions
└── utils/
    └── validation.ts     # Input validation schemas
```

## Error Handling

The API uses consistent error responses:

```json
{
  "error": {
    "message": "Error description",
    "stack": "Error stack (development only)"
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Security

- Helmet.js for security headers
- CORS configuration for cross-origin requests
- Input validation with Zod
- SQL injection prevention with parameterized queries
- Rate limiting (recommended for production)

## Testing

```bash
npm test
```

Tests cover:
- API endpoint functionality
- Database operations
- WebSocket events
- Error handling
- Input validation