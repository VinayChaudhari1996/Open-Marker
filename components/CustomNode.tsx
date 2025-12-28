
import React, { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import * as LucideIcons from 'lucide-react';
import { cn } from '../lib/utils';

interface CustomNodeData {
  label: string;
  description?: string;
  icon?: string;
  isContainer?: boolean;
  isDrawing?: boolean;
  variant?: 'default' | 'amber' | 'blue'; // New variant prop
}

const getIcon = (name?: string) => {
  if (!name) return LucideIcons.Box;
  const normalized = name.charAt(0).toUpperCase() + name.slice(1);
  return (LucideIcons as any)[normalized] || (LucideIcons as any)[name] || LucideIcons.Box;
};

const CustomNode = ({ data, selected, isConnectable }: NodeProps<CustomNodeData>) => {
  const Icon = useMemo(() => getIcon(data.icon), [data.icon]);
  
  // 1. CONTAINER NODE
  if (data.isContainer) {
    // Determine colors based on variant
    const isAmber = data.variant === 'amber';
    const borderColor = isAmber ? "border-amber-500/80 dark:border-amber-500/80" : "border-blue-500/60 dark:border-blue-400/60";
    const labelColor = isAmber ? "text-amber-700 dark:text-amber-400" : "text-blue-600 dark:text-blue-400";
    const iconColor = isAmber ? "text-amber-600 dark:text-amber-400" : "text-blue-500 dark:text-blue-400";
    const ringColor = isAmber ? "ring-amber-500" : "ring-blue-500";

    return (
      <div className={cn(
        "relative min-w-[300px] h-full w-full rounded-xl border-2 transition-all duration-300 pointer-events-none bg-white/5 dark:bg-white/5",
        borderColor,
        selected ? `ring-1 ${ringColor}` : ""
      )}>
        {/* The Container Label */}
        <div className="absolute -top-3.5 left-4">
            <div className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-[#181818] border rounded-md shadow-sm",
                isAmber ? "border-amber-200 dark:border-amber-900/50" : "border-blue-200 dark:border-blue-900/50"
            )}>
                {data.icon && <Icon size={14} className={iconColor} strokeWidth={2.5} />}
                <span className={cn("text-[11px] font-bold uppercase tracking-widest font-sans", labelColor)}>
                {data.label}
                </span>
            </div>
        </div>
        
        {/* Handles are invisible but necessary for layout routing */}
        <Handle type="target" position={Position.Left} className="!opacity-0" />
        <Handle type="source" position={Position.Right} className="!opacity-0" />
      </div>
    );
  }

  // 2. LEAF NODE (Service Card)
  return (
    <div className={cn(
      "group relative flex flex-col items-center justify-center w-[200px] p-4 rounded-xl transition-all duration-200",
      "bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-700",
      selected ? "ring-2 ring-blue-500 shadow-xl" : "shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600"
    )}>
      {/* Connector Handles - Left/Right for Horizontal Layout */}
      <Handle 
        type="target" 
        position={Position.Left} 
        isConnectable={isConnectable}
        className="!w-2 !h-2 !bg-zinc-400 dark:!bg-zinc-500 !border-2 !border-white dark:!border-zinc-900 !-left-1 opacity-0 group-hover:opacity-100 transition-opacity" 
      />

      {/* Content Layout: Icon Left, Text Right (Horizontal Card) or Stacked */}
      <div className="flex flex-col items-center gap-2 w-full">
          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
            <Icon size={24} strokeWidth={1.5} />
          </div>

          <div className="text-center w-full">
            <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
              {data.label}
            </h3>
            {data.description && (
              <p className="mt-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-2 px-1">
                {data.description}
              </p>
            )}
          </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        isConnectable={isConnectable}
        className="!w-2 !h-2 !bg-zinc-400 dark:!bg-zinc-500 !border-2 !border-white dark:!border-zinc-900 !-right-1 opacity-0 group-hover:opacity-100 transition-opacity" 
      />
    </div>
  );
};

export default memo(CustomNode);
