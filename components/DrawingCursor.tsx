
import React from 'react';
import { Pencil } from 'lucide-react';

interface DrawingCursorProps {
  x: number;
  y: number;
  isVisible: boolean;
  label?: string;
}

const DrawingCursor: React.FC<DrawingCursorProps> = ({ x, y, isVisible, label }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="absolute pointer-events-none z-[1000] transition-all duration-500 ease-in-out"
      style={{ 
        transform: `translate(${x}px, ${y}px)`,
        left: 0,
        top: 0
      }}
    >
      <div className="relative">
        <div className="text-yellow-600 dark:text-yellow-400 animate-bounce">
          <Pencil size={32} strokeWidth={2.5} className="-rotate-45" />
        </div>
        {label && (
          <div className="absolute left-10 top-0 whitespace-nowrap px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-700 rounded text-[10px] font-bold uppercase tracking-wider text-yellow-800 dark:text-yellow-200 shadow-sm animate-in fade-in slide-in-from-left-2">
            Drawing {label}
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingCursor;
