import React from 'react';
import { type Table } from '@tanstack/react-table';
import { type ExtendedProduct } from '../hooks/useProductFilters';

interface PaginationControlsProps {
  table: Table<ExtendedProduct>;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({ table }) => {
  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </span>
        <span>|</span>
        <span>
          {table.getFilteredRowModel().rows.length} productos
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Primera
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Última
        </button>
      </div>
    </div>
  );
}; 