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
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      // Primero intentar con la cámara trasera
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (firstError) {
        console.log('Intentando con cámara frontal...');
        // Si falla, intentar con cualquier cámara disponible
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      }

      // Asegurarse de que el video esté listo
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
        };
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      toast.error('No se pudo acceder a la cámara');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const takePhoto = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (!videoRef.current || !videoRef.current.videoWidth) {
        throw new Error('La cámara no está lista');
      }

      // Crear canvas con las dimensiones del video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No se pudo crear el contexto del canvas');
      }

      // Capturar la imagen
      ctx.drawImage(videoRef.current, 0, 0);

      // Convertir a blob con menor calidad
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error('Error al crear blob')),
          'image/jpeg',
          0.7
        );
      });

      // Crear el archivo
      const fileName = `capture-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      // Subir a Supabase
      const { data, error } = await supabase.storage
        .from('builder-images')
        .upload(`captures/${fileName}`, file);

      if (error) {
        throw new Error('Error al subir la imagen: ' + error.message);
      }

      // Obtener la URL pública
      const { data: urlData } = supabase.storage
        .from('builder-images')
        .getPublicUrl(`captures/${fileName}`);

      if (!urlData.publicUrl) {
        throw new Error('No se pudo obtener la URL de la imagen');
      }

      // Notificar éxito
      onPhotoTaken(urlData.publicUrl);
      toast.success('Imagen guardada correctamente');
      onClose();

    } catch (err) {
      console.error('Error al tomar la foto:', err);
      toast.error(err instanceof Error ? err.message : 'Error al procesar la imagen');
    } finally {
      setIsLoading(false);
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
          muted
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
          disabled={isLoading}
          className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center
            ${isLoading ? 'bg-gray-400' : 'bg-white'}`}
        >
          <Camera className={`w-8 h-8 ${isLoading ? 'text-gray-600' : 'text-black'}`} />
        </button>
      </div>
    </div>
  );
} 