"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Users, Clock, BarChart3 } from "lucide-react"
import AttendanceOverview from "./attendance-overview"
import EmployeeDirectory from "./employee-directory"
import type { AttendanceRecord } from "@/lib/database-enhanced"

interface DashboardTabsProps {
  initialAttendance: AttendanceRecord[]
}

export default function DashboardTabs({ initialAttendance }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Ensure initialAttendance is always an array
  const safeInitialAttendance = Array.isArray(initialAttendance) ? initialAttendance : []

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span>Overview</span>
        </TabsTrigger>
        <TabsTrigger value="employees" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Employees</span>
        </TabsTrigger>
        <TabsTrigger value="attendance" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Attendance</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <AttendanceOverview initialAttendance={safeInitialAttendance} />
      </TabsContent>

      <TabsContent value="employees" className="space-y-6">
        <EmployeeDirectory />
      </TabsContent>

      <TabsContent value="attendance" className="space-y-6">
        <AttendanceOverview initialAttendance={safeInitialAttendance} showFullHistory={true} />
      </TabsContent>
    </Tabs>
  )
}
