import { useEffect, useState, useCallback, memo } from 'react';
import { motion } from 'motion/react';
import { cn } from '../ui/utils';
import { playTimerWarningSound } from '../../utils/sound';

interface TimerProps {
  timeLimit: number; // in seconds
  onComplete?: () => void;
  warningThreshold?: number; // seconds remaining to trigger warning
  isPaused?: boolean;
  className?: string;
}

export const Timer = memo(function Timer({
  timeLimit,
  onComplete,
  warningThreshold = 5,
  isPaused = false,
  className = '',
}: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [hasPlayedWarning, setHasPlayedWarning] = useState(false);

  useEffect(() => {
    setTimeRemaining(timeLimit);
    setHasPlayedWarning(false);
  }, [timeLimit]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onComplete]);

  // Play warning sound
  useEffect(() => {
    if (
      timeRemaining === warningThreshold &&
      !hasPlayedWarning &&
      timeRemaining > 0
    ) {
      playTimerWarningSound();
      setHasPlayedWarning(true);
    }
  }, [timeRemaining, warningThreshold, hasPlayedWarning]);

  const progress = (timeRemaining / timeLimit) * 100;
  const isWarning = timeRemaining <= warningThreshold && timeRemaining > 0;
  const isCritical = timeRemaining <= 3 && timeRemaining > 0;

  const getColor = useCallback(() => {
    if (isCritical) return '#EF4444'; // Red
    if (isWarning) return '#F59E0B'; // Orange
    return '#3B82F6'; // Blue
  }, [isCritical, isWarning]);

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      role="timer"
      aria-live="polite"
      aria-label={`${timeRemaining} seconds remaining`}
    >
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{
            strokeDashoffset,
            stroke: getColor(),
          }}
          transition={{ duration: 0.3 }}
        />
      </svg>

      {/* Time display */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: isCritical ? [1, 1.1, 1] : 1,
        }}
        transition={{
          repeat: isCritical ? Infinity : 0,
          duration: 0.5,
        }}
      >
        <span
          className={cn(
            'text-3xl font-bold transition-colors duration-300',
            isCritical && 'text-red-500',
            isWarning && !isCritical && 'text-orange-500',
            !isWarning && 'text-white'
          )}
        >
          {timeRemaining}
        </span>
      </motion.div>
    </div>
  );
});

export default Timer;
