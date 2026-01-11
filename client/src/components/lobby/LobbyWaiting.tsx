import { useState, useCallback, memo } from 'react';
import { Copy, Check, Users, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { type GameState, MIN_PLAYERS_TO_START } from '../../types/game.types';
import { getGameUrl } from '../../utils/gameUtils';
import QRCode from '../shared/QRCode';
import ColorPreview from './ColorPreview';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface LobbyWaitingProps {
  game: GameState;
  isHost: boolean;
  onStart?: () => void;
  onLeave: () => void;
  onRefreshColors?: () => void;
  className?: string;
}

export const LobbyWaiting = memo(function LobbyWaiting({
  game,
  isHost,
  onStart,
  onLeave,
  onRefreshColors,
  className = '',
}: LobbyWaitingProps) {
  const [copied, setCopied] = useState(false);

  const gameUrl = getGameUrl(game.gameCode);

  const copyGameCode = useCallback(() => {
    navigator.clipboard.writeText(game.gameCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [game.gameCode]);

  const copyGameUrl = useCallback(() => {
    navigator.clipboard.writeText(gameUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [gameUrl]);

  const canStart = game.players.length >= MIN_PLAYERS_TO_START;

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-4xl w-full',
        className
      )}
    >
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Game Lobby
      </h1>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Left Side - Game Code & QR */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Code
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 px-4 py-3 rounded-lg font-mono text-2xl font-bold text-center tracking-widest">
                {game.gameCode}
              </div>
              <button
                onClick={copyGameCode}
                className="p-3 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                title="Copy game code"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-purple-600" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-center mb-4">
              <QRCode value={gameUrl} size={180} />
            </div>
            <p className="text-sm text-center text-gray-600">
              Scan to join game
            </p>
            <Button
              variant="outline"
              onClick={copyGameUrl}
              className="w-full mt-3"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>

          {/* Game Settings */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-3">Game Settings</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty:</span>
                <span className="font-medium">
                  {game.settings.difficulty} colors
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Speed:</span>
                <span className="font-medium capitalize">
                  {game.settings.speed}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mode:</span>
                <span className="font-medium">
                  {game.settings.mode === 'lastManStanding'
                    ? 'Last Man Standing'
                    : `Best of ${game.settings.rounds}`}
                </span>
              </div>
            </div>

            {/* Color Preview */}
            <div className="mt-4">
              <ColorPreview
                colors={game.settings.selectedColors}
                onRefresh={isHost ? onRefreshColors : undefined}
                showRefresh={isHost}
              />
            </div>
          </div>
        </div>

        {/* Right Side - Players */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="font-semibold">
                  Players ({game.players.length}/10)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {game.players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{player.name}</span>
                      {player.isHost && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {player.isHost ? 'Host' : 'Player'}
                    </span>
                  </div>
                  <Check className="w-5 h-5 text-green-500" />
                </motion.div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 10 - game.players.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="h-16 border-2 border-dashed border-gray-200 rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {isHost ? (
          <>
            <Button
              onClick={onStart}
              disabled={!canStart}
              className={cn(
                'flex-1 py-4 text-lg',
                canStart
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  : 'bg-gray-400 cursor-not-allowed'
              )}
            >
              {canStart
                ? 'Start Game'
                : `Need ${MIN_PLAYERS_TO_START - game.players.length} more player(s)`}
            </Button>
            <Button variant="outline" onClick={onLeave} className="sm:w-auto">
              Leave Game
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1 text-center py-4">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"
                />
                <span>Waiting for host to start...</span>
              </div>
            </div>
            <Button variant="outline" onClick={onLeave}>
              Leave Game
            </Button>
          </>
        )}
      </div>
    </div>
  );
});

export default LobbyWaiting;
