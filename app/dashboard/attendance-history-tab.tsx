"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, MapPin } from "lucide-react"
import type { AttendanceRecord } from "@/lib/database-enhanced"

interface AttendanceHistoryTabProps {
  employeeId: number
}

export default function AttendanceHistoryTab({ employeeId }: AttendanceHistoryTabProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAttendanceHistory()
  }, [employeeId])

  const fetchAttendanceHistory = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/attendance`)
      const data = await response.json()
      setAttendance(data)
    } catch (error) {
      console.error("Failed to fetch attendance history:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
        <CardTitle className="flex items-center text-lg">
          <Clock className="h-5 w-5 mr-2" />
          Attendance History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attendance.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">No attendance records found</p>
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
                      <span className="text-sm font-medium">{new Date(record.tap_time).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(record.tap_time).toLocaleDateString()}</span>
                      </div>
                      {record.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{record.location}</span>
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
