-- Add BNB-specific fields to games table
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS player1_deposited BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS player2_deposited BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS player1_tx_hash VARCHAR(66),
ADD COLUMN IF NOT EXISTS player2_tx_hash VARCHAR(66),
ADD COLUMN IF NOT EXISTS payout_tx_hashes TEXT[], -- Array of payout transaction hashes
ADD COLUMN IF NOT EXISTS network VARCHAR(20) DEFAULT 'BSC'; -- Network identifier

-- Create index for transaction hashes
CREATE INDEX IF NOT EXISTS idx_player1_tx_hash ON games(player1_tx_hash);
CREATE INDEX IF NOT EXISTS idx_player2_tx_hash ON games(player2_tx_hash);

-- Add comment explaining the new fields
COMMENT ON COLUMN games.player1_deposited IS 'Whether player 1 has deposited their bet amount';
COMMENT ON COLUMN games.player2_deposited IS 'Whether player 2 has deposited their bet amount';
COMMENT ON COLUMN games.player1_tx_hash IS 'BSC transaction hash for player 1 deposit';
COMMENT ON COLUMN games.player2_tx_hash IS 'BSC transaction hash for player 2 deposit';
COMMENT ON COLUMN games.payout_tx_hashes IS 'Array of BSC transaction hashes for payouts';
COMMENT ON COLUMN games.network IS 'Blockchain network (BSC, SOL, etc)';