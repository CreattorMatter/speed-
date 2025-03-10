import React, { useState } from 'react';
import { Header } from '../shared/Header';
import { CompanySelect } from '../Posters/CompanySelect';
import { RegionSelect } from '../Posters/RegionSelect';
import { LocationSelect } from '../Posters/LocationSelect';
import { COMPANIES } from '../../data/companies';
import { LOCATIONS, REGIONS } from '../../data/locations';
import { ArrowLeft } from 'lucide-react';

interface DigitalCarouselEditorProps {
  onBack: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
}

export const DigitalCarouselEditor: React.FC<DigitalCarouselEditorProps> = ({
  onBack,
  onLogout,
  userEmail,
  userName
}) => {
  const [company, setCompany] = useState('');
  const [region, setRegion] = useState<string[]>([]);
  const [cc, setCC] = useState<string[]>([]);

  // Filtrar ubicaciones basadas en la región seleccionada
  const filteredLocations = LOCATIONS.filter(location => 
    region.length === 0 || region.includes(location.region)
  );

  // Obtener regiones disponibles basadas en la empresa seleccionada
  const availableRegions = REGIONS.filter(r => 
    !company || LOCATIONS.some(l => l.region === r && l.company === company)
  );

  const handleCompanyChange = (newCompany: string) => {
    setCompany(newCompany);
    setRegion([]);
    setCC([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-violet-900">
      <Header onBack={onBack} onLogout={onLogout} />
      <div className="min-h-screen flex flex-col bg-white">
        <main className="pt-10 px-6 pb-6 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
            <h2 className="text-2xl font-medium text-gray-900">Editor de Carrusel Digital</h2>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-gray-200">
            {/* Selección de Empresa, Región y CC */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <CompanySelect
                  value={company}
                  onChange={handleCompanyChange}
                  companies={COMPANIES}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Región
                </label>
                <RegionSelect
                  value={region}
                  onChange={(values) => {
                    setRegion(values);
                    setCC([]);
                  }}
                  regions={availableRegions}
                  isMulti={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CC
                </label>
                <LocationSelect
                  value={cc}
                  onChange={setCC}
                  locations={filteredLocations}
                  disabled={region.length === 0}
                  isMulti={true}
                />
              </div>
            </div>

            {/* Área de configuración del carrusel */}
            <div className="mt-8">
              {/* Aquí irá la configuración del carrusel */}
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-500">
                  Seleccione una empresa, región y sucursal para comenzar a crear el carrusel digital.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}; 