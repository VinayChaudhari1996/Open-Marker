
import React, { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import * as LucideIcons from 'lucide-react';
import { NodeType } from '../types';

interface CustomNodeData {
  label: string;
  description: string;
  type: NodeType;
  icon?: string;
}

// Normalize icon names (e.g. "car-front" -> "CarFront")
const getIconComponent = (name?: string) => {
  if (!name) return LucideIcons.Box;
  if ((LucideIcons as any)[name]) return (LucideIcons as any)[name];
  
  const normalized = name
    .split(/[-_\s]+/)
    .map(part => part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : '')
    .join('');

  if ((LucideIcons as any)[normalized]) return (LucideIcons as any)[normalized];
  return LucideIcons.Box;
};

// Color assignment logic based on service type/name
const getNodeStyles = (label: string, type: string) => {
  const l = label.toLowerCase();
  
  // Storage / Database -> Green / Emerald (Like S3)
  if (l.includes('bucket') || l.includes('s3') || l.includes('storage') || l.includes('drive')) {
    return 'bg-emerald-600 shadow-emerald-900/20';
  }
  
  // Database / RDS -> Blue
  if (l.includes('db') || l.includes('database') || l.includes('sql') || l.includes('postgres')) {
    return 'bg-blue-600 shadow-blue-900/20';
  }
  
  // Compute / Lambda -> Orange
  if (l.includes('lambda') || l.includes('function') || l.includes('compute') || l.includes('server')) {
    return 'bg-orange-500 shadow-orange-900/20';
  }
  
  // Events / Queue -> Pink/Rose
  if (l.includes('queue') || l.includes('topic') || l.includes('sns') || l.includes('sqs') || l.includes('event')) {
    return 'bg-rose-500 shadow-rose-900/20';
  }

  // AI / Logic -> Violet
  if (l.includes('ai') || l.includes('model') || l.includes('brain') || l.includes('bot')) {
    return 'bg-violet-600 shadow-violet-900/20';
  }
  
  // Client / User -> Indigo
  if (l.includes('user') || l.includes('client') || l.includes('app') || l.includes('browser')) {
    return 'bg-indigo-500 shadow-indigo-900/20';
  }

  // Default -> Zinc (Dark Grey)
  return 'bg-zinc-800 dark:bg-zinc-700 shadow-zinc-900/20';
};

const CustomNode = ({ data, isConnectable }: NodeProps<CustomNodeData>) => {
  const IconComponent = useMemo(() => getIconComponent(data.icon), [data.icon]);
  const colorClass = useMemo(() => getNodeStyles(data.label, data.type), [data.label, data.type]);

  return (
    <div className="relative flex flex-col items-center w-[180px]">
      
      {/* 
        ICON CONTAINER 
        - 80x80px Square (w-20 h-20)
        - Colored background based on type
        - Centered Icon
        - Handles: Left (Target), Top (Target), Right (Source)
      */}
      <div className={`
        relative w-20 h-20 
        rounded-2xl 
        flex items-center justify-center 
        text-white 
        shadow-lg transition-transform hover:scale-105 duration-200
        ${colorClass}
      `}>
          {/* Target: Left (Primary Input) */}
          <Handle 
            type="target" 
            position={Position.Left} 
            isConnectable={isConnectable} 
            className="!w-3 !h-3 !bg-white/80 !border-2 !border-transparent hover:!border-blue-500 transition-colors -ml-1.5" 
          />

          {/* Target: Top (Secondary Input / Branching) */}
          <Handle 
            type="target" 
            position={Position.Top} 
            isConnectable={isConnectable} 
            className="!w-3 !h-3 !bg-white/80 !border-2 !border-transparent hover:!border-blue-500 transition-colors -mt-1.5" 
          />
          
          <IconComponent 
            size={40} 
            strokeWidth={1.5}
            className="drop-shadow-sm"
          />

          {/* Source: Right (Output) */}
          <Handle 
            type="source" 
            position={Position.Right} 
            isConnectable={isConnectable} 
            className="!w-3 !h-3 !bg-white/80 !border-2 !border-transparent hover:!border-blue-500 transition-colors -mr-1.5" 
          />
      </div>

      {/* 
        LABEL CONTAINER 
        - Placed below the icon
        - Centered text
      */}
      <div className="mt-3 flex flex-col items-center text-center px-2">
         <span className="font-semibold text-base leading-tight text-zinc-900 dark:text-zinc-100">
             {data.label}
         </span>
         
         {data.description && (
             <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-1 leading-normal max-w-full line-clamp-2">
                 {data.description}
             </span>
         )}
      </div>
    </div>
  );
};

export default memo(CustomNode);
