import { useState, useEffect, memo } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { getRandomJoke } from '../../utils/jokes';
import { cn } from '../ui/utils';

interface WaitingScreenProps {
  remainingTime?: number;
  playersRemaining?: number;
  totalPlayers?: number;
  className?: string;
}

export const WaitingScreen = memo(function WaitingScreen({
  remainingTime,
  playersRemaining,
  totalPlayers,
  className = '',
}: WaitingScreenProps) {
  const [joke, setJoke] = useState(getRandomJoke);

  // Change joke every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setJoke(getRandomJoke());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex flex-col items-center justify-center gap-6 p-8',
        className
      )}
    >
      {/* Success indicator */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
      >
        <Check className="w-8 h-8 text-white" />
      </motion.div>

      <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
        Sequence Submitted!
      </h2>

      {/* Loading animation */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-white rounded-full"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <p className="text-white/80 text-lg">Waiting for other players...</p>

      {/* Joke card */}
      <motion.div
        key={joke}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md text-center"
      >
        <p className="text-2xl mb-3">🎨</p>
        <p className="text-white/90 text-lg italic">{joke}</p>
      </motion.div>

      {/* Player status */}
      {playersRemaining !== undefined && totalPlayers !== undefined && (
        <div className="text-white/70 text-sm">
          <p>
            {playersRemaining} of {totalPlayers} players still thinking...
          </p>
        </div>
      )}

      {/* Remaining time */}
      {remainingTime !== undefined && remainingTime > 0 && (
        <p className="text-white/60 text-sm">
          Time remaining: {remainingTime}s
        </p>
      )}
    </motion.div>
  );
});

export default WaitingScreen;
