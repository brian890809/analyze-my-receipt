"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  flexRender,
  getFilteredRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import EditEntry from "./edit-entry"
import DateFilter from "./date-filter"

const DataTable = ({ customColumns, data }) => {
  if (!customColumns) {
    customColumns = columns
  }
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dateRange, setDateRange] = useState(null)
  const [filteredData, setFilteredData] = useState(data)
  useEffect(() => {
    setFilteredData(data)
  }, [data])
  const handleUpdate = async (updates) => {
    const { frontend, backend } = updates
    data[openIndex] = frontend
    await fetch('/api/edit-receipt', {
      method: 'PUT',
      body: JSON.stringify(backend)
    })
    // Update data
    setIsModalOpen(false)
    setEntry(null)
  }
  const handleEdit = (entry, index) => {
    setEntry(entry)
    setOpenIndex(index)
    setIsModalOpen(true)
  }
  
  const applyDateFilter = () => {
    if (!dateRange) {
      setFilteredData(data)
      return
    }
    const filtered = data.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= dateRange.from && itemDate <= dateRange.to
    })
    setFilteredData(filtered)
  }
  
  const clearDateFilter = () => {
    setDateRange(null)
    setFilteredData(data)
  }

  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])

  const [expandedRows, setExpandedRows] = useState([])
  const [openIndex, setOpenIndex] = useState(null)
  const [entry, setEntry] = useState(null)
  const toggleRow = (id) => {
    setExpandedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }
  const isRowExpanded = (id) => expandedRows.includes(id)
  
  const table = useReactTable({
    data: filteredData,
    columns: customColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    meta: {
      isModalOpen,
      setIsModalOpen,
      handleUpdate,
      handleEdit,
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <DateFilter 
          dateRange={dateRange} 
          setDateRange={setDateRange} 
          onApply={applyDateFilter}
          onClear={clearDateFilter}
        />
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow 
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ): (
          <TableRow>
            <TableCell colSpan={customColumns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
          )}
        </TableBody>
      </Table>

      {isModalOpen && (
        <EditEntry
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          entry={entry}
          onUpdate={handleUpdate}
        />
      )}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default DataTable;