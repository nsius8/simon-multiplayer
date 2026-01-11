import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Volume2, VolumeX, LogOut } from 'lucide-react';
import { useGameContext } from '../contexts/GameContext';
import GameBoard from '../components/game/GameBoard';
import RoundLeaderboard from '../components/leaderboard/RoundLeaderboard';
import FinalLeaderboard from '../components/leaderboard/FinalLeaderboard';
import { Button } from '../components/ui/button';
import { playersToLeaderboard, getWinner } from '../utils/gameUtils';

type GamePhase = 'playing' | 'roundEnd' | 'gameEnd';

export default function Game() {
  const navigate = useNavigate();
  useParams<{ gameId: string }>();
  const {
    game,
    player,
    muted,
    toggleMute,
    submitSequence,
    playAgain,
    newGame,
    leaveGame,
    isRoundEnded,
    roundEndData,
    clearRoundEnd,
  } = useGameContext();

  const [phase, setPhase] = useState<GamePhase>('playing');

  // Redirect if no game
  useEffect(() => {
    if (!game) {
      navigate('/');
    }
  }, [game, navigate]);

  // Handle game status changes
  useEffect(() => {
    if (game?.status === 'finished') {
      setPhase('gameEnd');
    }
  }, [game?.status]);

  // Handle round end
  useEffect(() => {
    if (isRoundEnded && roundEndData) {
      setPhase('roundEnd');
    }
  }, [isRoundEnded, roundEndData]);

  const handleSubmitSequence = useCallback(
    (sequence: string[], reactionTime: number) => {
      submitSequence(sequence, reactionTime);
    },
    [submitSequence]
  );

  const handleContinue = useCallback(() => {
    setPhase('playing');
    clearRoundEnd();
  }, [clearRoundEnd]);

  const handleLeave = useCallback(() => {
    leaveGame();
    navigate('/');
  }, [leaveGame, navigate]);

  const handlePlayAgain = useCallback(() => {
    playAgain();
    setPhase('playing');
  }, [playAgain]);

  const handleNewGame = useCallback(() => {
    newGame();
    navigate('/host');
  }, [newGame, navigate]);

  if (!game || !player) {
    return null;
  }

  const isHost = player.isHost;
  const leaderboard = playersToLeaderboard(game.players, game.settings.mode);
  const winner = getWinner(game.players, game.settings.mode);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10"
      >
        <div className="text-white">
          <span className="font-semibold">Round {game.currentRound}</span>
          {game.settings.mode === 'bestOfX' && game.settings.rounds && (
            <span className="text-white/70 ml-2">
              / {game.settings.rounds}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-white hover:bg-white/10"
          >
            {muted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLeave}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 pt-20">
        {phase === 'playing' && (
          <GameBoard
            game={game}
            playerId={player.id}
            onSubmit={handleSubmitSequence}
          />
        )}

        {phase === 'roundEnd' && roundEndData && (
          <RoundLeaderboard
            results={roundEndData.results}
            mode={game.settings.mode}
            round={game.currentRound}
            totalRounds={game.settings.rounds}
            onContinue={handleContinue}
          />
        )}

        {phase === 'gameEnd' && winner && (
          <FinalLeaderboard
            finalResults={leaderboard}
            winner={winner}
            mode={game.settings.mode}
            isHost={isHost}
            onPlayAgain={handlePlayAgain}
            onNewGame={handleNewGame}
            onLeave={handleLeave}
          />
        )}
      </main>

      {/* Player status bar */}
      {player.status === 'eliminated' && phase === 'playing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-red-500/90 text-white text-center py-3 px-4 rounded-lg"
        >
          You've been eliminated! Watching the game...
        </motion.div>
      )}
    </div>
  );
}
