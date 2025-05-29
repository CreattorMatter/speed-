import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState
} from '@tanstack/react-table';
import { CheckSquare, Square } from 'lucide-react';
import { type ExtendedProduct } from './useProductFilters';

export const useProductTable = (
  filteredData: ExtendedProduct[],
  selectedRows: Record<string, boolean>,
  globalFilter: string,
  onToggleProductSelection: (productId: string) => void,
  onTogglePageSelection: (currentPageData: ExtendedProduct[]) => void,
  isPageFullySelected: (currentPageData: ExtendedProduct[]) => boolean,
  isPagePartiallySelected: (currentPageData: ExtendedProduct[]) => boolean
) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50
  });

  // Definición de columnas
  const columns = useMemo<ColumnDef<ExtendedProduct, any>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => {
        const currentPageData = table.getRowModel().rows.map(row => row.original);
        const allSelected = isPageFullySelected(currentPageData);
        const someSelected = isPagePartiallySelected(currentPageData);
        
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTogglePageSelection(currentPageData)}
              className="w-5 h-5 flex items-center justify-center border-2 border-gray-300 rounded transition-colors hover:border-indigo-500"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              ) : someSelected ? (
                <div className="w-3 h-3 bg-indigo-600 rounded-sm" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <span className="text-xs text-gray-500">Todo</span>
          </div>
        );
      },
      cell: ({ row }) => (
        <button
          onClick={() => onToggleProductSelection(row.original.id)}
          className="w-5 h-5 flex items-center justify-center border-2 border-gray-300 rounded transition-colors hover:border-indigo-500"
        >
          {selectedRows[row.original.id] ? (
            <CheckSquare className="w-4 h-4 text-indigo-600" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>
      ),
      size: 50,
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'name',
      header: 'Descripción',
      cell: ({ getValue, row }) => (
        <div className="min-w-0">
          <div className="font-medium text-gray-900 truncate" title={getValue() as string}>
            {getValue() as string}
          </div>
          <div className="text-sm text-gray-500 truncate" title={row.original.description}>
            {row.original.description}
          </div>
        </div>
      ),
      size: 250,
    },
    {
      accessorKey: 'category',
      header: 'Categoría',
      cell: ({ getValue }) => (
        <span className="text-sm font-medium text-gray-700">{getValue() as string}</span>
      ),
      size: 120,
    },
    {
      accessorKey: 'subCategory',
      header: 'Subcategoría',
      cell: ({ getValue }) => {
        const subCategory = getValue() as string;
        return subCategory ? (
          <span className="text-sm text-gray-600">{subCategory}</span>
        ) : (
          <span className="text-sm text-gray-400 italic">Sin subcategoría</span>
        );
      },
      size: 150,
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ getValue }) => (
        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
          {getValue() as string}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: 'ean',
      header: 'EAN',
      cell: ({ getValue }) => (
        <span className="text-xs font-mono text-gray-600">{getValue() as string}</span>
      ),
      size: 120,
    },
    {
      accessorKey: 'price',
      header: 'Precio',
      cell: ({ getValue }) => (
        <span className="font-semibold text-green-600">
          ${(getValue() as number)?.toLocaleString()}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: 'stockSucursal',
      header: 'Stock',
      cell: ({ getValue }) => {
        const stock = (getValue() as number) || 0;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-medium ${stock > 50 ? 'text-green-600' : stock > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
              {stock}
            </span>
            <div className={`w-2 h-2 rounded-full ${stock > 50 ? 'bg-green-500' : stock > 10 ? 'bg-yellow-500' : 'bg-red-500'}`} />
          </div>
        );
      },
      size: 80,
    },
  ], [selectedRows, onToggleProductSelection, onTogglePageSelection, isPageFullySelected, isPagePartiallySelected]);

  // Configuración de la tabla
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  return {
    table,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    pagination,
    setPagination,
    columns
  };
}; 