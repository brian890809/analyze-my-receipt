"use client"

import React from "react"

import { useState } from "react"
import { Edit } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import EditEntry from "./edit-entry"

const roundNum = num => Math.round((num + Number.EPSILON) * 100) / 100

const DataTable = ({ data }) => {
  const [expandedRows, setExpandedRows] = useState([])
  const [openIndex, setOpenIndex] = useState(null)
  const [entry, setEntry] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const toggleRow = (id) => {
    setExpandedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }
  const isRowExpanded = (id) => expandedRows.includes(id)
  const handleEdit = (entry, index) => {
    setEntry(entry)
    setOpenIndex(index)
    setIsModalOpen(true)
  }
  const handleUpdate = async (updates) => {
    // Update data
    setIsModalOpen(false)
    setEntry(null)
    const { frontend, backend } = updates
    data[openIndex] = frontend
    await fetch('/api/edit-receipt', {
      method: 'PUT',
      body: JSON.stringify(backend)
    })
  }
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="">Date</TableHead>
            <TableHead className="">Time</TableHead>
            <TableHead className="">Category</TableHead>
            <TableHead className="">Place</TableHead>
            <TableHead className="">Grand Total</TableHead>
            <TableHead className="">Subtotal</TableHead>
            <TableHead className="">Tax</TableHead>
            <TableHead className="">Tip</TableHead>
            <TableHead className="">Currency</TableHead>
            <TableHead className="">Source</TableHead>
            <TableHead className="sticky right-0 bg-gray-50">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="">
          {data.map((entry, index) => {
            return (
            <React.Fragment key={index}>
              <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(index)}>
                <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      {isRowExpanded(index) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                <TableCell className="">{entry.date}</TableCell>
                <TableCell className="">{entry.time}</TableCell>
                <TableCell className="">{entry.category}</TableCell>
                <TableCell className="">{entry.merchant}</TableCell>
                <TableCell className="">{roundNum(entry.grandTotal)}</TableCell>
                <TableCell className="">{roundNum(entry.total)}</TableCell>
                <TableCell className="">{roundNum(entry.tax)}</TableCell>
                <TableCell className="">{roundNum(entry.tip)}</TableCell>
                <TableCell className="">{entry.currency}</TableCell>
                <TableCell className="">{
                  (entry.source) ? <a target="_blank" href={entry.source}>{entry.source}</a> : ""
                }</TableCell>
                <TableCell className="sticky right-0 bg-white dark:bg-gray-950 w-[100px]">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(entry, index)}>
                    <Edit />
                  </Button>
                </TableCell>
              </TableRow>
              {isRowExpanded(index) && (
                <>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-medium"></TableHead>
                    <TableHead colSpan={3} className="font-medium">Description</TableHead>
                    <TableHead colSpan={2} className="font-medium">Quantity</TableHead>
                    <TableHead colSpan={2} className="font-medium">Price</TableHead>
                    <TableHead colSpan={1} className="font-medium">Total</TableHead>
                    <TableHead colSpan={2} className="font-medium"></TableHead>
                  </TableRow>
                  {entry.items.map((item, i) => {
                    return (
                      <TableRow key={i}>
                        <TableCell className="p-2"></TableCell>
                        <TableCell colSpan={3} className="p-2">{item.description}</TableCell>
                        <TableCell colSpan={2} className="p-2">{item.quantity}</TableCell>
                        <TableCell colSpan={2} className="p-2">{item.price}</TableCell>
                        <TableCell colSpan={1} className="p-2">{item.total}</TableCell>
                        <TableCell colSpan={2} className="p-2"></TableCell>
                      </TableRow>
                  )})}
                </>
              )}
            </React.Fragment>
          )})}
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
  );
};

export default DataTable;