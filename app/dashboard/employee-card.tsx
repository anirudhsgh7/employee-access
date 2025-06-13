"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, Mail, CreditCard, Building, Briefcase, Calendar, Edit, Key, Shield, ShieldOff } from "lucide-react"
import type { Employee } from "@/lib/database-enhanced"

interface EmployeeCardProps {
  employee: Employee
  onClick: () => void
  onUpdate: () => void
}

export default function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-slate-200 hover:border-blue-300">
      <CardContent className="p-6" onClick={onClick}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 ring-2 ring-slate-100">
                <AvatarImage
                  src={employee.profile_image_url || "/placeholder.svg"}
                  alt={`${employee.first_name} ${employee.last_name}`}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                  {getInitials(employee.first_name, employee.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {employee.first_name} {employee.last_name}
                </h3>
                <p className="text-sm text-slate-500">{employee.employee_id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={employee.is_active ? "default" : "secondary"} className="text-xs">
                {employee.is_active ? "Active" : "Inactive"}
              </Badge>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Building className="h-4 w-4 text-slate-400" />
              <span>{employee.department}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Briefcase className="h-4 w-4 text-slate-400" />
              <span>{employee.position}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="truncate">{employee.email}</span>
            </div>
            {employee.phone_number && (
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{employee.phone_number}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Hired {formatDate(employee.hire_date)}</span>
            </div>
          </div>

          {/* Access Control Status */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            {/* NFC Card Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">NFC Card</span>
              </div>
              {employee.card_uid ? (
                <div className="flex items-center space-x-2">
                  {employee.card_active ? (
                    <Shield className="h-4 w-4 text-green-500" />
                  ) : (
                    <ShieldOff className="h-4 w-4 text-red-500" />
                  )}
                  <Badge variant={employee.card_active ? "default" : "destructive"} className="text-xs">
                    {employee.card_active ? "Active" : "Disabled"}
                  </Badge>
                </div>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Not Assigned
                </Badge>
              )}
            </div>

            {/* Card UID Display */}
            {employee.card_uid && (
              <div className="text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded">{employee.card_uid}</div>
            )}

            {/* Quick Access Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">Room Access</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Click to Manage
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
