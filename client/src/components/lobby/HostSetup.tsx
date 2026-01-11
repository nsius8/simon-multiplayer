import { useState, useCallback, useEffect, memo } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import {
  type GameSettings,
  type GameSpeed,
  type GameMode,
  selectRandomColors,
  type GameColor,
} from '../../types/game.types';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface HostSetupProps {
  onCreate: (settings: GameSettings, hostName: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const HostSetup = memo(function HostSetup({
  onCreate,
  isLoading = false,
  className = '',
}: HostSetupProps) {
  const [hostName, setHostName] = useState('');
  const [difficulty, setDifficulty] = useState<4 | 5 | 6 | 7 | 8 | 9>(4);
  const [selectedColors, setSelectedColors] = useState<GameColor[]>([]);
  const [speed, setSpeed] = useState<GameSpeed>('medium');
  const [mode, setMode] = useState<GameMode>('lastManStanding');
  const [rounds, setRounds] = useState<5 | 10 | 15 | 20>(10);

  const randomizeColors = useCallback(() => {
    setSelectedColors(selectRandomColors(difficulty));
  }, [difficulty]);

  // Initialize colors on difficulty change
  useEffect(() => {
    randomizeColors();
  }, [difficulty, randomizeColors]);

  const handleDifficultyChange = (newDifficulty: number) => {
    setDifficulty(newDifficulty as 4 | 5 | 6 | 7 | 8 | 9);
  };

  const handleStart = useCallback(() => {
    if (hostName.trim() && selectedColors.length === difficulty) {
      const settings: GameSettings = {
        difficulty,
        selectedColors,
        speed,
        mode,
        rounds: mode === 'bestOfX' ? rounds : undefined,
      };
      onCreate(settings, hostName.trim());
    }
  }, [hostName, difficulty, selectedColors, speed, mode, rounds, onCreate]);

  const isValid = hostName.trim().length > 0 && selectedColors.length === difficulty;

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full',
        className
      )}
    >
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Simon Multiplayer
      </h1>

      <div className="space-y-6">
        {/* Host Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your name"
            maxLength={20}
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty: {difficulty} Colors
          </label>
          <input
            type="range"
            min="4"
            max="9"
            value={difficulty}
            onChange={(e) => handleDifficultyChange(Number(e.target.value))}
            className="w-full accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Easy (4)</span>
            <span>Hard (9)</span>
          </div>
        </div>

        {/* Color Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Selected Colors
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={randomizeColors}
              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
            >
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
              Refresh Colors
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedColors.map((color, index) => (
              <motion.div
                key={color.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="w-12 h-12 md:w-14 md:h-14 rounded-lg shadow-md"
                style={{ backgroundColor: color.color }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Speed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Speed
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['slow', 'medium', 'fast'] as GameSpeed[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={cn(
                  'py-3 px-4 rounded-lg font-medium capitalize transition-colors',
                  speed === s
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Game Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Game Mode
          </label>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setMode('lastManStanding')}
              className={cn(
                'w-full py-3 px-4 rounded-lg text-left transition-colors',
                mode === 'lastManStanding'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <div className="font-medium">Last Man Standing</div>
              <div
                className={cn(
                  'text-sm',
                  mode === 'lastManStanding'
                    ? 'text-purple-100'
                    : 'text-gray-500'
                )}
              >
                Players eliminated on mistakes, continue until 1 remains
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode('bestOfX')}
              className={cn(
                'w-full py-3 px-4 rounded-lg text-left transition-colors',
                mode === 'bestOfX'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <div className="font-medium">Best of X</div>
              <div
                className={cn(
                  'text-sm',
                  mode === 'bestOfX' ? 'text-purple-100' : 'text-gray-500'
                )}
              >
                Winner has fewest mistakes after all rounds
              </div>
            </button>
          </div>
        </div>

        {/* Rounds (for Best of X) */}
        {mode === 'bestOfX' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Rounds
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([5, 10, 15, 20] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRounds(r)}
                  className={cn(
                    'py-3 px-4 rounded-lg font-medium transition-colors',
                    rounds === r
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Start Button */}
        <Button
          type="button"
          onClick={handleStart}
          disabled={!isValid || isLoading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Creating Game...' : 'Create Game'}
        </Button>
      </div>
    </div>
  );
});

export default HostSetup;
