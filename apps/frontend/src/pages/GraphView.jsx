import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { useSelector } from 'react-redux';
import { useGraphData } from '../hooks/useGraphData';
import { useMemories } from '../hooks/useMemories';
import { useChat } from '../hooks/useChat';
import SpriteText from 'three-spritetext';
import { Maximize2, Minimize2, X, Sparkles, Calendar, Tag } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const GraphView = () => {
  const fgRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  
  const themeMode = useSelector((state) => state.theme?.mode || 'light');
  const graphData = useGraphData();
  const { activeTag } = useMemories();
  const { setDraftQuery, toggleChat, isChatOpen } = useChat();
  const location = useLocation();

  const isDark = themeMode === 'dark';
  const bgColor = isDark ? '#111827' : '#ffffff';
  const emerald600 = '#059669';
  const slate300 = '#cbd5e1';
  const gray700 = '#374151';
  const dimOpacity = 0.15;

  // Resize handler
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef();

  // Focus Camera on Node from Route State
  useEffect(() => {
    if (location.state?.focusNodeId && fgRef.current && graphData.nodes.length > 0) {
      const targetNode = graphData.nodes.find(n => n.id === location.state.focusNodeId || n._id === location.state.focusNodeId);
      if (targetNode) {
        setSelectedNode(targetNode);
        setTimeout(() => {
          const distance = 40;
          const distRatio = 1 + distance / Math.hypot(targetNode.x || 100, targetNode.y || 100, targetNode.z || 100);
          fgRef.current.cameraPosition(
            { x: (targetNode.x || 100) * distRatio, y: (targetNode.y || 100) * distRatio, z: (targetNode.z || 100) * distRatio },
            targetNode,
            2000
          );
        }, 500); // Give graph engine a tiny bit of time to settle initial positions
      }
    }
  }, [location.state, graphData.nodes]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const { width, height } = entries[0].contentRect;
        // Don't set dimensions to 0x0
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    observer.observe(containerRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Configure Three.js OrbitControls to swap Left/Right click behaviors (Left = Pan, Right = Rotate)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fgRef.current) {
        const controls = fgRef.current.controls();
        if (controls) {
          // 0 is ROTATE, 2 is PAN in THREE.js
          controls.mouseButtons.LEFT = 2; 
          controls.mouseButtons.RIGHT = 0;
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Physics tuning and zoom-to-fit
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      // Tune forces to keep cluster tight and visible
      fgRef.current.d3Force('charge').strength(-100);
      fgRef.current.d3Force('link').distance(40);

      // Auto-fit camera to graph bounds after initial physics settling
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 20);
        }
      }, 600);
    }
  }, [graphData]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleNodeClick = (node) => {
    if (node.type === 'memory' && node.originalMemory) {
      setSelectedNode(node);
      
      // Optionally focus camera on clicked node
      if (fgRef.current) {
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        fgRef.current.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
          node,
          1500
        );
      }
    } else {
      setSelectedNode(null);
    }
  };

  const handleAskAI = () => {
    if (!selectedNode || !selectedNode.originalMemory) return;
    const memory = selectedNode.originalMemory;
    
    const draft = `Context: ${memory.title}\n\nMy Question: `;
    setDraftQuery(draft);
    if (!isChatOpen) {
      toggleChat();
    }
  };

  const getNodeColor = (node) => {
    let color = node.type === 'memory' ? emerald600 : (isDark ? '#9ca3af' : '#64748b');

    if (activeTag) {
      if (node.type === 'tag' && node.id === `tag-${activeTag}`) {
        color = '#10B981'; // bright emerald for active tag
      } else if (node.type === 'memory' && node.originalMemory?.tags?.includes(activeTag)) {
        // retain original color
      } else {
        color = isDark ? '#37415144' : '#cbd5e144'; // heavily dimmed with alpha
      }
    }
    return color;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative flex-1 w-full min-w-0 transition-colors overflow-hidden cursor-grab active:cursor-grabbing ${
        isFullscreen 
          ? 'fixed inset-0 z-[100] bg-white dark:bg-gray-900' 
          : 'h-[calc(100vh-10rem)] bg-white/60 dark:bg-gray-800/80 backdrop-blur-md border border-slate-200/60 dark:border-gray-700/50 shadow-sm rounded-3xl mb-8 lg:ml-4'
      }`}
    >
      {/* Overlay UI */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Knowledge Graph
        </h2>
        <p className={`text-sm font-medium mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
          {graphData.nodes.length} Nodes &bull; {graphData.links.length} Connections
        </p>
      </div>

      <button 
        onClick={toggleFullscreen}
        className={`absolute top-6 right-6 z-10 p-2 rounded-xl border backdrop-blur-sm transition-colors shadow-sm ${
          isDark 
            ? 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700' 
            : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
        title="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>

      {/* Force Graph */}
      <div className="absolute inset-0">
        <ForceGraph3D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor={bgColor}
          showNavInfo={false}
          
          // Node Styling
          nodeRelSize={6}
          nodeColor={getNodeColor}
          nodeLabel={(node) => `<span class="bg-white dark:bg-gray-800 text-slate-800 dark:text-gray-100 px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium border border-slate-100 dark:border-gray-700 backdrop-blur-md">${node.name || 'Untitled'}</span>`}
          
          // Link Styling
          linkColor={(link) => {
            if (!activeTag) return isDark ? '#4b556399' : '#e2e8f099'; // 0.6 opacity
            
            const isMatch = link.target.id === `tag-${activeTag}` || link.source.id === `tag-${activeTag}`;
            return isMatch 
              ? (isDark ? '#10B981cc' : '#059669cc') // 0.8 opacity
              : (isDark ? '#37415126' : '#cbd5e126'); // 0.15 opacity
          }}
          linkWidth={1.5}
          
          // Particles (Kinetic Effect)
          linkDirectionalParticles={(link) => {
            if (activeTag) {
              const isMatch = link.target.id === `tag-${activeTag}` || link.source.id === `tag-${activeTag}`;
              return isMatch ? 4 : 0;
            }
            return 2;
          }}
          linkDirectionalParticleWidth={1.2}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleColor={() => emerald600}
          
          // Interactivity
          enableNodeDrag={true}
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => setSelectedNode(null)}
          onNodeHover={(node) => {
            if (fgRef.current) {
              document.body.style.cursor = node ? 'pointer' : '';
            }
          }}
          
          // Physics
          d3VelocityDecay={0.3}
        />
      </div>

      {/* Inspector Slide-over Drawer */}
      <div className={`absolute top-0 right-0 bottom-0 w-80 bg-white/90 dark:bg-gray-800/95 backdrop-blur-xl border-l border-slate-200/50 dark:border-gray-700/50 shadow-2xl transition-transform duration-300 ease-in-out z-20 ${selectedNode ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedNode && selectedNode.originalMemory && (
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {selectedNode.originalMemory.title || 'Untitled'}
              </h3>
              <button 
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2">
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-2">Summary</p>
                <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
                  {selectedNode.originalMemory.summary || 'No summary available.'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {(selectedNode.originalMemory.tags || []).map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Added
                </p>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  {new Date(selectedNode.originalMemory.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-gray-700/60">
              <button
                onClick={handleAskAI}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 fill-white/20" />
                Ask AI about this Memory
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
