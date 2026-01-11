import { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'motion/react';
import { type GameColor, type GameSpeed, getSpeedDelay } from '../../types/game.types';
import { getColorById } from '../../utils/colorUtils';
import { playColorByColor } from '../../utils/sound';
import ColorButton from './ColorButton';

interface SequenceDisplayProps {
  sequence: string[];
  colors: GameColor[];
  speed: GameSpeed;
  onComplete: () => void;
  className?: string;
}

export const SequenceDisplay = memo(function SequenceDisplay({
  sequence,
  colors,
  speed,
  onComplete,
  className = '',
}: SequenceDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const { color: colorDuration, gap: gapDuration } = getSpeedDelay(speed);

  const playSequence = useCallback(() => {
    setIsPlaying(true);
    setCurrentIndex(-1);

    let index = 0;
    const playNext = () => {
      if (index >= sequence.length) {
        setCurrentIndex(-1);
        setIsPlaying(false);
        onComplete();
        return;
      }

      setCurrentIndex(index);
      const colorId = sequence[index];
      const color = getColorById(colorId);
      if (color) {
        playColorByColor(color, colorDuration);
      }

      index++;
      setTimeout(() => {
        setCurrentIndex(-1);
        setTimeout(playNext, gapDuration);
      }, colorDuration);
    };

    // Start after a brief delay
    setTimeout(playNext, 500);
  }, [sequence, onComplete, colorDuration, gapDuration]);

  useEffect(() => {
    playSequence();
  }, [playSequence]);

  // Get grid layout
  const getGridCols = () => {
    const count = colors.length;
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-3';
  };

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-white text-center"
      >
        Watch Carefully!
      </motion.h2>

      <div className={`grid ${getGridCols()} gap-3 md:gap-4`}>
        {colors.map((color) => {
          const isActive =
            currentIndex >= 0 && sequence[currentIndex] === color.id;
          return (
            <ColorButton
              key={color.id}
              color={color}
              isActive={isActive}
              disabled={true}
              size="large"
              playSound={false}
            />
          );
        })}
      </div>

      {/* Sequence progress indicators */}
      <div className="flex gap-2">
        {sequence.map((_, index) => (
          <motion.div
            key={index}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              index <= currentIndex
                ? 'bg-white'
                : 'bg-white/30'
            }`}
            animate={{
              scale: index === currentIndex ? 1.3 : 1,
            }}
          />
        ))}
      </div>

      {isPlaying && (
        <p className="text-white/70 text-sm">
          Showing {currentIndex + 1} of {sequence.length}
        </p>
      )}
    </div>
  );
});

export default SequenceDisplay;
