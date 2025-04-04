"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
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
              "w-[240px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <div className="flex flex-row space-y-2">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => handleQuickSelect(7)}
              >
                Last 7 days
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => handleQuickSelect(30)}
              >
                Last 30 days
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  const start = new Date()
                  start.setDate(1)
                  setDateRange({ from: start, to: new Date() })
                }}
              >
                Current month
              </Button>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
            <div className="flex justify-end space-x-2 p-3">
              <Button variant="destructive" onClick={() => {
                onClear()
                setIsOpen(false)
              }}
              >
                Clear
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                onApply()
                setIsOpen(false)
              }}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 