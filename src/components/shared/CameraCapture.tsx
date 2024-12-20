import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoTaken: (imageUrl: string) => void;
}

export function CameraCapture({ isOpen, onClose, onPhotoTaken }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      try {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const { data, error } = await supabase.storage
          .from('builder-images')
          .upload(`captures/${file.name}`, file);

        if (error) throw error;

        const imageUrl = supabase.storage
          .from('builder-images')
          .getPublicUrl(`captures/${file.name}`).data.publicUrl;

        onPhotoTaken(imageUrl);
        onClose();
      } catch (err) {
        console.error('Error uploading image:', err);
      }
    }, 'image/jpeg', 0.8);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 bg-black">
        <button
          onClick={takePhoto}
          className="w-16 h-16 rounded-full bg-white mx-auto flex items-center justify-center"
        >
          <Camera className="w-8 h-8 text-black" />
        </button>
      </div>
    </div>
  );
} 