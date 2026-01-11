import { memo, useCallback } from 'react';
import { motion } from 'motion/react';
import { type GameColor } from '../../types/game.types';
import { playColorByColor } from '../../utils/sound';
import { addAlpha } from '../../utils/colorUtils';
import { cn } from '../ui/utils';

interface ColorButtonProps {
  color: GameColor;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showFeedback?: 'correct' | 'wrong' | null;
  playSound?: boolean;
}

const sizeClasses = {
  small: 'w-12 h-12 sm:w-16 sm:h-16',
  medium: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24',
  large: 'w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32',
};

export const ColorButton = memo(function ColorButton({
  color,
  isActive = false,
  onClick,
  disabled = false,
  size = 'medium',
  showFeedback = null,
  playSound = true,
}: ColorButtonProps) {
  const handleClick = useCallback(() => {
    if (disabled || !onClick) return;
    if (playSound) {
      playColorByColor(color);
    }
    onClick();
  }, [disabled, onClick, playSound, color]);

  const getFeedbackStyles = () => {
    if (showFeedback === 'correct') {
      return {
        boxShadow: `0 0 20px 10px #10B981`,
        border: '4px solid #10B981',
      };
    }
    if (showFeedback === 'wrong') {
      return {
        boxShadow: `0 0 20px 10px #EF4444`,
        border: '4px solid #EF4444',
      };
    }
    return {};
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'rounded-3xl transition-all duration-150 border-4 border-transparent',
        'focus:outline-none focus:ring-4 focus:ring-white/30',
        sizeClasses[size],
        disabled && !isActive && 'opacity-60 cursor-not-allowed',
        !disabled && 'cursor-pointer hover:scale-105 active:scale-95'
      )}
      style={{
        backgroundColor: color.color,
        boxShadow: isActive
          ? `0 0 30px 15px ${addAlpha(color.color, 0.6)}, inset 0 0 20px ${addAlpha('#ffffff', 0.3)}`
          : `0 4px 15px ${addAlpha(color.color, 0.4)}`,
        ...getFeedbackStyles(),
      }}
      animate={{
        scale: isActive ? 1.1 : 1,
        opacity: isActive ? 1 : disabled ? 0.6 : 0.85,
      }}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ duration: 0.15 }}
      aria-label={`${color.name} color button`}
      aria-pressed={isActive}
    >
      {showFeedback === 'correct' && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-white text-2xl font-bold"
        >
          ✓
        </motion.span>
      )}
      {showFeedback === 'wrong' && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-white text-2xl font-bold"
        >
          ✗
        </motion.span>
      )}
    </motion.button>
  );
});

export default ColorButton;
