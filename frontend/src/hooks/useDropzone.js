import { useState } from 'react';

export function useDropzone({ onFiles, accept }) {
  const [isOver, setIsOver] = useState(false);
  return {
    isOver,
    bind: {
      onDragOver: (e) => { e.preventDefault(); setIsOver(true); },
      onDragLeave: () => setIsOver(false),
      onDrop: (e) => {
        e.preventDefault();
        setIsOver(false);
        let files = Array.from(e.dataTransfer.files ?? []);
        if (accept) files = files.filter((f) => f.type.startsWith(accept));
        if (files.length) onFiles(files);
      },
    },
  };
}