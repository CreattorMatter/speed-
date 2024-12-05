import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '../../config/mapbox';

// Configurar el token
mapboxgl.accessToken = MAPBOX_TOKEN;

interface LocationMapProps {
  location?: {
    name: string;
    coordinates: [number, number];
  };
}

export const LocationMap: React.FC<LocationMapProps> = ({ location }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Inicializar mapa con una ubicación por defecto si no hay una seleccionada
    const defaultLocation: [number, number] = [-58.3816, -34.6037]; // Buenos Aires

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Cambiar a un estilo más visible
        center: location?.coordinates || defaultLocation,
        zoom: 13,
        interactive: true // Permitir interacción con el mapa
      });

      // Agregar controles de navegación
      map.current.addControl(new mapboxgl.NavigationControl());

      // Asegurarse de que el mapa se cargue completamente
      map.current.on('load', () => {
        console.log('Mapa cargado correctamente');
      });

      // Manejar errores
      map.current.on('error', (e) => {
        console.error('Error en el mapa:', e);
      });
    }

    if (location) {
      // Animar el movimiento al nuevo lugar
      map.current.flyTo({
        center: location.coordinates,
        zoom: 13,
        essential: true,
        duration: 1000
      });

      // Limpiar marcadores existentes
      const existingMarkers = document.getElementsByClassName('mapboxgl-marker');
      while (existingMarkers[0]) {
        existingMarkers[0].remove();
      }

      // Agregar nuevo marcador
      new mapboxgl.Marker({
        color: '#4F46E5',
        scale: 1.2
      })
        .setLngLat(location.coordinates)
        .setPopup(
          new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: 'custom-popup'
          }).setHTML(`
            <div class="text-sm font-medium">
              ${location.name}
            </div>
          `)
        )
        .addTo(map.current);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [location]);

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg">
      <div 
        ref={mapContainer} 
        className="w-full h-64 transition-all duration-500"
        style={{ background: '#e5e7eb' }} // Agregar un color de fondo mientras carga
      />
      {!location && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Selecciona una ubicación</p>
        </div>
      )}
    </div>
  );
}; 