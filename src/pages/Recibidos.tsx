import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Search, Filter, Calendar, FileText, Users, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/shared/Header';
import { PosterSendService, type PosterSendItem } from '../services/posterSendService';
import { toast } from 'react-hot-toast';

interface RecibidoItem {
  id: string;
  numero: number;
  tipoCartel: string;
  cantidadProductos: number;
  horaRecibido: string;
  pdfUrl: string;
  pdfFilename: string;
  status: string;
  groupName: string;
}

interface RecibidosProps {
  onBack: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
}

export const Recibidos: React.FC<RecibidosProps> = ({ onBack, onLogout, userEmail, userName }) => {
  const navigate = useNavigate();
  const [recibidos, setRecibidos] = useState<RecibidoItem[]>([]);
  const [filteredRecibidos, setFilteredRecibidos] = useState<RecibidoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [downloadingItems, setDownloadingItems] = useState<Set<string>>(new Set());

  // Cargar datos reales de recibidos
  useEffect(() => {
    const loadRecibidos = async () => {
      try {
        setLoading(true);
        const receivedItems = await PosterSendService.getReceivedPosters();
        
        // Convertir a formato de la UI
        const recibidosData: RecibidoItem[] = receivedItems.map((item, index) => ({
          id: item.id,
          numero: index + 1001, // Numeración secuencial
          tipoCartel: (item as any).poster_sends?.template_name || 'Cartel',
          cantidadProductos: (item as any).poster_sends?.products_count || 0,
          horaRecibido: new Date(item.created_at).toLocaleString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          pdfUrl: item.pdf_url,
          pdfFilename: item.pdf_filename,
          status: item.status,
          groupName: item.group_name
        }));

        setRecibidos(recibidosData);
        setFilteredRecibidos(recibidosData);
      } catch (error) {
        console.error('❌ Error cargando recibidos:', error);
        toast.error('Error al cargar los carteles recibidos');
      } finally {
        setLoading(false);
      }
    };

    loadRecibidos();
  }, []);

  // Filtrado
  useEffect(() => {
    let filtered = recibidos;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.tipoCartel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.numero.toString().includes(searchTerm)
      );
    }

    if (filterTipo) {
      filtered = filtered.filter(item => item.tipoCartel === filterTipo);
    }

    setFilteredRecibidos(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, filterTipo, recibidos]);

  const handleDownloadPDF = async (item: RecibidoItem) => {
    const downloadKey = `${item.pdfUrl}-${item.pdfFilename}`;
    
    // Prevenir descargas duplicadas
    if (downloadingItems.has(downloadKey)) {
      toast.error('Descarga ya en progreso para este archivo', { duration: 2000 });
      return;
    }

    // Marcar como descargando
    setDownloadingItems(prev => new Set(prev).add(downloadKey));
    
    try {
      toast.loading('Descargando PDF...', { id: `download-${item.id}` });
      await PosterSendService.downloadPDF(item.pdfUrl, item.pdfFilename);
      toast.success('PDF descargado exitosamente', { 
        id: `download-${item.id}`,
        duration: 3000
      });
    } catch (error) {
      console.error('❌ Error descargando PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(
        `Error al descargar PDF: ${errorMessage}`,
        { 
          id: `download-${item.id}`,
          duration: 5000
        }
      );
    } finally {
      // Limpiar estado de descarga después de un delay
      setTimeout(() => {
        setDownloadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(downloadKey);
          return newSet;
        });
      }, 1000);
    }
  };

  const tiposUnicos = [...new Set(recibidos.map(item => item.tipoCartel))];

  // Pagination Logic
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredRecibidos.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredRecibidos.length / itemsPerPage);

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
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-600 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Carteles Recibidos
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Visualiza y descarga los carteles que has recibido de central
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
                  placeholder="Buscar por tipo de cartel o número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Filtro por tipo */}
            <div className="sm:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos los tipos</option>
                  {tiposUnicos.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando carteles recibidos...</span>
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
                    Número
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo de Cartel
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cantidad Productos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hora Recibido
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Hash className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.numero}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
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
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {item.horaRecibido}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDownloadPDF(item)}
                        disabled={downloadingItems.has(`${item.pdfUrl}-${item.pdfFilename}`)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-cyan-600"
                      >
                        {downloadingItems.has(`${item.pdfUrl}-${item.pdfFilename}`) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Descargando...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Descargar PDF
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Filas por página:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="py-1 px-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Página {currentPage} de {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}

            {filteredRecibidos.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No hay carteles recibidos
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filterTipo ? 'No se encontraron resultados con los filtros aplicados.' : 'Aún no has recibido ningún cartel.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
