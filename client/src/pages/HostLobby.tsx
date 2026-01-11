import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useGameContext } from '../contexts/GameContext';
import HostSetup from '../components/lobby/HostSetup';
import LobbyWaiting from '../components/lobby/LobbyWaiting';
import { Button } from '../components/ui/button';

export default function HostLobby() {
  const navigate = useNavigate();
  const {
    game,
    isLoading,
    error,
    createGame,
    startGame,
    leaveGame,
    refreshColors,
    clearError,
  } = useGameContext();

  // Navigate to game when game starts
  useEffect(() => {
    if (game?.status === 'playing') {
      navigate(`/game/${game.id}`);
    }
  }, [game?.status, game?.id, navigate]);

  const handleBack = () => {
    if (game) {
      leaveGame();
    }
    navigate('/');
  };

  const isLobby = game?.status === 'lobby';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4"
      >
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </motion.div>

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>{error}</span>
          <button onClick={clearError} className="ml-2 hover:text-white/80">
            ✕
          </button>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {!isLobby ? (
          <HostSetup onCreate={createGame} isLoading={isLoading} />
        ) : (
          <LobbyWaiting
            game={game}
            isHost={true}
            onStart={startGame}
            onLeave={handleBack}
            onRefreshColors={refreshColors}
          />
        )}
      </motion.div>
    </div>
  );
}
