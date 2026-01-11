import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { COLOR_PALETTE } from '../types/game.types';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Animated background colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {COLOR_PALETTE.slice(0, 6).map((color, index) => (
          <motion.div
            key={color.id}
            className="absolute w-32 h-32 rounded-full opacity-20 blur-xl"
            style={{ backgroundColor: color.color }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
            }}
            transition={{
              duration: 20 + index * 5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        {/* Logo */}
        <motion.div
          className="mb-8"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">
            SIMON
          </h1>
          <p className="text-xl md:text-2xl text-white/80">
            Multiplayer Memory Game
          </p>
        </motion.div>

        {/* Color dots animation */}
        <div className="flex justify-center gap-3 mb-12">
          {COLOR_PALETTE.slice(0, 4).map((color, index) => (
            <motion.div
              key={color.id}
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: color.color }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <Button
            onClick={() => navigate('/host')}
            className="w-full py-6 text-lg bg-white text-purple-600 hover:bg-white/90 flex items-center justify-center gap-3"
            size="lg"
          >
            <Play className="w-6 h-6" />
            Start a Game
          </Button>

          <Button
            onClick={() => navigate('/join')}
            variant="ghost"
            className="w-full py-6 text-lg border-2 border-white text-white hover:bg-white/10 hover:text-white flex items-center justify-center gap-3"
            size="lg"
          >
            <Users className="w-6 h-6" />
            Join a Game
          </Button>
        </div>

      </motion.div>
    </div>
  );
}
