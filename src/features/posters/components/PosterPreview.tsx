import React from 'react';

interface PosterPreviewProps {
  product: any;
  promotion?: any;
  company?: string;
  showTopLogo?: boolean;
  pricePerUnit?: string;
  points?: string;
  origin?: string;
  barcode?: string;
  selectedFormat?: any;
  zoom?: number;
  cardSize?: number;
  financing?: any;
  hideGrid?: boolean;
  fullscreen?: boolean;
}

export const PosterPreview: React.FC<PosterPreviewProps> = (props) => {
  // TODO: Copiar aquí la implementación original del componente desde la antigua carpeta Posters
  return (
    <div className="bg-white border rounded shadow p-4">
      <div className="font-bold">PosterPreview placeholder</div>
      <pre className="text-xs text-gray-500">{JSON.stringify(props, null, 2)}</pre>
    </div>
  );
};
