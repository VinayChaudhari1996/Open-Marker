

import { Edge, Node, MarkerType, Position } from 'reactflow';

declare const dagre: any;

// Dimensions
const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;

export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  if (typeof dagre === 'undefined' || nodes.length === 0) return { nodes, edges };

  const g = new dagre.graphlib.Graph({ compound: true });
  g.setDefaultEdgeLabel(() => ({}));

  // HORIZONTAL LAYOUT SETTINGS
  g.setGraph({ 
    rankdir: 'LR', // Left-to-Right flow
    align: 'DL',   
    ranksep: 100,   // Horizontal gap between ranks
    nodesep: 50,   // Vertical gap between nodes
    marginx: 50, 
    marginy: 50,
    edgesep: 50,
    ranker: 'network-simplex'
  });

  nodes.forEach((node) => {
    const isContainer = node.data?.isContainer;
    
    if (isContainer) {
       // Initial placeholder size, Dagre will expand this based on children
       g.setNode(node.id, { width: 300, height: 200 }); 
    } else {
       g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }
    
    if (node.parentId) {
      g.setParent(node.id, node.parentId);
    }
  });

  edges.forEach((edge) => {
    // Only route valid edges
    if (nodes.some(n => n.id === edge.source) && nodes.some(n => n.id === edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    const isContainer = node.data?.isContainer;
    
    if (!pos) return node;

    let w = pos.width;
    let h = pos.height;

    // Add padding to containers so they don't look cramped
    if (isContainer) {
        w += 60; 
        h += 60;
    }

    let x = pos.x - w / 2;
    let y = pos.y - h / 2;

    // Correct for compound node coordinates (Dagre vs ReactFlow parent-relative)
    if (node.parentId) {
      const parent = g.node(node.parentId);
      if (parent) {
         // Calculate parent's top-left corner including the padding we added above
         const parentWidth = parent.width + 60;
         const parentHeight = parent.height + 60;
         const parentX = parent.x - parentWidth / 2;
         const parentY = parent.y - parentHeight / 2;
         
         x = x - parentX;
         y = y - parentY;
      }
    }

    return {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      position: { x, y },
      style: isContainer ? { width: w, height: h } : undefined,
      width: w,
      height: h
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const transformDataToFlow = (data: { nodes: any[], edges: any[] }, isDarkMode = false) => {
  const nodes = (data.nodes || []).map(n => ({
    id: n.id,
    type: n.type || 'custom',
    parentId: n.parentId,
    position: { x: 0, y: 0 },
    data: { 
      label: n.data?.label || n.label, 
      description: n.data?.description || n.description, 
      icon: n.data?.icon,
      isContainer: !!n.data?.isContainer,
      variant: n.data?.variant // Pass through variant (blue/orange)
    }
  }));

  const edgeColor = isDarkMode ? '#71717a' : '#94a3b8';
  const textColor = isDarkMode ? '#a1a1aa' : '#64748b';

  const edges = (data.edges || []).map((e, i) => ({
    id: e.id || `e${i}`,
    source: e.source,
    target: e.target,
    label: e.label,
    type: 'smoothstep', // Smooth curved lines for horizontal flow
    animated: false,
    style: { stroke: edgeColor, strokeWidth: 1.5 },
    labelStyle: { fill: textColor, fontSize: 11, fontWeight: 500, fontFamily: 'Figtree' },
    labelShowBg: true,
    labelBgStyle: { fill: isDarkMode ? '#09090b' : '#ffffff' },
    labelBgPadding: [6, 4] as [number, number],
    markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor, width: 6, height: 6 }
  }));

  return getLayoutedElements(nodes, edges);
};