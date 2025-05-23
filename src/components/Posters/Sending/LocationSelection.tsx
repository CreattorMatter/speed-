import React from 'react';
import { LocationSelect } from '../Editor/Selectors/LocationSelect';

interface LocationOption {
  id: string;
  name: string;
  region: string;
  direccion: string;
  email: string;
}

interface LocationSelectionProps {
  locations: LocationOption[];
  selectedLocations: string[];
  onSelectionChange: (locations: string[]) => void;
  loading: boolean;
}

export const LocationSelection: React.FC<LocationSelectionProps> = ({
  locations,
  selectedLocations,
  onSelectionChange,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Cargando sucursales...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-lg font-medium text-gray-900">
          Seleccionar Sucursales
        </label>
        {selectedLocations.length > 0 && (
          <span className="text-sm text-gray-500">
            {selectedLocations.length} {selectedLocations.length === 1 ? 'sucursal seleccionada' : 'sucursales seleccionadas'}
          </span>
        )}
      </div>

      <LocationSelect
        locations={locations}
        value={selectedLocations}
        onChange={onSelectionChange}
        isMulti={true}
      />

      {locations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron sucursales para esta empresa
        </div>
      )}
    </div>
  );
}; 