"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Key, Calendar, Shield, ShieldX } from "lucide-react"
import type { RoomAccessLog } from "@/lib/database-enhanced"

interface RoomAccessHistoryTabProps {
  employeeId: number
}

export default function RoomAccessHistoryTab({ employeeId }: RoomAccessHistoryTabProps) {
  const [accessLogs, setAccessLogs] = useState<RoomAccessLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRoomAccessHistory()
  }, [employeeId])

  const fetchRoomAccessHistory = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/room-access`)
      const data = await response.json()
      setAccessLogs(data)
    } catch (error) {
      console.error("Failed to fetch room access history:", error)
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
          <Key className="h-5 w-5 mr-2" />
          Room Access History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {accessLogs.length === 0 ? (
          <div className="text-center py-8">
            <Key className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">No room access records found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accessLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {log.access_granted ? (
                      <Shield className="h-5 w-5 text-green-500" />
                    ) : (
                      <ShieldX className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{log.room_name}</span>
                      <Badge variant={log.access_granted ? "default" : "destructive"}>
                        {log.access_granted ? "Granted" : "Denied"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(log.access_time).toLocaleString()}</span>
                      </div>
                      <span>via {log.access_method}</span>
                    </div>
                  </div>
                </div>
                {log.nfc_card_uid && <div className="text-xs text-slate-400 font-mono">{log.nfc_card_uid}</div>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
