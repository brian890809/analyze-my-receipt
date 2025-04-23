"use client"

import { Edit, ArrowUpDown, ChevronDown, ChevronUp, Ellipsis, Trash, ListStart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, parse } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

const roundNum = num => Math.round((num + Number.EPSILON) * 100) / 100

export const getColumns = (onOpenEdit, onOpenRank) => [
    {
        header: "",
        accessorKey: "expand",
        cell: ({ row }) => {
            return (
                <Button variant="ghost" size="icon" className="text-primary/70 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200" onClick={() => row.toggleExpanded()}>
                    {row.getIsExpanded() ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            )
        }
    },
    {
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="font-medium hover:bg-primary/5"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Date
                <ArrowUpDown className="ml-1 h-4 w-4 opacity-70" />
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
            const date = parse(time, "HH:mm:ss", new Date());
            const formatted = format(date, "h:mm a");
            return <div className="text-center font-medium text-muted-foreground">{formatted}</div>
        },
        // Hide on small screens
        meta: {
            skipVisible: true, // flag for mobile visibility
        }
    },
    {
        header: "Category",
        accessorKey: "category",
        cell: ({ row }) => {
            return <div className="font-medium">{row.original.category}</div>
        },
        // Hide on small screens
        meta: {
            skipVisible: true, // flag for mobile visibility
        }
    },
    {
        header: "Shop",
        accessorKey: "merchant",
        cell: ({ row }) => {
            return <div className="font-medium">{row.original.merchant}</div>
        }
    },
    {
        header:({ column }) => (
            <Button
                variant="ghost"
                className="font-medium hover:bg-primary/5"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Total
                <ArrowUpDown className="ml-1 h-4 w-4 opacity-70" />
            </Button>
        ),
        accessorKey: "grandTotal",
        cell: ({ row }) => {
            const amount = roundNum(row.original.grandTotal)
            const currency = row.original.currency === "$" ? "USD" : row.original.currency
            let formatted
            try {
                formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: currency,
                  }).format(amount)
            } catch (e) {
                formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(amount)
            }
            return <div className="text-right font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">{formatted}</div>
        }
    },
    {
        header: () => <div className="text-right">Subtotal</div>,
        accessorKey: "total",
        cell: ({ row }) => {
            const amount = roundNum(row.original.total)
            const currency = row.original.currency
            let formatted
            try {
                formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: currency,
                  }).format(amount)
            } catch (e) {
                formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(amount)
            }
            return <div className="text-right font-medium text-muted-foreground">{formatted}</div>
        },
        // Hide on small screens
        meta: {
            skipVisible: true, // flag for mobile visibility
        }
    },
    {
        header: () => <div className="text-right">Tax</div>,
        accessorKey: "tax",
        cell: ({ row }) => {
            const amount = roundNum(row.original.tax)
            const currency = row.original.currency
            let formatted
            try {
                formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: currency,
                  }).format(amount)
            } catch (e) {
                formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(amount)
            }
            return <div className="text-right font-medium text-muted-foreground">{formatted}</div>
        },
        // Hide on small screens
        meta: {
            skipVisible: true, // flag for mobile visibility
        }
    },
    {
        header: () => <div className="text-right">Tip</div>,
        accessorKey: "tip",
        cell: ({ row }) => {
            const amount = roundNum(row.original.tip)
            const currency = row.original.currency
            let formatted
            try {
                formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: currency,
                  }).format(amount)
            } catch (e) {
                formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(amount)
            }
            return <div className="text-right font-medium text-muted-foreground">{formatted}</div>
        },
        // Hide on small screens
        meta: {
            skipVisible: true, // flag for mobile visibility
        }
    },  
    {
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="font-medium hover:bg-primary/5"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Currency
                <ArrowUpDown className="ml-1 h-4 w-4 opacity-70" />
            </Button>
        ),
        accessorKey: "currency",
        cell: ({ row }) => {
            const currency = row.original.currency
            return <div className="text-center font-light italic text-muted-foreground" style={{ textTransform: "uppercase" }}>{currency}</div>
        },
        // Hide on small screens
        meta: {
            skipVisible: true, // flag for mobile visibility
        }
    },
    {
        header: "Source",
        accessorKey: "source",
        cell: ({ row }) => {
            const source = row.original.source
            return <div className="font-light italic max-w-40 truncate text-muted-foreground" title={source}>{source}</div>
        },
        // Hide on small screens
        meta: {
            skipVisible: true, // flag for mobile visibility
        }
    },
    {
        header: "",
        accessorKey: "actions",
        cell: ({ row, table }) => {
            const entry = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5">
                            <Ellipsis />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="rounded-xl shadow-lg border-0 bg-white/80 backdrop-blur-md">
                        <DropdownMenuItem 
                            className="hover:bg-primary/5 focus:bg-primary/5 rounded-lg my-1 cursor-pointer" 
                            onClick={() => {
                                // Close dropdown and then open edit dialog
                                // This prevents focus management conflict
                                setTimeout(() => {
                                    onOpenEdit(entry, row.index);
                                }, 0);
                            }}
                        >
                            <Edit className="mr-2 h-4 w-4" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="hover:bg-primary/5 focus:bg-primary/5 rounded-lg my-1 cursor-pointer" 
                            onClick={() => {
                                // Close dropdown and then open rank dialog
                                // This prevents focus management conflict
                                setTimeout(() => {
                                    onOpenRank(entry, row.index);
                                }, 0);
                            }}
                        >
                            <ListStart className="mr-2 h-4 w-4" />Rank
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-destructive/5 focus:bg-destructive/5 text-destructive rounded-lg my-1 cursor-pointer">
                            <Trash className="mr-2 h-4 w-4" />Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
    },
]

// Function to filter columns for mobile screens
export const getMobileColumns = (columns) => {
    return columns.filter(column => !column.meta?.skipVisible);
}   