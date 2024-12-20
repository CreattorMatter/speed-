import React, { useRef, useState } from 'react';
import { Camera, X, Save, Plus, ArrowRight } from 'lucide-react';
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
  const [showNameModal, setShowNameModal] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [photoName, setPhotoName] = useState('');
  const [capturedImage, setCapturedImage] = useState<{ blob: Blob; preview: string } | null>(null);

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

      // Guardar la imagen capturada y mostrar el modal
      setCapturedImage({
        blob,
        preview: canvas.toDataURL('image/jpeg')
      });
      setShowNameModal(true);
      setIsLoading(false);

    } catch (err) {
      console.error('Error al tomar la foto:', err);
      toast.error(err instanceof Error ? err.message : 'Error al procesar la imagen');
      setIsLoading(false);
    }
  };

  const savePhoto = async () => {
    if (!capturedImage || !photoName.trim()) return;
    setIsLoading(true);

    try {
      // Crear el archivo con solo el nombre proporcionado
      const fileName = `${photoName.trim()}.jpg`;
      const file = new File([capturedImage.blob], fileName, { type: 'image/jpeg' });

      // Subir a Supabase
      const { data, error } = await supabase.storage
        .from('builder-images')
        .upload(`captures/${fileName}`, file, {
          upsert: true // Sobrescribir si existe un archivo con el mismo nombre
        });

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
      
      // Mostrar modal de continuar
      setShowNameModal(false);
      setCapturedImage(null);
      setPhotoName('');
      setShowContinueModal(true);
      setIsLoading(false);

    } catch (err) {
      console.error('Error al guardar la foto:', err);
      toast.error(err instanceof Error ? err.message : 'Error al guardar la imagen');
      setIsLoading(false);
    }
  };

  const handleNewPhoto = () => {
    // Reiniciar todos los estados
    setShowContinueModal(false);
    setShowNameModal(false);
    setCapturedImage(null);
    setPhotoName('');
    setIsLoading(false);
    
    // Detener la cámara actual y reiniciarla
    stopCamera();
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {showContinueModal ? (
        <div className="flex flex-col h-full p-4 items-center justify-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-white text-xl font-semibold text-center mb-6">
              ¿Qué deseas hacer?
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={handleNewPhoto}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 
                         text-white px-4 py-3 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Tomar otra foto
              </button>

              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 
                         text-white px-4 py-3 rounded-lg transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
                Continuar con el sistema
              </button>
            </div>
          </div>
        </div>
      ) : !showNameModal ? (
        <>
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
        </>
      ) : (
        <div className="flex flex-col h-full p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-xl font-semibold">Nombrar foto</h2>
            <button
              onClick={() => {
                setShowNameModal(false);
                setCapturedImage(null);
                setPhotoName('');
              }}
              className="p-2 text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {capturedImage && (
            <div className="flex-1 mb-4">
              <img
                src={capturedImage.preview}
                alt="Vista previa"
                className="w-full h-64 object-contain bg-black/50 rounded-lg"
              />
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              value={photoName}
              onChange={(e) => setPhotoName(e.target.value)}
              placeholder="Nombre de la foto"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg 
                       text-white placeholder-white/50 focus:outline-none focus:ring-2 
                       focus:ring-white/50"
              autoFocus
            />

            <button
              onClick={savePhoto}
              disabled={isLoading || !photoName.trim()}
              className={`w-full py-3 flex items-center justify-center gap-2 rounded-lg
                ${isLoading || !photoName.trim() 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
            >
              <Save className="w-5 h-5" />
              {isLoading ? 'Guardando...' : 'Guardar foto'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 