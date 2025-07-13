"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, MapPin, CalendarIcon, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import type { AttendanceRecord } from "@/lib/database-enhanced"

interface AttendanceHistoryTabProps {
  employeeId: number
}

export default function AttendanceHistoryTab({ employeeId }: AttendanceHistoryTabProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)

  useEffect(() => {
    fetchAttendanceHistory()
  }, [employeeId, selectedDate])

  const formatDate = (dateInput: string | Date): string => {
    try {
      const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    } catch (error) {
      console.error("Date formatting error:", error)
      return "Invalid Date"
    }
  }

  const formatTime = (dateInput: string | Date): string => {
    try {
      const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
      if (isNaN(date.getTime())) {
        return "Invalid Time"
      }
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      console.error("Time formatting error:", error)
      return "Invalid Time"
    }
  }

  const formatDateForAPI = (date: Date): string => {
    try {
      return date.toISOString().split("T")[0]
    } catch (error) {
      console.error("Date API formatting error:", error)
      return new Date().toISOString().split("T")[0]
    }
  }

  const subtractDays = (date: Date, days: number): Date => {
    try {
      const result = new Date(date)
      result.setDate(result.getDate() - days)
      return result
    } catch (error) {
      console.error("Date subtraction error:", error)
      return new Date()
    }
  }

  const fetchAttendanceHistory = async () => {
    try {
      setIsLoading(true)
      const selectedDateStr = formatDateForAPI(selectedDate)

      // Always use date-specific endpoint to ensure we get the right date's data
      const endpoint = `/api/employees/${employeeId}/attendance?date=${selectedDateStr}`

      const response = await fetch(endpoint)
      const data = await response.json()
      setAttendance(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch attendance history:", error)
      setAttendance([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreviousDay = () => {
    setSelectedDate((prev) => subtractDays(prev, 1))
  }

  const handleNextDay = () => {
    const today = new Date()
    if (selectedDate < today) {
      setSelectedDate(subtractDays(selectedDate, -1))
    }
  }

  const isToday = formatDateForAPI(selectedDate) === formatDateForAPI(new Date())

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-200 rounded-lg h-16"></div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Clock className="h-5 w-5 mr-2" />
            Attendance History - {formatDate(selectedDate)}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="min-w-[120px] bg-transparent">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {formatDate(selectedDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date)
                      setCalendarOpen(false)
                    }
                  }}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="sm" onClick={handleNextDay} disabled={isToday}>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={fetchAttendanceHistory} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {attendance.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">No attendance records found for {formatDate(selectedDate)}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attendance.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full ${record.tap_type === "IN" ? "bg-green-500" : "bg-orange-500"}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={record.tap_type === "IN" ? "default" : "secondary"}>
                        {record.tap_type === "IN" ? "Check In" : "Check Out"}
                      </Badge>
                      <span className="text-sm font-medium">{formatTime(record.tap_time)}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(record.tap_time)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{record.node_location || record.location || "Main Entrance"}</span>
                      </div>
                      {record.tap_type === "OUT" && record.duration && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-blue-600 font-medium">Duration: {record.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {record.nfc_card_uid && <div className="text-xs text-slate-400 font-mono">{record.nfc_card_uid}</div>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
