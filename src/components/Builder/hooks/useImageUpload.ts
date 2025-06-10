import { useState, useCallback } from 'react';

interface UseImageUploadProps {
  onUpload: (file: File) => Promise<string>;
  onError: (error: Error) => void;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

interface UseImageUploadReturn {
  isUploading: boolean;
  progress: number;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDrop: (e: React.DragEvent) => Promise<void>;
  handlePaste: (e: ClipboardEvent) => Promise<void>;
}

export const useImageUpload = ({
  onUpload,
  onError,
  maxSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  onProgress
}: UseImageUploadProps): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateFile = useCallback((file: File) => {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported`);
    }

    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }
  }, [allowedTypes, maxSize]);

  const updateProgress = useCallback((value: number) => {
    setProgress(value);
    if (onProgress) {
      onProgress(value);
    }
  }, [onProgress]);

  const processFile = useCallback(async (file: File) => {
    try {
      validateFile(file);
      setIsUploading(true);
      updateProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        updateProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await onUpload(file);

      clearInterval(progressInterval);
      updateProgress(100);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        onError(error);
      }
      throw error;
    } finally {
      setIsUploading(false);
      updateProgress(0);
    }
  }, [validateFile, onUpload, onError, updateProgress]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, [processFile]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, [processFile]);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const file = e.clipboardData?.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, [processFile]);

  return {
    isUploading,
    progress,
    handleFileSelect,
    handleDrop,
    handlePaste
  };
}; 