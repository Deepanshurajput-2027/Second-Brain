import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useToast } from '../components/ToastProvider';

export const useExportManager = () => {
  const { items } = useSelector((state) => state.memory);
  const toast = useToast();

  const exportAsMarkdown = useCallback((selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) {
      toast.error('No memories selected for export.');
      return;
    }

    try {
      const selectedMemories = items.filter(item => {
        const id = item.id || item._id;
        return selectedIds.includes(id);
      });

      let mdContent = `# Second Brain Export\n\n`;
      mdContent += `Exported ${selectedMemories.length} memories on ${new Date().toLocaleDateString()}\n\n---\n\n`;

      selectedMemories.forEach((memory) => {
        const title = memory.title || 'Untitled Memory';
        const url = memory.url ? `**Source:** [Link](${memory.url})` : '';
        const tags = (memory.tags && memory.tags.length > 0) ? `**Tags:** ${memory.tags.map(t => `#${t}`).join(', ')}` : '**Tags:** None';
        const date = memory.createdAt ? `**Date:** ${new Date(memory.createdAt).toLocaleDateString()}` : '';
        const summary = memory.summary ? `\n> ${memory.summary.replace(/\n/g, '\n> ')}\n` : '';
        const content = memory.content ? `\n\n${memory.content}` : '';

        mdContent += `## ${title}\n\n`;
        mdContent += `${tags}\n`;
        if (date) mdContent += `${date}\n`;
        if (url) mdContent += `${url}\n`;
        mdContent += `${summary}`;
        mdContent += `${content}\n\n`;
        mdContent += `---\n\n`;
      });

      const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
      const urlBlob = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', urlBlob);
      link.setAttribute('download', `second-brain-export-${Date.now()}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(urlBlob);

      toast.success('Export downloaded successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export memories.');
    }
  }, [items, toast]);

  return { exportAsMarkdown };
};
