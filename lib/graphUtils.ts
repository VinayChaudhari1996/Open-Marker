
import { Edge, Node, MarkerType, Position } from 'reactflow';

declare const dagre: any;

export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  if (typeof dagre === 'undefined') return { nodes, edges };

  const dagreGraph = new dagre.graphlib.Graph({ compound: true });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Dimensions for large node visual footprint with balanced alignment
  const nodeWidth = 220; 
  const nodeHeight = 200; 

  dagreGraph.setGraph({ 
    rankdir: 'LR', 
    ranksep: 200, // Horizontal separation
    nodesep: 100, // Vertical separation
    marginx: 80, 
    marginy: 80,
    edgesep: 60
  });

  nodes.forEach((node) => {
    const isContainer = node.data?.isContainer;
    dagreGraph.setNode(node.id, { 
        width: isContainer ? 500 : nodeWidth, 
        height: isContainer ? 400 : nodeHeight 
    });
    if (node.parentId) {
      dagreGraph.setParent(node.id, node.parentId);
    }
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const isContainer = node.data?.isContainer;
    
    const containerW = 500;
    const containerH = 400;

    let x = nodeWithPosition.x - (isContainer ? containerW / 2 : nodeWidth / 2);
    let y = nodeWithPosition.y - (isContainer ? containerH / 2 : nodeHeight / 2);

    if (node.parentId) {
        const parent = dagreGraph.node(node.parentId);
        // Ensure relative coordinates inside parent are centered correctly
        x = nodeWithPosition.x - parent.x + (containerW / 2) - (nodeWidth / 2);
        y = nodeWithPosition.y - parent.y + (containerH / 2) - (nodeHeight / 2);
    }

    return {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      position: { x, y },
      style: isContainer ? { width: containerW, height: containerH } : undefined
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const transformDataToFlow = (data: { nodes: any[], edges: any[] }, _defaultEdgeType = 'smoothstep', isDarkMode = false) => {
    const nodesData = Array.isArray(data.nodes) ? data.nodes : [];
    const edgesData = Array.isArray(data.edges) ? data.edges : [];

    const flowNodes: Node[] = nodesData.map(n => ({
        id: n.id,
        type: n.type || 'custom', 
        parentId: n.parentId,
        position: n.position || { x: 0, y: 0 },
        data: { 
          label: n.data?.label || n.label || 'Node', 
          description: n.data?.description || n.description || '', 
          icon: n.data?.icon,
          isContainer: !!n.data?.isContainer
        }
    }));

    // High contrast white for dark mode, dark zinc for light mode
    const edgeColor = isDarkMode ? '#FFFFFF' : '#18181b';
    const textLabelColor = isDarkMode ? '#FFFFFF' : '#18181b';
    const bgColor = isDarkMode ? '#18181b' : '#FFFFFF'; 

    const flowEdges: Edge[] = edgesData.map((e, i) => {
        return {
            id: e.id || `e${i}`,
            source: e.source,
            target: e.target,
            label: e.label,
            type: 'smoothstep',
            animated: !!e.animated,
            pathOptions: { borderRadius: 24 },
            style: { 
              stroke: edgeColor, 
              strokeWidth: 2, // Slightly thicker for visibility
            }, 
            labelStyle: { 
              fill: textLabelColor, 
              fontWeight: 600, 
              fontSize: 12, 
              fontFamily: 'Figtree' 
            }, 
            labelShowBg: true,
            labelBgStyle: { fill: bgColor, fillOpacity: 1 },
            labelBgPadding: [8, 4],
            labelBgBorderRadius: 4, 
            markerEnd: { 
              type: MarkerType.ArrowClosed, 
              color: edgeColor, 
              width: 14, 
              height: 14 
            }
        };
    });

    return getLayoutedElements(flowNodes, flowEdges);
};
