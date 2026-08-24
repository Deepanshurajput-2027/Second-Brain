import { useMemo } from 'react';
import { useMemories } from './useMemories';

export const useGraphData = () => {
  const { memories } = useMemories();

  const graphData = useMemo(() => {
    const nodes = [];
    const links = [];
    const tagSet = new Set();

    // 1. Create a node for each memory
    memories.forEach((memory) => {
      const memoryNodeId = `memory-${memory._id || memory.id}`;
      nodes.push({
        id: memoryNodeId,
        name: memory.title || 'Untitled Memory',
        type: 'memory',
        val: 3, // slightly larger size for memories
        originalMemory: memory
      });

      // 2. Track unique tags and create links
      if (memory.tags && Array.isArray(memory.tags)) {
        memory.tags.forEach((tag) => {
          const tagNodeId = `tag-${tag}`;
          tagSet.add(tag);

          // Link memory to tag
          links.push({
            source: memoryNodeId,
            target: tagNodeId,
            value: 1
          });
        });
      }
    });

    // 3. Create nodes for each unique tag
    tagSet.forEach((tag) => {
      nodes.push({
        id: `tag-${tag}`,
        name: `#${tag}`,
        type: 'tag',
        val: 1 // smaller size for tags
      });
    });

    return { nodes, links };
  }, [memories]);

  return graphData;
};
