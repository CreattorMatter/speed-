import React from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import { SortAsc, SortDesc } from 'lucide-react';
import { type ExtendedProduct } from '../hooks/useProductFilters';

interface ProductTableProps {
  table: Table<ExtendedProduct>;
  selectedRows: Record<string, boolean>;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  table,
  selectedRows
}) => {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 sticky top-0 z-10">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={`flex items-center gap-2 ${
                        header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-700' : ''
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <div className="flex flex-col">
                          {header.column.getIsSorted() === 'asc' ? (
                            <SortAsc className="w-3 h-3 text-indigo-600" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <SortDesc className="w-3 h-3 text-indigo-600" />
                          ) : (
                            <div className="w-3 h-3 text-gray-400">
                              <SortAsc className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row, index) => (
            <tr
              key={row.id}
              className={`hover:bg-gray-50 transition-colors ${
                selectedRows[row.original.id] ? 'bg-indigo-50' : ''
              } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
            >
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-4 py-3 whitespace-nowrap text-sm"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 