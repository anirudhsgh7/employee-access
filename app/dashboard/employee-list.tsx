"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, CreditCard, Key, UserPlus } from "lucide-react"
import type { Employee } from "@/lib/database"
import EmployeeModal from "./employee-modal"

interface EmployeeListProps {
  employees: Employee[]
}

export default function EmployeeList({ employees: initialEmployees }: EmployeeListProps) {
  const [employees, setEmployees] = useState(initialEmployees)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsModalOpen(true)
  }

  const handleAddEmployee = () => {
    setSelectedEmployee(null)
    setIsModalOpen(true)
  }

  const refreshEmployees = async () => {
    const response = await fetch("/api/employees")
    const data = await response.json()
    setEmployees(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleAddEmployee}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <Card
            key={employee.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleEmployeeClick(employee)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {employee.first_name} {employee.last_name}
                  </CardTitle>
                  <p className="text-sm text-gray-500">{employee.employee_id}</p>
                </div>
                <Badge variant={employee.is_active ? "default" : "secondary"}>
                  {employee.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Department:</strong> {employee.department}
                </p>
                <p className="text-sm">
                  <strong>Position:</strong> {employee.position}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {employee.email}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {employee.card_uid ? (
                        <Badge variant={employee.card_active ? "default" : "secondary"}>Card Assigned</Badge>
                      ) : (
                        <Badge variant="outline">No Card</Badge>
                      )}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Key className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <EmployeeModal
          employee={selectedEmployee}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={refreshEmployees}
        />
      )}
    </div>
  )
}
