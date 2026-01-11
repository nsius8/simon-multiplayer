import { useState, useEffect, memo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Check, X } from 'lucide-react';
import { type RoundResult, type GameMode, LEADERBOARD_DISPLAY_TIME } from '../../types/game.types';
import { formatReactionTime } from '../../utils/gameUtils';
import { cn } from '../ui/utils';

interface RoundLeaderboardProps {
  results: RoundResult[];
  mode: GameMode;
  round: number;
  totalRounds?: number;
  autoAdvanceTime?: number;
  className?: string;
}

export const RoundLeaderboard = memo(function RoundLeaderboard({
  results,
  mode,
  round,
  totalRounds,
  autoAdvanceTime = LEADERBOARD_DISPLAY_TIME,
  className = '',
}: RoundLeaderboardProps) {
  const [countdown, setCountdown] = useState(Math.ceil(autoAdvanceTime / 1000));

  // Countdown is just for visual feedback - server controls the actual transition
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Don't call onContinue here - let the server control the transition
          // via 'next:round:starting' event
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Sort results
  const sortedResults = [...results].sort((a, b) => {
    if (mode === 'lastManStanding') {
      // Correct players first, sorted by reaction time
      if (a.isCorrect !== b.isCorrect) return a.isCorrect ? -1 : 1;
      return a.reactionTime - b.reactionTime;
    } else {
      // Best of X: Sort by mistakes, then reaction time
      if (a.mistakes !== b.mistakes) return a.mistakes - b.mistakes;
      return a.reactionTime - b.reactionTime;
    }
  });

  const fastestCorrect = sortedResults.find((r) => r.isCorrect);
  const stillPlaying = sortedResults.filter((r) => !r.isEliminated);
  const eliminated = sortedResults.filter((r) => r.isEliminated);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full',
        className
      )}
    >
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
        Round {round} Complete!
      </h1>
      {mode === 'bestOfX' && totalRounds && (
        <p className="text-center text-gray-600 mb-6">
          Round {round} of {totalRounds}
        </p>
      )}

      {/* Fastest Player */}
      {fastestCorrect && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-4 mb-6 flex items-center gap-3"
        >
          <Trophy className="w-8 h-8 text-white" />
          <div className="text-white">
            <p className="font-bold text-lg">Fastest: {fastestCorrect.playerName}</p>
            <p className="text-sm opacity-90">
              {formatReactionTime(fastestCorrect.reactionTime)}
            </p>
          </div>
        </motion.div>
      )}

      {/* Leaderboard based on mode */}
      {mode === 'lastManStanding' ? (
        <>
          {/* Still Playing */}
          {stillPlaying.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-green-700 mb-3">Still Playing</h3>
              <div className="space-y-2">
                {stillPlaying.map((result, index) => (
                  <motion.div
                    key={result.playerId}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-green-700">
                        {index + 1}.
                      </span>
                      <span className="font-medium">{result.playerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-600">
                        {formatReactionTime(result.reactionTime)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Eliminated This Round */}
          {eliminated.length > 0 && (
            <div>
              <h3 className="font-semibold text-red-700 mb-3">
                Eliminated This Round
              </h3>
              <div className="space-y-2">
                {eliminated.map((result, index) => (
                  <motion.div
                    key={result.playerId}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: (stillPlaying.length + index) * 0.1 }}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-red-700">
                        {result.playerName}
                      </span>
                    </div>
                    <X className="w-5 h-5 text-red-600" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Best of X mode */
        <div className="space-y-2">
          {sortedResults.map((result, index) => (
            <motion.div
              key={result.playerId}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg',
                result.isCorrect ? 'bg-green-50' : 'bg-red-50'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-700">{index + 1}.</span>
                <span className="font-medium">{result.playerName}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {result.mistakes} mistake{result.mistakes !== 1 ? 's' : ''}
                </span>
                <span className="text-sm text-gray-600">
                  Avg: {formatReactionTime(result.reactionTime)}
                </span>
                {result.isCorrect ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-red-600" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Countdown */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Next round starting in {countdown} seconds...
        </p>
        <div className="flex justify-center gap-2 mt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                'w-3 h-3 rounded-full',
                i < countdown ? 'bg-purple-600' : 'bg-gray-300'
              )}
              animate={{
                scale: i === countdown - 1 ? [1, 1.3, 1] : 1,
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
});

export default RoundLeaderboard;
