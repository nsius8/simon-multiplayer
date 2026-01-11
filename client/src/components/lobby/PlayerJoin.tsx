import { useState, useRef, useCallback, memo } from 'react';
import { motion } from 'motion/react';
import { QrCode } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface PlayerJoinProps {
  onJoin: (code: string, name: string) => void;
  error?: string;
  isLoading?: boolean;
  initialCode?: string;
  className?: string;
}

export const PlayerJoin = memo(function PlayerJoin({
  onJoin,
  error,
  isLoading = false,
  initialCode = '',
  className = '',
}: PlayerJoinProps) {
  const [code, setCode] = useState(initialCode.toUpperCase().slice(0, 6));
  const [name, setName] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = useCallback(
    (index: number, value: string) => {
      const char = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
      const newCode = code.split('');
      newCode[index] = char;
      const updatedCode = newCode.join('');
      setCode(updatedCode);

      // Auto-advance to next input
      if (char && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [code]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [code]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData
      .getData('text')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
    setCode(pastedText);
    inputRefs.current[Math.min(pastedText.length, 5)]?.focus();
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (code.length === 6 && name.trim()) {
        onJoin(code, name.trim());
      }
    },
    [code, name, onJoin]
  );

  const isValid = code.length === 6 && name.trim().length > 0;

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full',
        className
      )}
    >
      <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Join Game
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Game Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Game Code
          </label>
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <motion.input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={code[index] || ''}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={cn(
                  'w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg',
                  'focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
                  'transition-colors duration-200',
                  error
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-gray-50'
                )}
                animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm text-center mt-2"
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Player Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Join Button */}
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Joining...' : 'Join Game'}
        </Button>

        {/* QR Scanner option */}
        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
          <QrCode className="w-4 h-4" />
          <span>Or scan QR code to join</span>
        </div>
      </form>
    </div>
  );
});

export default PlayerJoin;
