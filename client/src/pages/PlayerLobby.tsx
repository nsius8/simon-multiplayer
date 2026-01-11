import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useGameContext } from '../contexts/GameContext';
import PlayerJoin from '../components/lobby/PlayerJoin';
import LobbyWaiting from '../components/lobby/LobbyWaiting';
import { Button } from '../components/ui/button';

export default function PlayerLobby() {
  const navigate = useNavigate();
  const { code } = useParams<{ code?: string }>();
  const {
    game,
    isLoading,
    error,
    joinGame,
    leaveGame,
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

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {!isLobby ? (
          <PlayerJoin
            onJoin={joinGame}
            error={error || undefined}
            isLoading={isLoading}
            initialCode={code || ''}
          />
        ) : (
          <LobbyWaiting
            game={game}
            isHost={false}
            onLeave={handleBack}
          />
        )}
      </motion.div>
    </div>
  );
}
