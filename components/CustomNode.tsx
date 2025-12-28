
import React, { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import * as LucideIcons from 'lucide-react';
import { cn } from '../lib/utils';

interface CustomNodeData {
  label: string;
  description?: string;
  icon?: string;
  isContainer?: boolean;
}

const getIconComponent = (name?: string) => {
  if (!name) return null;
  const normalized = name.split(/[-_\s]+/).map(part => part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : '').join('');
  return (LucideIcons as any)[normalized] || (LucideIcons as any)[name] || null;
};

const getThemeStyles = (label: string, isContainer: boolean) => {
  const l = label.toLowerCase();
  
  if (isContainer) {
    // High-level system boundaries (Amber)
    if (l.includes('pipeline') || l.includes('interface') || l.includes('user') || l.includes('ui') || l.includes('system') || l.includes('frontend')) {
      return { border: 'border-[#CC8D39]', text: 'text-[#CC8D39]', bg: 'bg-white' };
    }
    // Functional grouping (Blue)
    return { border: 'border-[#3D78D8]', text: 'text-[#3D78D8]', bg: 'bg-white' };
  }

  return { border: 'border-zinc-300', text: 'text-zinc-900', bg: 'bg-transparent' };
};

const CustomNode = ({ data, selected, isConnectable }: NodeProps<CustomNodeData>) => {
  const IconComponent = useMemo(() => getIconComponent(data.icon), [data.icon]);
  const theme = useMemo(() => getThemeStyles(data.label, !!data.isContainer), [data.label, data.isContainer]);

  if (data.isContainer) {
    return (
      <div className={cn(
        "relative w-full h-full rounded-2xl border-[2.5px] transition-all duration-300",
        theme.border,
        "bg-white/5",
        selected ? "ring-[4px] ring-zinc-400/10" : ""
      )}>
        {/* Container Header Badge */}
        <div className={cn(
          "absolute -top-5 left-6 flex items-center gap-3 px-4 py-2 border-[2.5px] rounded-lg text-[14px] font-bold uppercase tracking-tight bg-white shadow-sm whitespace-nowrap",
          theme.border,
          theme.text
        )}>
          {IconComponent && <IconComponent size={20} strokeWidth={2.5} />}
          {data.label}
        </div>
        
        {/* All 4 Handles for Containers */}
        <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="!opacity-0" />
        <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="!opacity-0" />
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!opacity-0" />
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!opacity-0" />
      </div>
    );
  }

  return (
    <div className={cn(
      "group flex flex-col items-center w-[220px] transition-transform duration-200",
      selected ? "scale-105" : "scale-100"
    )}>
      {/* 4 Handles for Components: Top, Bottom, Left, Right */}
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-zinc-400 !border-none !-left-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-zinc-400 !border-none !-right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-zinc-400 !border-none !-top-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-zinc-400 !border-none !-bottom-3 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Large Floating Outline Icon - Increased to 84px */}
      <div className="w-28 h-28 flex items-center justify-center text-zinc-800 dark:text-zinc-200 mb-4 relative">
        {IconComponent ? (
          <IconComponent size={84} strokeWidth={1} />
        ) : (
          <LucideIcons.Box size={84} strokeWidth={1} />
        )}
      </div>

      <div className="flex flex-col items-center text-center max-w-full space-y-1.5">
        <span className="font-semibold text-[19px] tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
          {data.label}
        </span>
        {data.description && (
          <span className="text-[14px] font-normal text-zinc-500 dark:text-zinc-400 leading-snug">
            {data.description}
          </span>
        )}
      </div>
    </div>
  );
};

export default memo(CustomNode);
