import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-hot-toast';

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
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('No se pudo acceder a la cámara');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) {
      console.error('No se encontró la referencia del video');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('No se pudo obtener el contexto del canvas');
        return;
      }

      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('No se pudo crear el blob de la imagen');
          return;
        }

        try {
          console.log('Creando archivo de imagen...');
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          
          console.log('Subiendo a Supabase...');
          const { data, error } = await supabase.storage
            .from('builder-images')
            .upload(`captures/${file.name}`, file);

          if (error) {
            console.error('Error al subir a Supabase:', error);
            throw error;
          }

          console.log('Imagen subida exitosamente:', data);
          
          const imageUrl = supabase.storage
            .from('builder-images')
            .getPublicUrl(`captures/${file.name}`).data.publicUrl;

          console.log('URL de la imagen:', imageUrl);
          onPhotoTaken(imageUrl);
          
        } catch (err) {
          console.error('Error en el proceso de captura:', err);
          toast.error('Error al procesar la imagen');
        }
      }, 'image/jpeg', 0.8);

    } catch (err) {
      console.error('Error al tomar la foto:', err);
      toast.error('Error al capturar la imagen');
    }
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