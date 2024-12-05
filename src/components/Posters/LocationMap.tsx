import React from 'react';

interface LocationMapProps {
  location?: {
    name: string;
    coordinates: [number, number];
  };
}

export const LocationMap: React.FC<LocationMapProps> = ({ location }) => {
  const getGoogleMapsEmbedUrl = (lat: number, lng: number, name: string) => {
    const query = encodeURIComponent(`${lat},${lng}`);
    return `https://maps.google.com/maps?q=${query}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg bg-white">
      {location ? (
        <iframe
          title={`Mapa de ${location.name}`}
          width="100%"
          height="300"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={getGoogleMapsEmbedUrl(location.coordinates[1], location.coordinates[0], location.name)}
          style={{ border: 0 }}
          className="w-full"
          loading="lazy"
        />
      ) : (
        <div className="h-64 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Selecciona una ubicación</p>
        </div>
      )}
    </div>
  );
}; 