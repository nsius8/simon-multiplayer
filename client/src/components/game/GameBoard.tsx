import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { motion } from 'motion/react';
import { type GameState, calculateTimeLimit } from '../../types/game.types';
import { playSuccessSound, playErrorSound } from '../../utils/sound';
import { groupIntoRows } from '../../utils/colorUtils';
import ColorButton from './ColorButton';
import Timer from './Timer';
import SequenceDisplay from './SequenceDisplay';
import WaitingScreen from './WaitingScreen';
import { cn } from '../ui/utils';

type GamePhase = 'watching' | 'input' | 'waiting' | 'result';

interface GameBoardProps {
  game: GameState;
  playerId: string;
  onSubmit: (sequence: string[], reactionTime: number) => void;
  className?: string;
}

export const GameBoard = memo(function GameBoard({
  game,
  playerId,
  onSubmit,
  className = '',
}: GameBoardProps) {
  const [phase, setPhase] = useState<GamePhase>('watching');
  const [playerInput, setPlayerInput] = useState<string[]>([]);
  const [inputStartTime, setInputStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong' | null>>({});
  const lastRoundRef = useRef(game.currentRound);

  // Reset phase when a new round starts
  useEffect(() => {
    if (game.currentRound !== lastRoundRef.current) {
      lastRoundRef.current = game.currentRound;
      setPhase('watching');
      setPlayerInput([]);
      setFeedback({});
    }
  }, [game.currentRound]);

  const colors = game.settings.selectedColors;
  const sequence = game.sequence;
  const timeLimit = calculateTimeLimit(sequence.length);

  const handleSequenceComplete = useCallback(() => {
    setPhase('input');
    setPlayerInput([]);
    setInputStartTime(Date.now());
    setFeedback({});
  }, []);

  const handleColorClick = useCallback(
    (colorId: string) => {
      if (phase !== 'input') return;

      const newInput = [...playerInput, colorId];
      setPlayerInput(newInput);

      // Check if this click is correct so far
      const expectedColorId = sequence[newInput.length - 1];
      const isCorrect = colorId === expectedColorId;

      if (!isCorrect) {
        // Wrong color - show feedback and submit
        setFeedback((prev) => ({ ...prev, [colorId]: 'wrong' }));
        playErrorSound();
        setTimeout(() => {
          const reactionTime = Date.now() - inputStartTime;
          onSubmit(newInput, reactionTime);
          setPhase('waiting');
        }, 500);
        return;
      }

      // Correct so far
      setFeedback((prev) => ({ ...prev, [colorId]: 'correct' }));

      // Check if sequence is complete
      if (newInput.length === sequence.length) {
        playSuccessSound();
        setTimeout(() => {
          const reactionTime = Date.now() - inputStartTime;
          onSubmit(newInput, reactionTime);
          setPhase('waiting');
        }, 300);
      }

      // Clear feedback after a moment
      setTimeout(() => {
        setFeedback((prev) => ({ ...prev, [colorId]: null }));
      }, 200);
    },
    [phase, playerInput, sequence, inputStartTime, onSubmit]
  );

  const handleTimerComplete = useCallback(() => {
    if (phase === 'input') {
      const reactionTime = Date.now() - inputStartTime;
      onSubmit(playerInput, reactionTime);
      setPhase('waiting');
    }
  }, [phase, playerInput, inputStartTime, onSubmit]);

  // Group colors into rows for custom layout
  const colorRows = groupIntoRows(colors);

  const player = game.players.find((p) => p.id === playerId);
  const playersRemaining = game.players.filter(
    (p) => !p.finishedCurrentRound && p.status !== 'eliminated'
  ).length;

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Round indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold">Round {game.currentRound}</h1>
        {game.settings.mode === 'bestOfX' && game.settings.rounds && (
          <p className="text-white/70 text-sm">
            {game.currentRound} of {game.settings.rounds}
          </p>
        )}
      </motion.div>

      {/* Watching phase */}
      {phase === 'watching' && (
        <SequenceDisplay
          sequence={sequence}
          colors={colors}
          speed={game.settings.speed}
          onComplete={handleSequenceComplete}
        />
      )}

      {/* Input phase */}
      {phase === 'input' && (
        <>
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            Your Turn!
          </motion.h2>

          <Timer
            timeLimit={timeLimit}
            onComplete={handleTimerComplete}
            warningThreshold={5}
          />

          {/* Fixed width container for consistent layout across different color counts */}
          <div className="flex flex-col gap-3 md:gap-4 w-[276px] sm:w-[372px] md:w-[420px]">
            {colorRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-3 md:gap-4">
                {row.map((color) => (
                  <ColorButton
                    key={color.id}
                    color={color}
                    onClick={() => handleColorClick(color.id)}
                    disabled={player?.status === 'eliminated'}
                    size="large"
                    showFeedback={feedback[color.id]}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Input progress */}
          <div className="flex gap-2">
            {sequence.map((_, index) => (
              <motion.div
                key={index}
                className={cn(
                  'w-4 h-4 rounded-full border-2 border-white/50',
                  index < playerInput.length
                    ? 'bg-white'
                    : 'bg-transparent'
                )}
                animate={{
                  scale: index === playerInput.length ? 1.2 : 1,
                }}
              />
            ))}
          </div>

          <p className="text-white/70 text-sm">
            {playerInput.length} of {sequence.length} entered
          </p>
        </>
      )}

      {/* Waiting phase */}
      {phase === 'waiting' && (
        <WaitingScreen
          remainingTime={game.roundTimer}
          playersRemaining={playersRemaining}
          totalPlayers={game.players.filter((p) => p.status !== 'eliminated').length}
        />
      )}
    </div>
  );
});

export default GameBoard;
