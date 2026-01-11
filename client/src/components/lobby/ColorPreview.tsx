import { memo } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { type GameColor } from '../../types/game.types';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface ColorPreviewProps {
  colors: GameColor[];
  onRefresh?: () => void;
  showRefresh?: boolean;
  className?: string;
}

export const ColorPreview = memo(function ColorPreview({
  colors,
  onRefresh,
  showRefresh = true,
  className = '',
}: ColorPreviewProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Selected Colors
        </label>
        {showRefresh && onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
          >
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            Refresh Colors
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => (
          <motion.div
            key={color.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="w-12 h-12 md:w-14 md:h-14 rounded-lg shadow-md cursor-default"
            style={{ backgroundColor: color.color }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
});

export default ColorPreview;
