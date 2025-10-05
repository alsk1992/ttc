use anchor_lang::prelude::*;

declare_id!("3eYvFqyMAYiKZ3cYKQtQ8cSwFwrSqUKgbQDUWLj2QVnT");

#[program]
pub mod tic_tac_toe {
    use super::*;

    pub fn initialize_game(
        ctx: Context<InitializeGame>, 
        game_id: String,
        bet_amount: u64
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.player1 = ctx.accounts.player1.key();
        game.player2 = None;
        game.current_turn = Player::X;
        game.status = GameStatus::Active;
        game.winner = None;
        game.board = [None; 9];
        game.bet_amount = bet_amount;
        game.game_id = game_id;

        if bet_amount > 0 {
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.player1.to_account_info(),
                    to: ctx.accounts.game.to_account_info(),
                },
            );
            anchor_lang::system_program::transfer(cpi_context, bet_amount)?;
        }

        Ok(())
    }

    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        require!(game.player2.is_none(), GameError::GameFull);
        require!(game.status == GameStatus::Active, GameError::GameNotActive);
        
        game.player2 = Some(ctx.accounts.player2.key());

        if game.bet_amount > 0 {
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.player2.to_account_info(),
                    to: ctx.accounts.game.to_account_info(),
                },
            );
            anchor_lang::system_program::transfer(cpi_context, game.bet_amount)?;
        }

        Ok(())
    }

    pub fn make_move(ctx: Context<MakeMove>, position: u8) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        require!(position < 9, GameError::InvalidPosition);
        require!(game.board[position as usize].is_none(), GameError::PositionTaken);
        require!(game.status == GameStatus::Active, GameError::GameNotActive);
        require!(game.player2.is_some(), GameError::WaitingForPlayer);

        let current_player = if game.current_turn == Player::X {
            game.player1
        } else {
            game.player2.unwrap()
        };

        require!(
            ctx.accounts.player.key() == current_player,
            GameError::NotPlayerTurn
        );

        game.board[position as usize] = Some(game.current_turn);

        if let Some(winner) = check_winner(&game.board) {
            game.status = GameStatus::Won;
            game.winner = Some(winner);

            if game.bet_amount > 0 {
                let total_pot = game.bet_amount * 2;
                let winner_key = if winner == Player::X {
                    game.player1
                } else {
                    game.player2.unwrap()
                };

                **game.to_account_info().try_borrow_mut_lamports()? -= total_pot;
                
                if winner == Player::X {
                    **ctx.accounts.player1.try_borrow_mut_lamports()? += total_pot;
                } else {
                    **ctx.accounts.player2.try_borrow_mut_lamports()? += total_pot;
                }
            }
        } else if is_board_full(&game.board) {
            game.status = GameStatus::Draw;
            
            if game.bet_amount > 0 {
                **game.to_account_info().try_borrow_mut_lamports()? -= game.bet_amount * 2;
                **ctx.accounts.player1.try_borrow_mut_lamports()? += game.bet_amount;
                **ctx.accounts.player2.try_borrow_mut_lamports()? += game.bet_amount;
            }
        } else {
            game.current_turn = if game.current_turn == Player::X {
                Player::O
            } else {
                Player::X
            };
        }

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(game_id: String)]
pub struct InitializeGame<'info> {
    #[account(
        init,
        payer = player1,
        space = 8 + Game::INIT_SPACE,
        seeds = [b"game", game_id.as_bytes()],
        bump
    )]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player1: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player2: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MakeMove<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player: Signer<'info>,
    /// CHECK: This is the player1 account for potential payouts
    #[account(mut)]
    pub player1: AccountInfo<'info>,
    /// CHECK: This is the player2 account for potential payouts
    #[account(mut)]
    pub player2: AccountInfo<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Game {
    pub player1: Pubkey,
    pub player2: Option<Pubkey>,
    pub current_turn: Player,
    pub status: GameStatus,
    pub winner: Option<Player>,
    pub board: [Option<Player>; 9],
    pub bet_amount: u64,
    #[max_len(32)]
    pub game_id: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum Player {
    X,
    O,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum GameStatus {
    Active,
    Won,
    Draw,
}

#[error_code]
pub enum GameError {
    #[msg("Invalid position")]
    InvalidPosition,
    #[msg("Position already taken")]
    PositionTaken,
    #[msg("Game is not active")]
    GameNotActive,
    #[msg("Game is full")]
    GameFull,
    #[msg("Waiting for second player")]
    WaitingForPlayer,
    #[msg("Not your turn")]
    NotPlayerTurn,
}

fn check_winner(board: &[Option<Player>; 9]) -> Option<Player> {
    let winning_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6], // diagonals
    ];

    for combination in &winning_combinations {
        if let (Some(a), Some(b), Some(c)) = (
            board[combination[0]],
            board[combination[1]],
            board[combination[2]],
        ) {
            if a == b && b == c {
                return Some(a);
            }
        }
    }

    None
}

fn is_board_full(board: &[Option<Player>; 9]) -> bool {
    board.iter().all(|cell| cell.is_some())
}