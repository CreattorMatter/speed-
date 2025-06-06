import React from 'react';
import { CartelElement } from '../../redux/builderSlice';

// ====================================
// TIPOS Y INTERFACES
// ====================================

interface ElementRendererProps {
  element: CartelElement;
  isSelected: boolean;
}

// ====================================
// COMPONENTES DE ELEMENTOS ESPECÍFICOS
// ====================================

const PrecioRenderer: React.FC<{ element: CartelElement & { type: 'precio' } }> = ({ element }) => {
  const { precio, moneda, decimales, prefijo, sufijo } = element.content;
  
  // Formatear precio con decimales
  const formattedPrice = precio.toFixed(decimales);
  
  return (
    <div
      className="flex items-center justify-center h-full"
      style={element.style}
    >
      <span>
        {prefijo}
        {moneda}
        {formattedPrice}
        {sufijo}
      </span>
    </div>
  );
};

const DescuentoRenderer: React.FC<{ element: CartelElement & { type: 'descuento' } }> = ({ element }) => {
  const { porcentaje, precioOriginal, precioOferta, tipoDescuento, etiqueta } = element.content;
  
  const renderContent = () => {
    switch (tipoDescuento) {
      case 'porcentaje':
        return `${etiqueta} ${porcentaje}%`;
      case 'precio-fijo':
        return `${etiqueta} $${precioOferta}`;
      case 'precio-tachado':
        return (
          <span>
            <span style={{ textDecoration: 'line-through' }}>${precioOriginal}</span>
            {' '}
            <span>${precioOferta}</span>
          </span>
        );
      default:
        return etiqueta;
    }
  };

  return (
    <div
      className="flex items-center justify-center h-full"
      style={element.style}
    >
      {renderContent()}
    </div>
  );
};

const ProductoRenderer: React.FC<{ element: CartelElement & { type: 'producto' } }> = ({ element }) => {
  const { nombre, marca, descripcion } = element.content;
  
  return (
    <div
      className="h-full p-2"
      style={element.style}
    >
      <div className="font-bold">{nombre}</div>
      {marca && <div className="text-sm opacity-75">{marca}</div>}
      {descripcion && <div className="text-xs mt-1 opacity-60">{descripcion}</div>}
    </div>
  );
};

const CuotasRenderer: React.FC<{ element: CartelElement & { type: 'cuotas' } }> = ({ element }) => {
  const { numeroCuotas, valorCuota, interes, textoAdicional } = element.content;
  
  const interesText = interes === 0 ? 'sin interés' : `${interes}% interés`;
  
  return (
    <div
      className="flex items-center justify-center h-full"
      style={element.style}
    >
      <span>
        {numeroCuotas} cuotas de ${valorCuota.toFixed(2)} {textoAdicional || interesText}
      </span>
    </div>
  );
};

const OrigenRenderer: React.FC<{ element: CartelElement & { type: 'origen' } }> = ({ element }) => {
  const { pais, region, certificacion, icono } = element.content;
  
  return (
    <div
      className="flex items-center justify-center h-full"
      style={element.style}
    >
      <span>
        {icono && <span className="mr-1">{icono}</span>}
        {pais}
        {region && `, ${region}`}
        {certificacion && ` • ${certificacion}`}
      </span>
    </div>
  );
};

const CodigoRenderer: React.FC<{ element: CartelElement & { type: 'codigo' } }> = ({ element }) => {
  const { codigo, tipo, mostrarCodigo } = element.content;
  
  const renderCodigo = () => {
    switch (tipo) {
      case 'barcode':
        return (
          <div className="text-center">
            <div className="font-mono text-xs">||||| |||| |||||</div>
            {mostrarCodigo && <div className="text-xs mt-1">{codigo}</div>}
          </div>
        );
      case 'qr':
        return (
          <div className="text-center">
            <div className="text-2xl">⬛</div>
            {mostrarCodigo && <div className="text-xs mt-1">{codigo}</div>}
          </div>
        );
      case 'sku':
        return <div className="font-mono">{codigo}</div>;
      default:
        return <div>{codigo}</div>;
    }
  };

  return (
    <div
      className="flex items-center justify-center h-full"
      style={element.style}
    >
      {renderCodigo()}
    </div>
  );
};

const FechaRenderer: React.FC<{ element: CartelElement & { type: 'fecha' } }> = ({ element }) => {
  const { texto } = element.content;
  
  return (
    <div
      className="flex items-center justify-center h-full"
      style={element.style}
    >
      <span>{texto}</span>
    </div>
  );
};

const NotaLegalRenderer: React.FC<{ element: CartelElement & { type: 'nota-legal' } }> = ({ element }) => {
  const { texto } = element.content;
  
  return (
    <div
      className="h-full p-1 overflow-hidden"
      style={element.style}
    >
      <div className="text-xs leading-tight">{texto}</div>
    </div>
  );
};

const ImagenRenderer: React.FC<{ element: CartelElement & { type: 'imagen' } }> = ({ element }) => {
  const { src, alt, ajuste } = element.content;
  
  return (
    <div className="h-full overflow-hidden" style={element.style}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full"
        style={{ objectFit: ajuste }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSI+SW1hZ2VuPC90ZXh0Pjwvc3ZnPg==';
        }}
      />
    </div>
  );
};

const TextoLibreRenderer: React.FC<{ element: CartelElement & { type: 'texto-libre' } }> = ({ element }) => {
  const { texto } = element.content;
  
  return (
    <div
      className="h-full p-1"
      style={element.style}
    >
      <div className="h-full flex items-center">
        {texto || 'Texto libre...'}
      </div>
    </div>
  );
};

const LogoRenderer: React.FC<{ element: CartelElement & { type: 'logo' } }> = ({ element }) => {
  const { src, alt, empresa } = element.content;
  
  return (
    <div className="h-full" style={element.style}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNjAiIGZpbGw9IiNmOWZhZmIiIHN0cm9rZT0iI2Q5ZGNlMCIvPjx0ZXh0IHg9IjUwIiB5PSIzNSIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY3NzI4MCI+TG9nbzwvdGV4dD48L3N2Zz4=';
        }}
        title={empresa}
      />
    </div>
  );
};

// ====================================
// COMPONENTE PRINCIPAL
// ====================================

const ElementRenderer: React.FC<ElementRendererProps> = ({ element, isSelected }) => {
  // Clase CSS base para todos los elementos
  const baseClasses = `
    w-full h-full
    ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
    ${element.locked ? 'pointer-events-none opacity-50' : ''}
    transition-all duration-200
  `;

  // Renderizar según el tipo de elemento
  const renderElementContent = () => {
    switch (element.type) {
      case 'precio':
        return <PrecioRenderer element={element as CartelElement & { type: 'precio' }} />;
      
      case 'descuento':
        return <DescuentoRenderer element={element as CartelElement & { type: 'descuento' }} />;
      
      case 'producto':
        return <ProductoRenderer element={element as CartelElement & { type: 'producto' }} />;
      
      case 'cuotas':
        return <CuotasRenderer element={element as CartelElement & { type: 'cuotas' }} />;
      
      case 'origen':
        return <OrigenRenderer element={element as CartelElement & { type: 'origen' }} />;
      
      case 'codigo':
        return <CodigoRenderer element={element as CartelElement & { type: 'codigo' }} />;
      
      case 'fecha':
        return <FechaRenderer element={element as CartelElement & { type: 'fecha' }} />;
      
      case 'nota-legal':
        return <NotaLegalRenderer element={element as CartelElement & { type: 'nota-legal' }} />;
      
      case 'imagen':
        return <ImagenRenderer element={element as CartelElement & { type: 'imagen' }} />;
      
      case 'texto-libre':
        return <TextoLibreRenderer element={element as CartelElement & { type: 'texto-libre' }} />;
      
      case 'logo':
        return <LogoRenderer element={element as CartelElement & { type: 'logo' }} />;
      
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 text-sm">
            Tipo desconocido: {(element as any).type}
          </div>
        );
    }
  };

  return (
    <div className={baseClasses}>
      {renderElementContent()}
    </div>
  );
};

export default ElementRenderer; 