
import React from 'react';
import { Copy, Check } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onCopy: () => void;
  isCopying: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onCopy, isCopying }) => {
  return (
    <div 
      className="absolute z-50 min-w-[10rem] overflow-hidden rounded-md border border-zinc-200 bg-white p-1 shadow-md animate-in fade-in zoom-in-95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
      style={{ top: y, left: x }}
    >
      <div 
          onClick={(e) => { e.stopPropagation(); onCopy(); }}
          className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus:bg-zinc-800 dark:focus:text-zinc-50"
      >
          {isCopying ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
          <span className="flex-1">Copy as PNG</span>
      </div>
    </div>
  );
};

export default ContextMenu;
