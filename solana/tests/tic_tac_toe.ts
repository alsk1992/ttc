import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TicTacToe } from "../target/types/tic_tac_toe";
import { expect } from "chai";

describe("tic_tac_toe", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TicTacToe as Program<TicTacToe>;
  
  let gameKeypair: anchor.web3.Keypair;
  let player1: anchor.web3.Keypair;
  let player2: anchor.web3.Keypair;
  const gameId = "test-game-1";

  beforeEach(async () => {
    player1 = anchor.web3.Keypair.generate();
    player2 = anchor.web3.Keypair.generate();
    
    // Airdrop SOL to players
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(player1.publicKey, 2000000000),
      "processed"
    );
    
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(player2.publicKey, 2000000000),
      "processed"
    );

    // Find game PDA
    const [gamePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("game"), Buffer.from(gameId)],
      program.programId
    );
    gameKeypair = { publicKey: gamePda } as anchor.web3.Keypair;
  });

  it("Initialize a game without bet", async () => {
    await program.methods
      .initializeGame(gameId, new anchor.BN(0))
      .accounts({
        game: gameKeypair.publicKey,
        player1: player1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([player1])
      .rpc();

    const gameAccount = await program.account.game.fetch(gameKeypair.publicKey);
    expect(gameAccount.player1.toString()).to.equal(player1.publicKey.toString());
    expect(gameAccount.player2).to.be.null;
    expect(gameAccount.betAmount.toNumber()).to.equal(0);
    expect(gameAccount.status).to.deep.equal({ active: {} });
  });

  it("Initialize a game with bet", async () => {
    const betAmount = new anchor.BN(1000000000); // 1 SOL

    await program.methods
      .initializeGame(gameId, betAmount)
      .accounts({
        game: gameKeypair.publicKey,
        player1: player1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([player1])
      .rpc();

    const gameAccount = await program.account.game.fetch(gameKeypair.publicKey);
    expect(gameAccount.betAmount.toNumber()).to.equal(betAmount.toNumber());
  });

  it("Join a game", async () => {
    // Initialize game first
    await program.methods
      .initializeGame(gameId, new anchor.BN(0))
      .accounts({
        game: gameKeypair.publicKey,
        player1: player1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([player1])
      .rpc();

    // Player 2 joins
    await program.methods
      .joinGame()
      .accounts({
        game: gameKeypair.publicKey,
        player2: player2.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([player2])
      .rpc();

    const gameAccount = await program.account.game.fetch(gameKeypair.publicKey);
    expect(gameAccount.player2.toString()).to.equal(player2.publicKey.toString());
  });

  it("Make moves and win", async () => {
    // Initialize and join game
    await program.methods
      .initializeGame(gameId, new anchor.BN(0))
      .accounts({
        game: gameKeypair.publicKey,
        player1: player1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([player1])
      .rpc();

    await program.methods
      .joinGame()
      .accounts({
        game: gameKeypair.publicKey,
        player2: player2.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([player2])
      .rpc();

    // Player 1 (X) plays winning moves
    await program.methods
      .makeMove(0) // X at position 0
      .accounts({
        game: gameKeypair.publicKey,
        player: player1.publicKey,
        player1: player1.publicKey,
        player2: player2.publicKey,
      })
      .signers([player1])
      .rpc();

    await program.methods
      .makeMove(3) // O at position 3
      .accounts({
        game: gameKeypair.publicKey,
        player: player2.publicKey,
        player1: player1.publicKey,
        player2: player2.publicKey,
      })
      .signers([player2])
      .rpc();

    await program.methods
      .makeMove(1) // X at position 1
      .accounts({
        game: gameKeypair.publicKey,
        player: player1.publicKey,
        player1: player1.publicKey,
        player2: player2.publicKey,
      })
      .signers([player1])
      .rpc();

    await program.methods
      .makeMove(4) // O at position 4
      .accounts({
        game: gameKeypair.publicKey,
        player: player2.publicKey,
        player1: player1.publicKey,
        player2: player2.publicKey,
      })
      .signers([player2])
      .rpc();

    await program.methods
      .makeMove(2) // X at position 2 - winning move
      .accounts({
        game: gameKeypair.publicKey,
        player: player1.publicKey,
        player1: player1.publicKey,
        player2: player2.publicKey,
      })
      .signers([player1])
      .rpc();

    const gameAccount = await program.account.game.fetch(gameKeypair.publicKey);
    expect(gameAccount.status).to.deep.equal({ won: {} });
    expect(gameAccount.winner).to.deep.equal({ x: {} });
  });

  it("Should reject invalid position", async () => {
    // Initialize and join game
    await program.methods
      .initializeGame(gameId, new anchor.BN(0))
      .accounts({
        game: gameKeypair.publicKey,
        player1: player1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([player1])
      .rpc();

    await program.methods
      .joinGame()
      .accounts({
        game: gameKeypair.publicKey,
        player2: player2.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([player2])
      .rpc();

    try {
      await program.methods
        .makeMove(9) // Invalid position
        .accounts({
          game: gameKeypair.publicKey,
          player: player1.publicKey,
          player1: player1.publicKey,
          player2: player2.publicKey,
        })
        .signers([player1])
        .rpc();
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error.toString()).to.include("InvalidPosition");
    }
  });
});