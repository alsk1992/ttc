import { Pool, Client } from 'pg';
import { GameState, PlayerStats } from '../types';

let pool: Pool;

export async function initializeDatabase() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/tic_tac_toe';
  
  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

async function createTables() {
  const client = await pool.connect();
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
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
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_games_player1 ON games(player1);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_games_player2 ON games(player2);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);
    `);
  } finally {
    client.release();
  }
}

export async function createGame(gameData: {
  id: string;
  player1: string;
  betAmount: number;
}): Promise<GameState> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `INSERT INTO games (id, player1, bet_amount) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [gameData.id, gameData.player1, gameData.betAmount]
    );

    return dbRowToGameState(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function getGame(gameId: string): Promise<GameState | null> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM games WHERE id = $1',
      [gameId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return dbRowToGameState(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function updateGame(gameId: string, updates: Partial<GameState>): Promise<GameState | null> {
  const client = await pool.connect();
  
  try {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    if (updates.player2 !== undefined) {
      setClause.push(`player2 = $${paramIndex++}`);
      values.push(updates.player2);
    }
    
    if (updates.currentTurn !== undefined) {
      setClause.push(`current_turn = $${paramIndex++}`);
      values.push(updates.currentTurn);
    }
    
    if (updates.status !== undefined) {
      setClause.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    
    if (updates.winner !== undefined) {
      setClause.push(`winner = $${paramIndex++}`);
      values.push(updates.winner);
    }
    
    if (updates.board !== undefined) {
      setClause.push(`board = $${paramIndex++}`);
      values.push(JSON.stringify(updates.board));
    }

    setClause.push(`updated_at = NOW()`);
    values.push(gameId);

    const query = `
      UPDATE games 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return dbRowToGameState(result.rows[0]);
  } finally {
    client.release();
  }
}

export async function getActiveGames(): Promise<GameState[]> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM games WHERE status = $1 ORDER BY created_at DESC',
      ['waiting']
    );

    return result.rows.map(dbRowToGameState);
  } finally {
    client.release();
  }
}

export async function getPlayerGames(playerAddress: string): Promise<GameState[]> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM games WHERE player1 = $1 OR player2 = $1 ORDER BY created_at DESC',
      [playerAddress]
    );

    return result.rows.map(dbRowToGameState);
  } finally {
    client.release();
  }
}

export async function getPlayerStats(playerAddress: string): Promise<PlayerStats> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT 
        COUNT(*) as games_played,
        SUM(CASE 
          WHEN winner = 'X' AND player1 = $1 THEN 1
          WHEN winner = 'O' AND player2 = $1 THEN 1
          ELSE 0
        END) as games_won,
        SUM(CASE 
          WHEN winner = 'X' AND player2 = $1 THEN 1
          WHEN winner = 'O' AND player1 = $1 THEN 1
          ELSE 0
        END) as games_lost,
        SUM(CASE WHEN winner = 'draw' THEN 1 ELSE 0 END) as games_draw,
        SUM(CASE 
          WHEN winner = 'X' AND player1 = $1 THEN bet_amount * 2
          WHEN winner = 'O' AND player2 = $1 THEN bet_amount * 2
          WHEN winner = 'draw' THEN bet_amount
          ELSE 0
        END) as total_earnings
      FROM games 
      WHERE (player1 = $1 OR player2 = $1) AND status = 'completed'
    `, [playerAddress]);

    const row = result.rows[0];
    return {
      gamesPlayed: parseInt(row.games_played) || 0,
      gamesWon: parseInt(row.games_won) || 0,
      gamesLost: parseInt(row.games_lost) || 0,
      gamesDraw: parseInt(row.games_draw) || 0,
      totalEarnings: parseInt(row.total_earnings) || 0
    };
  } finally {
    client.release();
  }
}

function dbRowToGameState(row: any): GameState {
  return {
    id: row.id,
    player1: row.player1,
    player2: row.player2,
    currentTurn: row.current_turn as 'X' | 'O',
    status: row.status as 'waiting' | 'active' | 'completed',
    winner: row.winner as 'X' | 'O' | 'draw' | undefined,
    board: JSON.parse(row.board),
    betAmount: parseInt(row.bet_amount),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}