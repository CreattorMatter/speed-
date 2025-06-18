import React from 'react';

interface LocationMapProps {
  location?: {
    name: string;
    coordinates: [number, number];
    address: string;
  };
}

export const LocationMap: React.FC<LocationMapProps> = ({ location }) => {
  const getGoogleMapsEmbedUrl = (name: string) => {
    const query = encodeURIComponent(`${name} - ${location?.address}`);
    return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg bg-white">
      {location ? (
        <>
          <iframe
            title={`Mapa de ${location.name}`}
            width="100%"
            height="300"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={getGoogleMapsEmbedUrl(location.name)}
            style={{ border: 0 }}
            className="w-full"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
            {location.address}
          </div>
        </>
      ) : (
        <div className="h-64 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Selecciona una ubicación</p>
        </div>
      )}
    </div>
  );
}; 