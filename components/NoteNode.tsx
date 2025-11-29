
import React, { memo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';

interface NoteNodeData {
  label: string;
  color?: 'black' | 'blue' | 'red';
}

const NoteNode = ({ data, selected }: NodeProps<NoteNodeData>) => {
  // Determine text color based on prop, default to black/dark-mode-compatible
  let textColorClass = 'text-black dark:text-zinc-100';
  if (data.color === 'blue') textColorClass = 'text-blue-600 dark:text-blue-400';
  if (data.color === 'red') textColorClass = 'text-red-600 dark:text-red-400';

  return (
    <div 
      className={`
        relative p-4 min-w-[150px] max-w-[400px] transition-all duration-200
        ${selected ? 'ring-2 ring-zinc-300 ring-dashed rounded-lg bg-zinc-50/50 dark:bg-zinc-800/30' : 'hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20 rounded-lg'}
      `}
    >
      <div 
        className={`font-handwritten text-2xl leading-snug whitespace-pre-wrap break-words ${textColorClass}`}
        style={{ fontFamily: '"Sedgwick Ave", cursive' }}
      >
        {data.label}
      </div>
      
      {/* Invisible handles to prevent React Flow warnings if edges are accidentally connected */}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

export default memo(NoteNode);
