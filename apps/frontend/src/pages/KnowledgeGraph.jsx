import React, { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { useGraphData } from '../hooks/useGraphData';
import { useMemories } from '../hooks/useMemories';
import { useGraphFocus } from '../hooks/useGraphFocus';
import { GraphInspectorDrawer } from '../components/GraphInspectorDrawer';
import { Sparkles, Maximize2, Minimize2 } from 'lucide-react';

export const KnowledgeGraph = () => {
  const fgRef = useRef();
  const containerRef = useRef(null);
  const lastFocusedNodeIdRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. Data & State
  const graphData = useGraphData();
  const { activeTag } = useMemories();

  // 2. Custom Graph Focus & Deep-Link Hook
  const {
    activeNode,
    activeNodeId,
    neighborNodeIds,
    connectedLinkIds,
    isEngineStabilized,
    setIsEngineStabilized,
    selectNode,
    clearSelection,
    focusCameraOnNode,
  } = useGraphFocus(graphData);

  // 3. Resize Observer for dynamic dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isFullscreen]);

  // 4. Force Simulation Setup
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      fgRef.current.d3Force('charge').strength(-120);
      fgRef.current.d3Force('link').distance(45);
    }
  }, [graphData]);

  // 5. Engine stabilization & Auto-Focus Camera Trigger
  const handleEngineStop = useCallback(() => {
    setIsEngineStabilized(true);
  }, [setIsEngineStabilized]);

  // Trigger camera focus once engine stabilizes or on active node change
  useEffect(() => {
    if (!fgRef.current || !activeNode || graphData.nodes.length === 0) {
      if (!activeNode && isEngineStabilized && fgRef.current) {
        // Initial overview fit if no target node
        fgRef.current.zoomToFit(400, 30);
      }
      return;
    }

    // Check if target node has coordinates computed
    const hasCoordinates = typeof activeNode.x === 'number' && !isNaN(activeNode.x);

    if (hasCoordinates && (isEngineStabilized || lastFocusedNodeIdRef.current !== activeNode.id)) {
      focusCameraOnNode(fgRef, activeNode, 150, 1500);
      lastFocusedNodeIdRef.current = activeNode.id;
    } else {
      // Fallback timer to ensure coordinates settle even before onEngineStop
      const timer = setTimeout(() => {
        if (fgRef.current && activeNode && typeof activeNode.x === 'number') {
          focusCameraOnNode(fgRef, activeNode, 150, 1500);
          lastFocusedNodeIdRef.current = activeNode.id;
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeNode, isEngineStabilized, graphData.nodes, focusCameraOnNode]);

  // 6. Node Click & Background Click Interactivity
  const handleNodeClick = useCallback((node) => {
    if (!node) return;
    selectNode(node);
    focusCameraOnNode(fgRef, node, 150, 1200);
    lastFocusedNodeIdRef.current = node.id;
  }, [selectNode, focusCameraOnNode]);

  const handleBackgroundClick = useCallback(() => {
    clearSelection();
    lastFocusedNodeIdRef.current = null;
  }, [clearSelection]);

  // 7. Visual Highlighting: Node Color
  const getNodeColor = useCallback((node) => {
    if (activeNode) {
      if (node.id === activeNode.id) {
        return '#059669'; // Active Node (Vibrant Emerald)
      }
      if (neighborNodeIds.has(node.id)) {
        return '#34D399'; // Connected Neighbors (Light Green)
      }
      return '#E2E8F0'; // Unrelated Nodes (Dim Gray)
    }

    // Fallback: active tag filter
    if (activeTag) {
      if (node.type === 'tag' && node.id === `tag-${activeTag}`) {
        return '#059669';
      }
      if (node.type === 'memory' && node.originalMemory?.tags?.includes(activeTag)) {
        return '#34D399';
      }
      return '#E2E8F0';
    }

    // Default palette
    if (node.type === 'tag') return '#059669';
    return '#A7F3D0';
  }, [activeNode, neighborNodeIds, activeTag]);

  // 8. Visual Highlighting: Node Size (nodeVal)
  const getNodeVal = useCallback((node) => {
    if (activeNode) {
      if (node.id === activeNode.id) return 8; // Enlarge active node
      if (neighborNodeIds.has(node.id)) return 5; // Enlarge neighbors
      return 1.5; // Shrink unrelated nodes
    }

    if (activeTag) {
      if (node.type === 'tag' && node.id === `tag-${activeTag}`) return 7;
      if (node.type === 'memory' && node.originalMemory?.tags?.includes(activeTag)) return 5;
      return 1.5;
    }

    return node.val || (node.type === 'tag' ? 2.5 : 4);
  }, [activeNode, neighborNodeIds, activeTag]);

  // 9. Visual Highlighting: Link Color
  const getLinkColor = useCallback((link) => {
    if (activeNode) {
      if (connectedLinkIds.has(link)) {
        return '#10B981'; // Connected Links (Bright Emerald)
      }
      return 'rgba(203, 213, 225, 0.15)'; // Unrelated Links (Dim Gray)
    }

    if (activeTag) {
      const sourceId = typeof link.source === 'object' && link.source !== null ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' && link.target !== null ? link.target.id : link.target;
      if (sourceId === `tag-${activeTag}` || targetId === `tag-${activeTag}`) {
        return '#10B981';
      }
      return 'rgba(203, 213, 225, 0.15)';
    }

    return '#E2E8F0';
  }, [activeNode, connectedLinkIds, activeTag]);

  // 10. Visual Highlighting: Link Width
  const getLinkWidth = useCallback((link) => {
    if (activeNode) {
      return connectedLinkIds.has(link) ? 2.5 : 0.5;
    }

    if (activeTag) {
      const sourceId = typeof link.source === 'object' && link.source !== null ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' && link.target !== null ? link.target.id : link.target;
      if (sourceId === `tag-${activeTag}` || targetId === `tag-${activeTag}`) {
        return 2.5;
      }
      return 0.5;
    }

    return 1;
  }, [activeNode, connectedLinkIds, activeTag]);

  // 11. Visual Highlighting: Link Directional Particles
  const getLinkDirectionalParticles = useCallback((link) => {
    if (activeNode) {
      return connectedLinkIds.has(link) ? 4 : 0;
    }

    if (activeTag) {
      const sourceId = typeof link.source === 'object' && link.source !== null ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' && link.target !== null ? link.target.id : link.target;
      if (sourceId === `tag-${activeTag}` || targetId === `tag-${activeTag}`) {
        return 4;
      }
      return 0;
    }

    return 1;
  }, [activeNode, connectedLinkIds, activeTag]);

  return (
    <div className={`flex-1 w-full flex flex-col pl-1 pb-8 ${
      isFullscreen 
        ? 'fixed inset-0 z-50 bg-white p-6' 
        : 'h-[calc(100vh-8rem)] min-h-[600px]'
    }`}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Knowledge Graph
            {activeNode && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 tracking-normal">
                Focused: {activeNode.name}
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-1">
            Visualize relationships across memories and tags in interactive 3D space.
          </p>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-sm"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Main 3D Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 w-full relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing"
      >
        {dimensions.width > 0 && dimensions.height > 0 && graphData.nodes.length > 0 ? (
          <ForceGraph3D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            backgroundColor="#FFFFFF"
            showNavInfo={false}
            
            // Nodes
            nodeRelSize={6}
            nodeVal={getNodeVal}
            nodeColor={getNodeColor}
            nodeResolution={16}
            nodeOpacity={1}
            nodeLabel={(node) => `
              <div style="
                background: #FFFFFF;
                color: #1E293B;
                padding: 6px 12px;
                border-radius: 8px;
                font-family: system-ui, sans-serif;
                font-size: 13px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                border: 1px solid #E2E8F0;
              ">
                ${node.name}
              </div>
            `}
            
            // Links
            linkColor={getLinkColor}
            linkWidth={getLinkWidth}
            linkOpacity={0.8}
            linkDirectionalParticles={getLinkDirectionalParticles}
            linkDirectionalParticleWidth={1.5}
            linkDirectionalParticleSpeed={0.006}
            linkDirectionalParticleColor={() => '#10B981'}
            
            // Interactivity & Physics
            enableNodeDrag={true}
            onNodeClick={handleNodeClick}
            onBackgroundClick={handleBackgroundClick}
            onEngineStop={handleEngineStop}
            d3VelocityDecay={0.3}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Sparkles className="w-8 h-8 text-emerald-400 mb-2 animate-pulse" />
            <p className="font-medium text-sm">
              {graphData.nodes.length === 0 ? 'No memories saved yet to generate knowledge graph.' : 'Initializing 3D Canvas...'}
            </p>
          </div>
        )}

        {/* Floating Stats Pill */}
        <div className="absolute bottom-6 left-6 pointer-events-none bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm z-10">
          <p className="text-sm font-medium text-slate-600">
            <span className="font-bold text-emerald-600">{graphData.nodes.length}</span> Nodes &bull;{' '}
            <span className="font-bold text-emerald-600">{graphData.links.length}</span> Connections
          </p>
        </div>

        {/* Inspector Slide-Over Drawer */}
        <GraphInspectorDrawer 
          node={activeNode} 
          onClose={handleBackgroundClick} 
        />
      </div>
    </div>
  );
};
