'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { SearchInput } from './search-input'

export interface Column<T> {
  key: keyof T
  header: string
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  pagination?: boolean
  itemsPerPage?: number
  onRowClick?: (row: T) => void
  emptyMessage?: string
  searchQuery?: string
  currentPage?: number
  onSearchChange?: (query: string) => void
  onPageChange?: (page: number) => void
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  pagination = true,
  itemsPerPage = 10,
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  searchQuery: externalSearchQuery,
  currentPage: externalCurrentPage,
  onSearchChange,
  onPageChange
}: DataTableProps<T>) {
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const [internalCurrentPage, setInternalCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Usar estado externo si se proporciona, sino usar estado interno
  const searchQuery = externalSearchQuery ?? internalSearchQuery
  const currentPage = externalCurrentPage ?? internalCurrentPage
  
  // Usar setters externos si se proporcionan, sino usar internos
  const handleSearch = onSearchChange ?? setInternalSearchQuery
  const handlePageChange = onPageChange ?? setInternalCurrentPage

  // Filtrar datos
  const filteredData = data.filter(row => {
    if (!searchQuery) return true
    
    return columns.some(column => {
      const value = row[column.key]
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchQuery.toLowerCase())
    })
  })

  // Ordenar datos
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0
    
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1
    
    const comparison = String(aValue).localeCompare(String(bValue))
    return sortDirection === 'asc' ? comparison : -comparison
  })

  // Paginación
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = pagination 
    ? sortedData.slice(startIndex, startIndex + itemsPerPage)
    : sortedData

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return
    
    if (sortColumn === column.key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column.key as keyof T)
      setSortDirection('asc')
    }
  }

  const handleSearchChange = (query: string) => {
    handleSearch(query)
    if (!externalCurrentPage) {
      // Solo resetear página si no se está controlando externamente
      setInternalCurrentPage(1)
    }
  }

  // Generar números de página para mostrar
  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    const maxVisible = 5
    const pages: (number | string)[] = []
    
    if (total <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Mostrar páginas con elipsis
      if (current <= 3) {
        // Inicio: 1, 2, 3, ..., total
        for (let i = 1; i <= 3; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(total)
      } else if (current >= total - 2) {
        // Final: 1, ..., total-2, total-1, total
        pages.push(1)
        pages.push('...')
        for (let i = total - 2; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // Medio: 1, ..., current-1, current, current+1, ..., total
        pages.push(1)
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(total)
      }
    }
    
    return pages
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="flex items-center space-x-2">
          <SearchInput
            placeholder={searchPlaceholder}
            onSearch={handleSearchChange}
            className="flex-1"
          />
        </div>
      )}

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={String(column.key)} className="border-b bg-gray-50">
                    {column.sortable ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleSort(column)}
                        className="h-auto p-0 font-semibold"
                      >
                        {column.header}
                        {sortColumn === column.key && (
                          <span className="ml-2">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </Button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => (
                  <TableRow
                    key={index}
                    onClick={() => onRowClick?.(row)}
                    className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  >
                    {columns.map((column) => (
                      <TableCell 
                        key={String(column.key)} 
                        className="border-b py-3 align-middle"
                      >
                        <div className="min-h-[20px]">
                          {column.render 
                            ? column.render(row[column.key], row)
                            : String(row[column.key] || '')
                          }
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedData.length)} de {sortedData.length} resultados
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="Primera página"
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-2" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Números de página */}
            <div className="flex items-center space-x-1">
              {getPageNumbers(currentPage, totalPages).map((pageNum, index) => (
                <span key={index}>
                  {pageNum === '...' ? (
                    <span className="px-2 py-1 text-sm text-gray-500">...</span>
                  ) : (
                    <Button
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum as number)}
                      className="min-w-[32px]"
                    >
                      {pageNum}
                    </Button>
                  )}
                </span>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Última página"
            >
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
