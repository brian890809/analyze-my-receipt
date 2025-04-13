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
import { getColumns, getMobileColumns } from "./columns"
import { Button } from "@/components/ui/button"
import EditEntry from "./edit-entry"
import DateFilter from "./date-filter"
import SortableDishes from "@/components/SortableDishes"
import { Info } from "lucide-react"

const DataTable = ({ customColumns, data }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRankModalOpen, setIsRankModalOpen] = useState(false)
  const [dateRange, setDateRange] = useState(null)
  const [filteredData, setFilteredData] = useState(data)
  const [isMobile, setIsMobile] = useState(false)
  const [activeColumns, setActiveColumns] = useState([])
  
  // Handle responsive columns based on screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    // Initial check
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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

  const handleViewDetails = (entry, index) => {
    setEntry(entry)
    setOpenIndex(index)
    setIsEditModalOpen(true)
  }
  
  // Get the appropriate columns based on device size
  useEffect(() => {
    if (!customColumns) {
      const fullColumns = getColumns(handleEdit, handleRank);
      setActiveColumns(isMobile ? getMobileColumns(fullColumns) : fullColumns);
    } else {
      setActiveColumns(customColumns);
    }
  }, [customColumns, isMobile]);
  
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
    columns: activeColumns,
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
      handleViewDetails,
    }
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between py-4">
        <DateFilter 
          dateRange={dateRange} 
          setDateRange={setDateRange} 
          onApply={applyDateFilter}
          onClear={clearDateFilter}
        />
        
        {isMobile && (
          <div className="text-sm text-muted-foreground flex items-center">
            <Info className="mr-2 h-4 w-4" />
            <span>Tap a row to see more details</span>
          </div>
        )}
      </div>
      <div className="rounded-2xl border overflow-hidden shadow-sm bg-white/80 backdrop-blur-sm">
        <Table className="min-w-full divide-y divide-gray-100">
          <TableHeader className="bg-gray-50/50 backdrop-blur-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-gray-100">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    className={`
                      ${header.id === "source" ? "max-w-40" : ""} 
                      py-3 px-3 text-sm font-medium text-gray-700
                    `} 
                    key={header.id}
                  >
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
                  className={`
                    group border-b border-gray-50 transition-colors duration-200
                    ${isMobile ? 'cursor-pointer hover:bg-primary/5' : ''}
                  `}
                  onClick={isMobile ? () => handleViewDetails(row.original, row.index) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      className={`
                        ${cell.column.id.endsWith("source") ? "max-w-40" : ""} 
                        py-3 px-3 
                        ${isMobile ? "first:pl-3 last:pr-3" : ""}
                      `} 
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && (
                  <TableRow className="bg-gray-50/30">
                    <TableCell colSpan={activeColumns.length} className="p-0">
                      <div className="p-4 overflow-x-auto">
                        <Table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden">
                          <TableHeader className="bg-gray-100/50">
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
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          ): (
          <TableRow>
            <TableCell colSpan={activeColumns.length} className="h-24 text-center">
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
          entry={entry}
        />
      )}
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{table.getRowModel().rows.length}</span> of{" "}
          <span className="font-medium">{data.length}</span> entries
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl px-4 py-2 hover:bg-primary/5 hover:text-primary border border-gray-200"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl px-4 py-2 hover:bg-primary/5 hover:text-primary border border-gray-200"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;