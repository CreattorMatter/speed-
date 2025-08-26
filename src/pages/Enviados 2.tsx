import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Search, Filter, Calendar, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/shared/Header';
import { PosterSendService, type PosterSend, type PosterSendItem } from '../services/posterSendService';
import { toast } from 'react-hot-toast';

interface EnviadoItem {
  id: string;
  sendId: string;
  tipoCartel: string;
  cantidadProductos: number;
  sucursal: string;
  horaCreacion: string;
  pdfUrl: string;
  pdfFilename: string;
  status: string;
}

interface EnviadosProps {
  onBack: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
}

export const Enviados: React.FC<EnviadosProps> = ({ onBack, onLogout, userEmail, userName }) => {
  const navigate = useNavigate();
  const [enviados, setEnviados] = useState<EnviadoItem[]>([]);
  const [filteredEnviados, setFilteredEnviados] = useState<EnviadoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSucursal, setFilterSucursal] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar datos reales de envíos
  useEffect(() => {
    const loadEnviados = async () => {
      try {
        setLoading(true);
        const sentPosters = await PosterSendService.getSentPosters();
        
        // Convertir a formato de la UI (expandir items por sucursal)
        const enviadosData: EnviadoItem[] = [];
        
        sentPosters.forEach(send => {
          send.items.forEach(item => {
            enviadosData.push({
              id: item.id,
              sendId: send.id,
              tipoCartel: send.template_name,
              cantidadProductos: send.products_count,
              sucursal: item.group_name,
              horaCreacion: new Date(send.created_at).toLocaleString('es-AR'),
              pdfUrl: item.pdf_url,
              pdfFilename: item.pdf_filename,
              status: item.status
            });
          });
        });

        setEnviados(enviadosData);
        setFilteredEnviados(enviadosData);
      } catch (error) {
        console.error('❌ Error cargando envíos:', error);
        toast.error('Error al cargar los carteles enviados');
      } finally {
        setLoading(false);
      }
    };

    loadEnviados();
  }, []);

  // Filtrado
  useEffect(() => {
    let filtered = enviados;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.tipoCartel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sucursal.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSucursal) {
      filtered = filtered.filter(item => item.sucursal === filterSucursal);
    }

    setFilteredEnviados(filtered);
  }, [searchTerm, filterSucursal, enviados]);

  const handleDownloadPDF = async (item: EnviadoItem) => {
    try {
      toast.loading('Descargando PDF...', { id: 'downloading-pdf' });
      await PosterSendService.downloadPDF(item.pdfUrl, item.pdfFilename);
      toast.success('PDF descargado exitosamente', { id: 'downloading-pdf' });
    } catch (error) {
      console.error('❌ Error descargando PDF:', error);
      toast.error(
        `Error al descargar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        { id: 'downloading-pdf' }
      );
    }
  };

  const sucursalesUnicas = [...new Set(enviados.map(item => item.sucursal))];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onBack={onBack} 
        onLogout={onLogout} 
        userName={userEmail}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al Dashboard</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Carteles Enviados
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona y descarga los carteles que has enviado a las sucursales
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por tipo de cartel o sucursal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Filtro por sucursal */}
            <div className="sm:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterSucursal}
                  onChange={(e) => setFilterSucursal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todas las sucursales</option>
                  {sucursalesUnicas.map(sucursal => (
                    <option key={sucursal} value={sucursal}>{sucursal}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando carteles enviados...</span>
            </div>
          </div>
        ) : (
          /* Tabla */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo de Cartel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cantidad Productos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sucursal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hora Creación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEnviados.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-fuchsia-100 dark:bg-fuchsia-900 rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.tipoCartel}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {item.cantidadProductos}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {item.sucursal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {item.horaCreacion}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDownloadPDF(item)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white rounded-lg hover:from-fuchsia-600 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        Descargar PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            {filteredEnviados.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No hay carteles enviados
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filterSucursal ? 'No se encontraron resultados con los filtros aplicados.' : 'Aún no has enviado ningún cartel.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
