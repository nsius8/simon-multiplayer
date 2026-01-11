// Socket.io game event handlers

import { Server, Socket } from 'socket.io';
import {
  createNewGame,
  getGameById,
  getGameByCode,
  addPlayerToGame,
  removePlayerFromGame,
  refreshGameColors,
  startGame,
  startRound,
  submitPlayerInput,
  allPlayersSubmitted,
  shouldGameEnd,
  endGame,
  getWinner,
  resetGame,
  getClientGameState,
  getRoundResults,
  getLeaderboard,
} from '../services/GameService.js';
import { validateGameSettings, sanitizePlayerName, validateGameCode } from '../utils/validators.js';
import type { GameSettings } from '../models/Game.js';

// Track socket to player/game mapping
const socketToPlayer = new Map<string, { playerId: string; gameId: string }>();

export function setupGameSocket(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Create a new game
    socket.on('createGame', async (data: { hostName: string; settings: GameSettings; playerId: string }) => {
      try {
        const { hostName, settings, playerId: clientPlayerId } = data;

        // Validate settings
        if (!validateGameSettings(settings)) {
          socket.emit('error', { message: 'Invalid game settings' });
          return;
        }

        const sanitizedName = sanitizePlayerName(hostName);
        if (!sanitizedName) {
          socket.emit('error', { message: 'Invalid host name' });
          return;
        }

        const { game, playerId } = createNewGame(sanitizedName, settings, socket.id, clientPlayerId);

        // Track this socket
        socketToPlayer.set(socket.id, { playerId, gameId: game.id });

        // Join socket room
        socket.join(game.id);

        // Send game created event
        socket.emit('game:created', {
          gameId: game.id,
          code: game.gameCode,
          settings: game.settings,
        });

        // Send full game state
        socket.emit('game:state', { game: getClientGameState(game) });

        console.log(`🎮 Game created: ${game.gameCode} by ${sanitizedName}`);
      } catch (error) {
        console.error('Error creating game:', error);
        socket.emit('error', { message: 'Failed to create game' });
      }
    });

    // Join an existing game
    socket.on('joinGame', async (data: { code: string; playerName: string; playerId: string }) => {
      try {
        const { code, playerName, playerId: clientPlayerId } = data;

        console.log(`🔍 Join attempt: code=${code}, player=${playerName}`);

        if (!validateGameCode(code)) {
          console.log(`❌ Invalid game code format: ${code}`);
          socket.emit('join:error', { message: 'Invalid game code format' });
          return;
        }

        const game = getGameByCode(code);
        if (!game) {
          console.log(`❌ Game not found: ${code}`);
          socket.emit('join:error', { message: 'Game not found. The game may have ended or the code is incorrect.' });
          return;
        }

        const sanitizedName = sanitizePlayerName(playerName);
        if (!sanitizedName) {
          socket.emit('join:error', { message: 'Invalid player name' });
          return;
        }

        const result = addPlayerToGame(game, sanitizedName, socket.id, clientPlayerId);
        if (!result.success) {
          socket.emit('join:error', { message: result.error || 'Failed to join game' });
          return;
        }

        // Track this socket
        socketToPlayer.set(socket.id, { playerId: result.player!.id, gameId: game.id });

        // Join socket room
        socket.join(game.id);

        // Notify other players
        socket.to(game.id).emit('player:joined', { player: result.player });

        // Send full game state to joining player
        socket.emit('game:state', { game: getClientGameState(game) });

        console.log(`👤 ${sanitizedName} joined game ${game.gameCode}`);
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('join:error', { message: 'Failed to join game' });
      }
    });

    // Refresh colors (host only)
    socket.on('refreshColors', async (data: { gameId: string }) => {
      try {
        const playerInfo = socketToPlayer.get(socket.id);
        if (!playerInfo) {
          socket.emit('error', { message: 'Not in a game' });
          return;
        }

        const game = getGameById(data.gameId);
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        // Check if requester is host
        const player = game.players.find((p) => p.id === playerInfo.playerId);
        if (!player?.isHost) {
          socket.emit('error', { message: 'Only host can refresh colors' });
          return;
        }

        const newColors = refreshGameColors(game);
        io.to(game.id).emit('colors:refreshed', { colors: newColors });

        console.log(`🎨 Colors refreshed for game ${game.gameCode}`);
      } catch (error) {
        console.error('Error refreshing colors:', error);
        socket.emit('error', { message: 'Failed to refresh colors' });
      }
    });

    // Start the game (host only)
    socket.on('startGame', async (data: { gameId: string }) => {
      try {
        const playerInfo = socketToPlayer.get(socket.id);
        if (!playerInfo) {
          socket.emit('error', { message: 'Not in a game' });
          return;
        }

        const game = getGameById(data.gameId);
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        // Check if requester is host
        const player = game.players.find((p) => p.id === playerInfo.playerId);
        if (!player?.isHost) {
          socket.emit('error', { message: 'Only host can start the game' });
          return;
        }

        const success = startGame(game);
        if (!success) {
          socket.emit('error', { message: 'Cannot start game. Need at least 2 players.' });
          return;
        }

        io.to(game.id).emit('game:started');

        console.log(`🚀 Game ${game.gameCode} started!`);

        // Start first round after a short delay
        setTimeout(() => {
          startNewRound(io, game);
        }, 1000);
      } catch (error) {
        console.error('Error starting game:', error);
        socket.emit('error', { message: 'Failed to start game' });
      }
    });

    // Submit sequence
    socket.on('submitSequence', async (data: { gameId: string; sequence: string[]; reactionTime: number }) => {
      try {
        const playerInfo = socketToPlayer.get(socket.id);
        if (!playerInfo) {
          socket.emit('error', { message: 'Not in a game' });
          return;
        }

        const game = getGameById(data.gameId);
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const { isCorrect, shouldEliminate } = submitPlayerInput(
          game,
          playerInfo.playerId,
          data.sequence,
          data.reactionTime
        );

        // Check if all players have submitted
        if (allPlayersSubmitted(game)) {
          io.to(game.id).emit('all:submitted');

          // Process round end after a short delay
          setTimeout(() => {
            processRoundEnd(io, game);
          }, 1000);
        }
      } catch (error) {
        console.error('Error submitting sequence:', error);
        socket.emit('error', { message: 'Failed to submit sequence' });
      }
    });

    // Play again (host only)
    socket.on('playAgain', async (data: { gameId: string }) => {
      try {
        const playerInfo = socketToPlayer.get(socket.id);
        if (!playerInfo) {
          socket.emit('error', { message: 'Not in a game' });
          return;
        }

        const game = getGameById(data.gameId);
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const player = game.players.find((p) => p.id === playerInfo.playerId);
        if (!player?.isHost) {
          socket.emit('error', { message: 'Only host can restart the game' });
          return;
        }

        resetGame(game);
        io.to(game.id).emit('game:started');

        setTimeout(() => {
          startNewRound(io, game);
        }, 1000);

        console.log(`🔄 Game ${game.gameCode} restarted`);
      } catch (error) {
        console.error('Error restarting game:', error);
        socket.emit('error', { message: 'Failed to restart game' });
      }
    });

    // New game - back to lobby
    socket.on('newGame', async (data: { gameId: string }) => {
      try {
        const playerInfo = socketToPlayer.get(socket.id);
        if (!playerInfo) {
          socket.emit('error', { message: 'Not in a game' });
          return;
        }

        const game = getGameById(data.gameId);
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const player = game.players.find((p) => p.id === playerInfo.playerId);
        if (!player?.isHost) {
          socket.emit('error', { message: 'Only host can create new game' });
          return;
        }

        // Reset game to lobby
        game.status = 'lobby';
        game.currentRound = 0;
        game.sequence = [];
        game.playerInputs.clear();

        game.players.forEach((p) => {
          p.status = 'waiting';
          p.stats = {
            mistakes: 0,
            roundsSurvived: 0,
            totalReactionTime: 0,
            averageReactionTime: 0,
          };
          p.finishedCurrentRound = false;
        });

        io.to(game.id).emit('game:state', { game: getClientGameState(game) });

        console.log(`🆕 Game ${game.gameCode} returned to lobby`);
      } catch (error) {
        console.error('Error creating new game:', error);
        socket.emit('error', { message: 'Failed to create new game' });
      }
    });

    // Leave game
    socket.on('leaveGame', async (data: { gameId: string }) => {
      handlePlayerLeave(io, socket);
    });

    // Disconnect
    socket.on('disconnect', () => {
      handlePlayerLeave(io, socket);
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}

function handlePlayerLeave(io: Server, socket: Socket): void {
  const playerInfo = socketToPlayer.get(socket.id);
  if (!playerInfo) return;

  const game = getGameById(playerInfo.gameId);
  if (!game) {
    socketToPlayer.delete(socket.id);
    return;
  }

  removePlayerFromGame(game, playerInfo.playerId);
  socket.to(game.id).emit('player:left', { playerId: playerInfo.playerId });
  socket.leave(game.id);
  socketToPlayer.delete(socket.id);

  console.log(`👋 Player left game ${game.gameCode}`);
}

function startNewRound(io: Server, game: ReturnType<typeof getGameById>): void {
  if (!game) return;

  const { round, sequence, timeLimit } = startRound(game);

  io.to(game.id).emit('round:start', { round, sequence });

  console.log(`🎯 Round ${round} started for game ${game.gameCode}`);

  // Start time updates
  let remaining = timeLimit;
  const timerInterval = setInterval(() => {
    remaining--;
    io.to(game.id).emit('time:update', { remaining });

    if (remaining <= 0) {
      clearInterval(timerInterval);
      // Force round end for players who didn't submit
      if (!allPlayersSubmitted(game)) {
        processRoundEnd(io, game);
      }
    }
  }, 1000);
}

function processRoundEnd(io: Server, game: ReturnType<typeof getGameById>): void {
  if (!game) return;

  // Mark players who didn't submit as having failed
  game.players.forEach((player) => {
    if (player.status !== 'eliminated' && !player.finishedCurrentRound) {
      // Player didn't submit - mark as failed
      player.finishedCurrentRound = true;
      player.stats.mistakes++;
      
      // In Last Man Standing mode, eliminate them
      if (game.settings.mode === 'lastManStanding') {
        player.status = 'eliminated';
      }
    }
  });

  const results = getRoundResults(game);
  const leaderboard = getLeaderboard(game);
  const eliminatedPlayers = game.players
    .filter((p) => p.status === 'eliminated')
    .map((p) => p.id);

  io.to(game.id).emit('round:end', {
    results,
    leaderboard,
    eliminatedPlayers,
  });

  console.log(`📊 Round ${game.currentRound} ended for game ${game.gameCode}`);

  // Check if game should end
  if (shouldGameEnd(game)) {
    endGame(game);
    const winner = getWinner(game);

    io.to(game.id).emit('game:end', {
      finalLeaderboard: leaderboard,
      winner,
      stats: {
        totalRounds: game.currentRound,
        totalPlayers: game.players.length,
        gameDuration: Date.now() - game.createdAt.getTime(),
      },
    });

    console.log(`🏆 Game ${game.gameCode} ended! Winner: ${winner?.name}`);
  } else {
    // Start next round after leaderboard display
    setTimeout(() => {
      io.to(game.id).emit('next:round:starting', { countdown: 3 });

      setTimeout(() => {
        startNewRound(io, game);
      }, 3000);
    }, 7000); // Show leaderboard for 7 seconds
  }
}
