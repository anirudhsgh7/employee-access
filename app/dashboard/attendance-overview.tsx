"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, Users, TrendingUp, RefreshCw, ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import type { AttendanceRecord } from "@/lib/database-enhanced"

interface AttendanceOverviewProps {
  initialAttendance: AttendanceRecord[]
  showFullHistory?: boolean
}

// Safe date formatting functions
const formatDate = (dateInput: string | Date, formatStr = "MMM dd, yyyy"): string => {
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

export default function AttendanceOverview({ initialAttendance, showFullHistory = false }: AttendanceOverviewProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(
    Array.isArray(initialAttendance) ? initialAttendance : [],
  )
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [dayStats, setDayStats] = useState({
    totalEmployees: 0,
    totalCheckIns: 0,
    totalCheckOuts: 0,
  })

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceForDate(formatDateForAPI(selectedDate))
    }
  }, [selectedDate])

  const fetchDayStats = async (dateString: string) => {
    try {
      const today = formatDateForAPI(new Date())
      const endpoint =
        dateString === today ? "/api/attendance/today-stats" : `/api/attendance/date-stats?date=${dateString}`

      const response = await fetch(endpoint)
      if (response.ok) {
        const stats = await response.json()
        setDayStats(stats)
      }
    } catch (error) {
      console.error("Failed to fetch day stats:", error)
    }
  }

  const fetchAttendanceForDate = async (dateString: string) => {
    setIsLoading(true)
    try {
      const today = formatDateForAPI(new Date())
      const endpoint = dateString === today ? "/api/attendance/today" : `/api/attendance/date?date=${dateString}`

      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error(`Failed to fetch attendance: ${response.status}`)
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setAttendance(data)
      } else {
        console.warn("Received non-array attendance data:", data)
        setAttendance([])
      }

      // Fetch stats for the selected date
      await fetchDayStats(dateString)
    } catch (error) {
      console.error("Failed to fetch attendance:", error)
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  {isToday ? "Today's Active Employees" : "Active Employees"}
                </p>
                <p className="text-3xl font-bold">{dayStats.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">{isToday ? "Today's Check-ins" : "Check-ins"}</p>
                <p className="text-3xl font-bold">{dayStats.totalCheckIns}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">{isToday ? "Today's Check-outs" : "Check-outs"}</p>
                <p className="text-3xl font-bold">{dayStats.totalCheckOuts}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records - Only show for full history view */}
      {showFullHistory && (
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-800">
                Attendance History - {formatDate(selectedDate)}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousDay}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="min-w-[150px] bg-transparent">
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
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchAttendanceForDate(formatDateForAPI(selectedDate))}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-slate-200 rounded-lg h-16"></div>
                ))}
              </div>
            ) : !Array.isArray(attendance) ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Data format error</h3>
                <p className="text-slate-500">Expected array but received {typeof attendance}</p>
              </div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No attendance records</h3>
                <p className="text-slate-500">No employee taps recorded for {formatDate(selectedDate)}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            record.tap_type === "IN" ? "bg-green-500" : "bg-orange-500"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{record.employee_name || "Unknown Employee"}</p>
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{record.node_location || record.location || "Main Entrance"}</span>
                          </div>
                          <span>{formatTime(record.tap_time)}</span>
                          {record.tap_type === "OUT" && record.duration && (
                            <span className="text-blue-600 font-medium">• Duration: {record.duration}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={record.tap_type === "IN" ? "default" : "secondary"}>
                        {record.tap_type === "IN" ? "Check In" : "Check Out"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
