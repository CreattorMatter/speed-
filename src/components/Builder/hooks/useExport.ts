import { useState, useCallback } from 'react';
import { Block } from '../types/block';
import { PaperFormat } from '../types/paper';

interface ExportOptions {
  format: 'png' | 'pdf' | 'jpg';
  quality?: number;
  paperFormat?: PaperFormat;
  scale?: number;
  includeBackground?: boolean;
}

interface UseExportProps {
  onExport: (options: ExportOptions) => Promise<Blob>;
  onError: (error: Error) => void;
}

interface UseExportReturn {
  isExporting: boolean;
  progress: number;
  exportImage: (options: ExportOptions) => Promise<void>;
  downloadFile: (blob: Blob, filename: string) => void;
}

export const useExport = ({
  onExport,
  onError
}: UseExportProps): UseExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportImage = useCallback(async (options: ExportOptions) => {
    try {
      setIsExporting(true);
      setProgress(0);

      // Simulate export progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const blob = await onExport(options);

      clearInterval(progressInterval);
      setProgress(100);

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `export-${timestamp}.${options.format}`;

      // Download file
      downloadFile(blob, filename);
    } catch (error) {
      if (error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  }, [onExport, onError]);

  const downloadFile = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return {
    isExporting,
    progress,
    exportImage,
    downloadFile
  };
}; 