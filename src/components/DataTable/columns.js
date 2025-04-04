"use client"

import { Edit, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const roundNum = num => Math.round((num + Number.EPSILON) * 100) / 100

export const columns = [
    {
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Date
                <ArrowUpDown className="ml-1 h-4 w-4" />
            </Button>
        ),
        accessorKey: "date",
        cell: ({ row }) => {
            const date = new Date(row.original.date)
            const formatted = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            })
            return <div className="text-center font-medium">{formatted}</div>
        }
    },
    {
        header: "Time",
        accessorKey: "time",
        cell: ({ row }) => {
            const time = row.original.time
            const [hours, minutes, seconds] = time.split(":").map(Number);
            const formatted = new Date(0, 0, 0, hours, minutes, seconds).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric", 
                hour12: true 
            })
            return <div className="text-center font-medium">{formatted}</div>
        }
    },
    {
        header: "Category",
        accessorKey: "category",
    },
    {
        header: "Shop",
        accessorKey: "merchant",
    },
    {
        header:({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Total
                <ArrowUpDown className="ml-1 h-4 w-4" />
            </Button>
        ),
        accessorKey: "grandTotal",
        cell: ({ row }) => {
            const amount = roundNum(row.original.grandTotal)
            const currency = row.original.currency
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
              }).format(amount)
            return <div className="text-right font-medium">{formatted}</div>
        }
    },
    {
        header: () => <div className="text-right">Subtotal</div>,
        accessorKey: "total",
        cell: ({ row }) => {
            const amount = roundNum(row.original.total)
            const currency = row.original.currency
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
              }).format(amount)
            return <div className="text-right font-medium">{formatted}</div>
        }
    },
    {
        header: () => <div className="text-right">Tax</div>,
        accessorKey: "tax",
        cell: ({ row }) => {
            const amount = roundNum(row.original.tax)
            const currency = row.original.currency
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
              }).format(amount)
            return <div className="text-right font-medium">{formatted}</div>
        }
    },
    {
        header: () => <div className="text-right">Tip</div>,
        accessorKey: "tip",
        cell: ({ row }) => {
            const amount = roundNum(row.original.tip)
            const currency = row.original.currency
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
              }).format(amount)
            return <div className="text-right font-medium">{formatted}</div>
        }
    },  
    {
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Currency
                <ArrowUpDown className="ml-1 h-4 w-4" />
            </Button>
        ),
        accessorKey: "currency",
        cell: ({ row }) => {
            const currency = row.original.currency
            return <div className="text-center font-medium" style={{ textTransform: "uppercase" }}>{currency}</div>
        }
    },
    {
        header: "Source",
        accessorKey: "source",
    },
    {
        header: "",
        accessorKey: "actions",
        cell: ({ row, table }) => {
            const entry = row.original
            return (
            <Button variant="ghost" size="icon" onClick={() => table.options.meta?.handleEdit(entry, row.index)}>
                <Edit />
            </Button>)
        }
    }
]   