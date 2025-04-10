"use client"

import { useState, useEffect, Fragment } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import ItemEntry from "@/components/ItemEntry/ItemEntry";
import {
  flexRender,
  getFilteredRowModel,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { getColumns } from "./columns"
import { Button } from "@/components/ui/button"
import EditEntry from "./edit-entry"
import DateFilter from "./date-filter"
import SortableDishes from "@/components/SortableDishes"

const DataTable = ({ customColumns, data }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRankModalOpen, setIsRankModalOpen] = useState(false)
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
    setIsEditModalOpen(false)
    setEntry(null)
  }
  const handleEdit = (entry, index) => {
    setEntry(entry)
    setOpenIndex(index)
    setIsEditModalOpen(true)
  }
  const handleRank = (entry, index) => {
    setEntry(entry)
    setOpenIndex(index)
    setIsRankModalOpen(true)
  }
  
  if (!customColumns) {
    customColumns = getColumns(handleEdit, handleRank)
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

  const [openIndex, setOpenIndex] = useState(null)
  const [entry, setEntry] = useState(null)
  
  const table = useReactTable({
    data: filteredData,
    columns: customColumns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
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
      handleEdit,
      isEditModalOpen,
      setIsEditModalOpen,
      handleRank,
      isRankModalOpen,
      setIsRankModalOpen,
      handleUpdate,
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
                {headerGroup.headers.map((header) => (
                  <TableHead className={header.id === "source" ? "max-w-40" : ""} key={header.id}>
                    {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                ))}
              </TableRow>
            ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow 
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className={cell.column.id.endsWith("source") ? "max-w-40" : ""} key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && (
                  <TableRow>
                    <TableCell colSpan={customColumns.length} className="h-24">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/6"></TableHead>
                            <TableHead className="w-1/3">Description</TableHead>
                            <TableHead className="w-1/6">Price</TableHead>
                            <TableHead className="w-1/6">Quantity</TableHead>
                            <TableHead className="w-1/6">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <ItemEntry currency={row.original.currency} items={row.original.items} />
                      </Table>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
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

      {isEditModalOpen && (
        <EditEntry
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          entry={entry}
          onUpdate={handleUpdate}
        />
      )}
      {isRankModalOpen && (
        <SortableDishes
          isOpen={isRankModalOpen}
          onClose={() => setIsRankModalOpen(false)}
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