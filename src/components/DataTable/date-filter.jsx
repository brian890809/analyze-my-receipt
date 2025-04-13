"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Calendar as CalendarIconOutline, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function DateFilter({ dateRange, setDateRange, onApply, onClear }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleQuickSelect = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    setDateRange({ from: start, to: end })
  }

  return (
    <div className="flex items-center space-x-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal rounded-xl border border-border/60 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIconOutline className="mr-2 h-4 w-4 text-primary" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  <span className="font-medium">{format(dateRange.from, "LLL dd, y")}</span>
                  <span className="mx-1 text-muted-foreground">to</span>
                  <span className="font-medium">{format(dateRange.to, "LLL dd, y")}</span>
                </>
              ) : (
                <span className="font-medium">{format(dateRange.from, "LLL dd, y")}</span>
              )
            ) : (
              <span>Select date range</span>
            )}
            <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 rounded-xl border border-border/60 bg-white/90 backdrop-blur-md shadow-xl" 
          align="start"
          sideOffset={8}
        >
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg justify-center hover:bg-primary/5 hover:text-primary"
                onClick={() => handleQuickSelect(7)}
              >
                Last 7 days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg justify-center hover:bg-primary/5 hover:text-primary"
                onClick={() => handleQuickSelect(30)}
              >
                Last 30 days
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg justify-center hover:bg-primary/5 hover:text-primary"
                onClick={() => {
                  const start = new Date()
                  start.setDate(1)
                  setDateRange({ from: start, to: new Date() })
                }}
              >
                This month
              </Button>
            </div>
            
            <div className="border-t border-border/30 pt-4">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className="rounded-lg"
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
              />
            </div>
            
            <div className="flex justify-end items-center gap-2 pt-2 border-t border-border/30">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  onClear()
                  setIsOpen(false)
                }}
                className="hover:bg-destructive/5 hover:text-destructive"
              >
                Clear
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary/5"
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  onApply()
                  setIsOpen(false)
                }}
                className="shadow-sm"
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 