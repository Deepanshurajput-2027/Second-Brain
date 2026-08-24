import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

/**
 * Custom hook to isolate graph focusing, URL deep-linking,
 * neighborhood calculation, and camera navigation logic.
 */
export const useGraphFocus = (graphData = { nodes: [], links: [] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  const [isEngineStabilized, setIsEngineStabilized] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // 1. Parse target Node ID from URL query param or router state
  const targetIdParam = searchParams.get('nodeId') || 
                        searchParams.get('highlight') || 
                        location.state?.focusNodeId || 
                        null;

  // 2. Resolve target node from graphData
  const targetNode = useMemo(() => {
    if (!targetIdParam || !graphData?.nodes || graphData.nodes.length === 0) {
      return null;
    }

    const cleanParam = String(targetIdParam).trim();
    
    return graphData.nodes.find((node) => {
      if (!node) return false;
      const rawId = String(node.id || '');
      const memId = String(node.originalMemory?._id || node.originalMemory?.id || '');
      
      return (
        rawId === cleanParam ||
        rawId === `memory-${cleanParam}` ||
        rawId === `tag-${cleanParam}` ||
        memId === cleanParam
      );
    }) || null;
  }, [targetIdParam, graphData?.nodes]);

  // Keep selectedNode in sync when URL param changes
  useEffect(() => {
    if (targetNode) {
      setSelectedNode(targetNode);
    } else if (!targetIdParam) {
      setSelectedNode(null);
    }
  }, [targetNode, targetIdParam]);

  // The effectively active node (either from deep-link or manual selection)
  const activeNode = selectedNode || targetNode;

  // 3. Compute Neighborhood (Connected Nodes & Links)
  const { neighborNodeIds, connectedLinkIds } = useMemo(() => {
    const neighborSet = new Set();
    const linkSet = new Set();

    if (!activeNode || !graphData?.links) {
      return { neighborNodeIds: neighborSet, connectedLinkIds: linkSet };
    }

    neighborSet.add(activeNode.id);

    graphData.links.forEach((link) => {
      const sourceId = typeof link.source === 'object' && link.source !== null ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' && link.target !== null ? link.target.id : link.target;

      if (sourceId === activeNode.id) {
        neighborSet.add(targetId);
        linkSet.add(link);
      } else if (targetId === activeNode.id) {
        neighborSet.add(sourceId);
        linkSet.add(link);
      }
    });

    return { neighborNodeIds: neighborSet, connectedLinkIds: linkSet };
  }, [activeNode, graphData?.links]);

  // 4. Focus Camera on a given node with safety checks
  const focusCameraOnNode = useCallback((fgRef, node, distanceOffset = 150, duration = 1500) => {
    if (!fgRef?.current || !node) return;

    const x = typeof node.x === 'number' ? node.x : 0;
    const y = typeof node.y === 'number' ? node.y : 0;
    const z = typeof node.z === 'number' ? node.z : 0;

    const dist = Math.hypot(x, y, z) || 1;
    const distRatio = 1 + distanceOffset / dist;

    const targetPos = {
      x: x * distRatio,
      y: y * distRatio,
      z: z * distRatio,
    };

    fgRef.current.cameraPosition(targetPos, { x, y, z }, duration);
  }, []);

  // 5. Select a Node (updates internal state and URL param)
  const selectNode = useCallback((node) => {
    if (!node) {
      setSelectedNode(null);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('nodeId');
        next.delete('highlight');
        return next;
      });
      return;
    }

    setSelectedNode(node);
    
    // Determine clean ID to set in URL
    const idToSet = node.originalMemory?._id || 
                    node.originalMemory?.id || 
                    (node.id.startsWith('memory-') ? node.id.replace('memory-', '') : node.id);

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('nodeId', idToSet);
      return next;
    });
  }, [setSearchParams]);

  // 6. Clear Selection (resets state, clears query param)
  const clearSelection = useCallback(() => {
    setSelectedNode(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('nodeId');
      next.delete('highlight');
      return next;
    });
  }, [setSearchParams]);

  return {
    targetIdParam,
    activeNode,
    activeNodeId: activeNode?.id || null,
    neighborNodeIds,
    connectedLinkIds,
    isEngineStabilized,
    setIsEngineStabilized,
    selectNode,
    clearSelection,
    focusCameraOnNode,
  };
};
