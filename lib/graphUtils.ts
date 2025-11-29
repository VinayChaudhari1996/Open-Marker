
import { Edge, Node, MarkerType, Position } from 'reactflow';
import { GraphData } from '../types';

declare const dagre: any;

export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  if (typeof dagre === 'undefined') return { nodes, edges };

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Node dimensions (w-[180px] in CustomNode + spacing)
  const nodeWidth = 220; 
  const nodeHeight = 160; 

  // Switch to Left-to-Right (LR) layout
  // ranksep: horizontal distance between nodes
  // nodesep: vertical distance between nodes in the same rank
  dagreGraph.setGraph({ rankdir: 'LR', ranksep: 140, nodesep: 60 });

  const layoutNodes = nodes.filter(n => n.type !== 'note');
  const noteNodes = nodes.filter(n => n.type === 'note');

  layoutNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    const sourceExists = layoutNodes.find(n => n.id === edge.source);
    const targetExists = layoutNodes.find(n => n.id === edge.target);
    if (sourceExists && targetExists) {
        dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = layoutNodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      // Hint to React Flow about handle positions
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      position: {
        x: nodeWithPosition ? nodeWithPosition.x - nodeWidth / 2 : 0,
        y: nodeWithPosition ? nodeWithPosition.y - nodeHeight / 2 : 0,
      },
    };
  });

  return { nodes: [...layoutedNodes, ...noteNodes], edges };
};

export const transformDataToFlow = (data: GraphData, edgeType = 'smoothstep', isDarkMode = false) => {
    const nodesData = Array.isArray(data.nodes) ? data.nodes : [];
    const edgesData = Array.isArray(data.edges) ? data.edges : [];

    if (nodesData.length === 0) return { nodes: [], edges: [] };

    const flowNodes: Node[] = nodesData.map(n => ({
        id: n.id,
        type: 'custom', 
        position: { x: 0, y: 0 },
        data: { 
          label: n.data?.label || n.label || 'Node', 
          description: n.data?.description || n.description || '', 
          type: n.data?.type || n.type || 'service',
          icon: n.data?.icon
        }
    }));

    const color = isDarkMode ? '#FFFFFF' : '#000000';
    const bgColor = isDarkMode ? '#212121' : '#FFFFFF'; 

    const flowEdges: Edge[] = edgesData.map((e, i) => ({
        id: e.id || `e${i}`,
        source: e.source,
        target: e.target,
        label: e.label,
        type: edgeType,
        animated: false,
        style: { stroke: color, strokeWidth: 2 }, 
        
        labelStyle: { 
            fill: color, 
            fontWeight: 500, 
            fontSize: 12, 
            fontFamily: 'Figtree',
        }, 
        
        labelShowBg: true,
        labelBgStyle: { 
            fill: bgColor,
            fillOpacity: 1, 
        },
        labelBgPadding: [8, 5] as [number, number],
        labelBgBorderRadius: 8, 
        
        markerEnd: {
            ...(typeof e.markerEnd === 'object' ? e.markerEnd : { type: MarkerType.ArrowClosed }),
            color: color,
            width: 16,
            height: 16,
        },
    }));

    return getLayoutedElements(flowNodes, flowEdges);
};
