import { useEffect, memo } from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { type LeaderboardEntry, type Player, type GameMode } from '../../types/game.types';
import { formatReactionTime } from '../../utils/gameUtils';
import { playSuccessSound } from '../../utils/sound';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface FinalLeaderboardProps {
  finalResults: LeaderboardEntry[];
  winner: Player;
  mode: GameMode;
  isHost: boolean;
  onPlayAgain?: () => void;
  onNewGame?: () => void;
  onLeave: () => void;
  className?: string;
}

const medalColors = {
  1: 'from-yellow-400 to-yellow-600',
  2: 'from-gray-300 to-gray-500',
  3: 'from-orange-400 to-orange-600',
};

const medalIcons = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export const FinalLeaderboard = memo(function FinalLeaderboard({
  finalResults,
  winner,
  mode,
  isHost,
  onPlayAgain,
  onNewGame,
  onLeave,
  className = '',
}: FinalLeaderboardProps) {
  // Play celebration sound on mount
  useEffect(() => {
    playSuccessSound();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full relative overflow-hidden',
        className
      )}
    >
      {/* Confetti effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'][
                Math.floor(Math.random() * 5)
              ],
            }}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{
              y: '100vh',
              opacity: 0,
              rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 relative z-10">
        Game Over!
      </h1>

      {/* Winner announcement */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.3 }}
        className="text-center mb-8 relative z-10"
      >
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <motion.h2
          className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🏆 {winner.name} Wins! 🏆
        </motion.h2>
      </motion.div>

      {/* Final Standings */}
      <div className="space-y-3 mb-8 relative z-10">
        <h3 className="font-semibold text-gray-700 text-lg">Final Standings</h3>

        {finalResults.map((entry, index) => (
          <motion.div
            key={entry.playerId}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className={cn(
              'flex items-center justify-between p-4 rounded-lg',
              index < 3
                ? `bg-gradient-to-r ${medalColors[index + 1 as 1 | 2 | 3]} text-white`
                : 'bg-gray-100'
            )}
          >
            <div className="flex items-center gap-3">
              {index < 3 ? (
                <span className="text-2xl">{medalIcons[index + 1 as 1 | 2 | 3]}</span>
              ) : (
                <span className="font-bold text-gray-600 w-8 text-center">
                  {index + 1}th
                </span>
              )}
              <div>
                <p className="font-semibold">{entry.playerName}</p>
                <p className={cn('text-sm', index < 3 ? 'opacity-90' : 'text-gray-600')}>
                  {mode === 'lastManStanding'
                    ? `${entry.roundsSurvived} rounds`
                    : `${entry.mistakes} mistakes`}
                </p>
              </div>
            </div>
            <div className={cn('text-sm', index < 3 ? 'opacity-90' : 'text-gray-600')}>
              Avg: {formatReactionTime(entry.averageTime)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        {isHost ? (
          <>
            <Button
              onClick={onPlayAgain}
              className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Play Again
            </Button>
            <Button variant="outline" onClick={onNewGame} className="flex-1 py-4">
              New Game
            </Button>
          </>
        ) : (
          <div className="flex-1 text-center py-4 text-gray-600">
            Waiting for host...
          </div>
        )}
        <Button variant="ghost" onClick={onLeave}>
          Leave Game
        </Button>
      </div>
    </motion.div>
  );
});

export default FinalLeaderboard;
