import React, { useRef, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDownIcon } from '../icons/Icons';

interface TableColumn<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
  sortKey?: keyof T;
}

interface SortConfig<T> {
    key: keyof T;
    direction: 'ascending' | 'descending';
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  sortConfig?: SortConfig<T> | null;
  requestSort?: (key: keyof T) => void;
  onRowClick?: (item: T) => void;
  expandedRowId?: string | number | null;
  renderExpandedRow?: (item: T) => React.ReactNode;
  isSelectable?: boolean;
  selectedIds?: Array<string | number>;
  onSelectionChange?: (newSelectedIds: Array<string | number>) => void;
  itemClassName?: (item: T) => string;
}

const Table = <T extends { id: string | number },>(
  { 
    columns, 
    data, 
    sortConfig, 
    requestSort, 
    onRowClick, 
    expandedRowId, 
    renderExpandedRow,
    isSelectable = false,
    selectedIds = [],
    onSelectionChange,
    itemClassName
  }: TableProps<T>
) => {
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  const getSortIcon = (key: keyof T) => {
    if (sortConfig && sortConfig.key === key) {
        if (sortConfig.direction === 'ascending') {
            return <ChevronUpIcon className="h-4 w-4 inline-block ml-1" />;
        }
        return <ChevronDownIcon className="h-4 w-4 inline-block ml-1" />;
    }
    // For non-active but sortable columns, show a faint up/down icon on hover
    return <ChevronsUpDownIcon className="h-4 w-4 inline-block ml-1 text-dark-text-secondary opacity-0 group-hover:opacity-50 transition-opacity" />;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectionChange?.(data.map(item => item.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string | number) => {
    if (e.target.checked) {
      onSelectionChange?.([...selectedIds, id]);
    } else {
      onSelectionChange?.(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const numSelected = selectedIds.length;
  const rowCount = data.length;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
        selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < rowCount;
    }
  }, [numSelected, rowCount]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-dark-card text-dark-text">
        <thead className="bg-gray-700/50">
          <tr>
            {isSelectable && (
              <th scope="col" className="p-4">
                <input
                    type="checkbox"
                    ref={selectAllCheckboxRef}
                    className="h-4 w-4 rounded border-gray-500 text-brand-primary focus:ring-transparent bg-dark-bg"
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={handleSelectAll}
                />
              </th>
            )}
            {columns.map((col, index) => {
              const isSortable = !!(col.sortKey && requestSort);
              return (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider group ${col.className || ''} ${isSortable ? 'cursor-pointer hover:bg-gray-600/50' : ''}`}
                  onClick={isSortable ? () => requestSort(col.sortKey!) : undefined}
                >
                  <div className="flex items-center">
                    {col.header}
                    {isSortable && getSortIcon(col.sortKey!)}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border">
          {data.length > 0 ? (
            data.map((item) => (
              <React.Fragment key={item.id}>
                <tr 
                    className={`transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''} ${selectedIds.includes(item.id) ? 'bg-blue-900/30' : 'even:bg-dark-border/10 hover:bg-dark-border/50'} ${expandedRowId === item.id ? '!bg-dark-border/40' : ''} ${itemClassName ? itemClassName(item) : ''}`}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {isSelectable && (
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                       <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-500 text-brand-primary focus:ring-transparent bg-dark-bg"
                            checked={selectedIds.includes(item.id)}
                            onChange={(e) => handleSelectOne(e, item.id)}
                        />
                    </td>
                  )}
                  {columns.map((col, index) => (
                    <td key={index} className={`px-6 py-4 whitespace-nowrap text-sm ${col.className || ''}`}>
                      {col.accessor(item)}
                    </td>
                  ))}
                </tr>
                {renderExpandedRow && expandedRowId === item.id && (
                  <tr className="bg-dark-bg">
                      <td colSpan={columns.length + (isSelectable ? 1: 0)} className="p-0">
                          {renderExpandedRow(item)}
                      </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (isSelectable ? 1: 0)} className="px-6 py-8 text-center text-dark-text-secondary">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;