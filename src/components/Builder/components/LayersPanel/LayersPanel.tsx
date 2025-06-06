import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectElements,
  selectSelectedElements,
  selectElement,
  selectMultipleElements,
  clearSelection,
  removeElement,
  duplicateElement,
  updateElement,
  moveElementToFront,
  moveElementToBack,
  CartelElement
} from '../../redux/builderSlice';

// ====================================
// TIPOS Y INTERFACES
// ====================================

interface LayersPanelProps {
  className?: string;
}

interface LayerItemProps {
  element: CartelElement;
  isSelected: boolean;
  index: number;
  onSelect: (id: string, multiSelect?: boolean) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

interface LayerContextMenuProps {
  element: CartelElement;
  position: { x: number; y: number };
  onClose: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMoveToFront: (id: string) => void;
  onMoveToBack: (id: string) => void;
  onRename: (id: string) => void;
}

// ====================================
// UTILITARIOS
// ====================================

const getElementDisplayName = (element: CartelElement): string => {
  switch (element.type) {
    case 'precio':
      return `Precio: ${element.content.moneda}${element.content.precio}`;
    case 'descuento':
      return `Descuento: ${element.content.etiqueta || 'Sin etiqueta'}`;
    case 'producto':
      return `Producto: ${element.content.nombre}`;
    case 'texto-libre':
      return `Texto: ${element.content.texto.slice(0, 20)}${element.content.texto.length > 20 ? '...' : ''}`;
    case 'imagen':
      return `Imagen: ${element.content.alt || 'Sin descripción'}`;
    case 'logo':
      return `Logo: ${element.content.empresa}`;
    case 'cuotas':
      return `Cuotas: ${element.content.numeroCuotas} cuotas`;
    case 'origen':
      return `Origen: ${element.content.pais}`;
    case 'codigo':
      return `Código: ${element.content.codigo}`;
    case 'fecha':
      return `Fecha: ${element.content.texto}`;
    case 'nota-legal':
      return `Nota Legal: ${element.content.texto.slice(0, 15)}...`;
    default:
      return `Elemento: ${element.type}`;
  }
};

const getElementIcon = (element: CartelElement): string => {
  switch (element.type) {
    case 'precio': return '💵';
    case 'descuento': return '🏷️';
    case 'producto': return '📦';
    case 'texto-libre': return '📝';
    case 'imagen': return '🖼️';
    case 'logo': return '🏢';
    case 'cuotas': return '💳';
    case 'origen': return '🌍';
    case 'codigo': return '📱';
    case 'fecha': return '📅';
    case 'nota-legal': return '⚖️';
    default: return '❓';
  }
};

// ====================================
// COMPONENTES
// ====================================

const LayerContextMenu: React.FC<LayerContextMenuProps> = ({
  element,
  position,
  onClose,
  onDelete,
  onDuplicate,
  onMoveToFront,
  onMoveToBack,
  onRename
}) => {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed bg-white border border-gray-300 rounded-lg shadow-lg py-2 z-50 min-w-[160px]"
        style={{ left: position.x, top: position.y }}
      >
        <button
          onClick={() => {
            onRename(element.id);
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ✏️ Renombrar
        </button>
        <button
          onClick={() => {
            onDuplicate(element.id);
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          📋 Duplicar
        </button>
        <div className="border-t border-gray-200 my-1" />
        <button
          onClick={() => {
            onMoveToFront(element.id);
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ⬆️ Traer al frente
        </button>
        <button
          onClick={() => {
            onMoveToBack(element.id);
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ⬇️ Enviar atrás
        </button>
        <div className="border-t border-gray-200 my-1" />
        <button
          onClick={() => {
            onDelete(element.id);
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          🗑️ Eliminar
        </button>
      </div>
    </>
  );
};

const LayerItem: React.FC<LayerItemProps> = ({
  element,
  isSelected,
  index,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onDuplicate,
  onRename
}) => {
  const dispatch = useDispatch();
  const [isRenaming, setIsRenaming] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    const multiSelect = e.ctrlKey || e.metaKey;
    onSelect(element.id, multiSelect);
  };

  const handleStartRename = () => {
    setIsRenaming(true);
    setContextMenu(null);
  };

  return (
    <>
      <div
        className={`
          layer-item group flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
          ${isSelected 
            ? 'bg-blue-100 border-2 border-blue-300' 
            : 'bg-white hover:bg-gray-50 border border-gray-200'
          }
          ${element.locked ? 'opacity-60' : ''}
        `}
        onClick={handleSelect}
        onContextMenu={handleRightClick}
        draggable={!element.locked}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', element.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
      >
        {/* Índice de capa */}
        <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded text-xs flex items-center justify-center text-gray-600 font-mono">
          {index + 1}
        </div>

        {/* Icono del tipo de elemento */}
        <div className="flex-shrink-0 text-lg">
          {getElementIcon(element)}
        </div>

        {/* Información del elemento */}
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              type="text"
              defaultValue={getElementDisplayName(element)}
              className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              onBlur={(e) => {
                onRename(element.id, e.target.value);
                setIsRenaming(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onRename(element.id, e.currentTarget.value);
                  setIsRenaming(false);
                }
                if (e.key === 'Escape') {
                  setIsRenaming(false);
                }
              }}
              autoFocus
            />
          ) : (
            <div>
              <div className="text-sm font-medium text-gray-800 truncate">
                {getElementDisplayName(element)}
              </div>
              <div className="text-xs text-gray-500">
                {element.size.width}×{element.size.height}px • z:{element.zIndex}
              </div>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="flex-shrink-0 flex items-center space-x-1">
          {/* Toggle visibilidad */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(element.id);
            }}
            className={`w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors ${
              element.visible ? 'text-gray-700' : 'text-gray-400'
            }`}
            title={element.visible ? 'Ocultar elemento' : 'Mostrar elemento'}
          >
            {element.visible ? '👁️' : '🚫'}
          </button>

          {/* Toggle bloqueo */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock(element.id);
            }}
            className={`w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors ${
              element.locked ? 'text-red-600' : 'text-gray-400'
            }`}
            title={element.locked ? 'Desbloquear elemento' : 'Bloquear elemento'}
          >
            {element.locked ? '🔒' : '🔓'}
          </button>

          {/* Menú de acciones (solo visible en hover) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setContextMenu({ x: e.clientX, y: e.clientY });
            }}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
            title="Más opciones"
          >
            ⋮
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <LayerContextMenu
          element={element}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onMoveToFront={(id) => dispatch(moveElementToFront(id))}
          onMoveToBack={(id) => dispatch(moveElementToBack(id))}
          onRename={handleStartRename}
        />
      )}
    </>
  );
};

// ====================================
// COMPONENTE PRINCIPAL
// ====================================

const LayersPanel: React.FC<LayersPanelProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  
  // Selectores Redux
  const elements = useSelector(selectElements);
  const selectedElements = useSelector(selectSelectedElements);
  
  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Elementos ordenados por zIndex (mayor a menor para mostrar los de arriba primero)
  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  // Filtrar elementos según búsqueda y tipo
  const filteredElements = sortedElements.filter(element => {
    const matchesSearch = searchTerm === '' || 
      getElementDisplayName(element).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || element.type === filterType;
    return matchesSearch && matchesType;
  });

  // Obtener tipos únicos para el filtro
  const availableTypes = Array.from(new Set(elements.map(el => el.type)));

  // Handlers
  const handleSelectElement = useCallback((id: string, multiSelect = false) => {
    if (multiSelect) {
      const isSelected = selectedElements.some(el => el.id === id);
      if (isSelected) {
        const newSelection = selectedElements.filter(el => el.id !== id).map(el => el.id);
        dispatch(selectMultipleElements(newSelection));
      } else {
        dispatch(selectMultipleElements([...selectedElements.map(el => el.id), id]));
      }
    } else {
      dispatch(selectElement(id));
    }
  }, [dispatch, selectedElements]);

  const handleToggleVisibility = useCallback((id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      dispatch(updateElement({
        id,
        updates: { visible: !element.visible }
      }));
    }
  }, [dispatch, elements]);

  const handleToggleLock = useCallback((id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      dispatch(updateElement({
        id,
        updates: { locked: !element.locked }
      }));
    }
  }, [dispatch, elements]);

  const handleDeleteElement = useCallback((id: string) => {
    dispatch(removeElement(id));
  }, [dispatch]);

  const handleDuplicateElement = useCallback((id: string) => {
    dispatch(duplicateElement(id));
  }, [dispatch]);

  const handleRenameElement = useCallback((id: string, name: string) => {
    // Para elementos tipo texto-libre, actualizar el contenido
    const element = elements.find(el => el.id === id);
    if (element?.type === 'texto-libre') {
      dispatch(updateElement({
        id,
        updates: { content: { ...element.content, texto: name } }
      }));
    }
    // Para otros tipos, aquí se podría implementar un campo "customName" en el estado
  }, [dispatch, elements]);

  const handleSelectAll = () => {
    const allIds = filteredElements.map(el => el.id);
    dispatch(selectMultipleElements(allIds));
  };

  const handleDeselectAll = () => {
    dispatch(clearSelection());
  };

  const handleDeleteSelected = () => {
    if (confirm(`¿Eliminar ${selectedElements.length} elemento(s) seleccionado(s)?`)) {
      selectedElements.forEach(el => dispatch(removeElement(el.id)));
    }
  };

  return (
    <div className={`layers-panel bg-white border-l border-gray-200 w-80 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Capas</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {elements.length} elemento{elements.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Buscador */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Buscar elementos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg 
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filtro por tipo */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos los tipos</option>
          {availableTypes.map(type => (
            <option key={type} value={type}>
              {getElementIcon({ type } as any)} {type}
            </option>
          ))}
        </select>
      </div>

      {/* Controles de selección */}
      {elements.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Seleccionar todo
              </button>
              {selectedElements.length > 0 && (
                <button
                  onClick={handleDeselectAll}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Deseleccionar
                </button>
              )}
            </div>
            
            {selectedElements.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">
                  {selectedElements.length} seleccionado{selectedElements.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Eliminar seleccionados"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lista de capas */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredElements.length === 0 ? (
          <div className="text-center py-8">
            {elements.length === 0 ? (
              <>
                <div className="text-4xl mb-2">📋</div>
                <p className="text-gray-500 text-sm">No hay elementos</p>
                <p className="text-gray-400 text-xs mt-1">
                  Arrastra elementos desde la paleta
                </p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-gray-500 text-sm">No se encontraron elementos</p>
                <p className="text-gray-400 text-xs mt-1">
                  Intenta con otros términos de búsqueda
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredElements.map((element, index) => {
              const isSelected = selectedElements.some(sel => sel.id === element.id);
              
              return (
                <LayerItem
                  key={element.id}
                  element={element}
                  isSelected={isSelected}
                  index={index}
                  onSelect={handleSelectElement}
                  onToggleVisibility={handleToggleVisibility}
                  onToggleLock={handleToggleLock}
                  onDelete={handleDeleteElement}
                  onDuplicate={handleDuplicateElement}
                  onRename={handleRenameElement}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer con información de estadísticas */}
      {elements.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Elementos visibles:</span>
              <span>{elements.filter(el => el.visible).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Elementos bloqueados:</span>
              <span>{elements.filter(el => el.locked).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Z-Index máximo:</span>
              <span>{elements.length > 0 ? Math.max(...elements.map(el => el.zIndex)) : 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayersPanel; 