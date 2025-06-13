"use client"

import { Badge } from "@/components/ui/badge"
import { CreditCard, ExternalLink } from "lucide-react"
import type { Employee } from "@/lib/database-enhanced"

interface EmployeeCardSimpleProps {
  employee: Employee
  onClick: () => void
}

export default function EmployeeCardSimple({ employee, onClick }: EmployeeCardSimpleProps) {
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg">{`${employee.first_name} ${employee.last_name}`}</h3>
          <p className="text-gray-500">{employee.employee_id}</p>
        </div>
        <Badge variant={employee.is_active ? "default" : "secondary"}>
          {employee.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="space-y-1 mt-4">
        <p>
          <span className="font-medium">Department:</span> {employee.department}
        </p>
        <p>
          <span className="font-medium">Position:</span> {employee.position}
        </p>
        <p>
          <span className="font-medium">Email:</span> {employee.email}
        </p>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <Badge variant="outline" className="flex items-center gap-1">
          <CreditCard className="h-3 w-3" />
          {employee.card_uid ? "Card Assigned" : "No Card"}
        </Badge>
        <div className="flex items-center">
          <ExternalLink className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  )
}
