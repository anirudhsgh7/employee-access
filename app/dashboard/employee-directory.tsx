"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Filter, UserPlus, CreditCard, AlertCircle, ExternalLink, Loader2, Edit } from "lucide-react"
import type { Employee } from "@/lib/database-enhanced"
import AddEmployeeModal from "./add-employee-modal"
import EmployeeModal from "./employee-modal"

// Safe string operations
const safeString = (value: any): string => {
  if (value === null || value === undefined) return ""
  return String(value)
}

const safeIncludes = (str: any, searchTerm: string): boolean => {
  try {
    return safeString(str).toLowerCase().includes(searchTerm.toLowerCase())
  } catch (error) {
    return false
  }
}

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    fetchEmployees()
  }, [retryCount])

  useEffect(() => {
    applyFilters()
  }, [employees, searchTerm, departmentFilter])

  const fetchEmployees = async () => {
    try {
      setError(null)
      setIsLoading(true)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      // Try simple endpoint first (more reliable)
      let response
      try {
        response = await fetch("/api/employees/simple", {
          signal: controller.signal,
        })
      } catch (simpleError) {
        console.warn("Simple endpoint failed:", simpleError)
        // Fallback to enhanced endpoint
        response = await fetch("/api/employees/enhanced", {
          signal: controller.signal,
        })
      }

      clearTimeout(timeoutId)

      if (!response.ok) {
        // If simple fails, try enhanced endpoint
        if (response.url.includes("simple")) {
          console.warn("Simple endpoint returned error, trying enhanced endpoint")
          response = await fetch("/api/employees/enhanced")
        }

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API error response:", errorText)
          throw new Error(`Failed to fetch employees: ${response.status} ${response.statusText}`)
        }
      }

      let data
      try {
        const text = await response.text()
        data = text ? JSON.parse(text) : []
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        throw new Error("Failed to parse response data")
      }

      if (Array.isArray(data)) {
        setEmployees(data)
        console.log(`Successfully loaded ${data.length} employees`)
      } else {
        console.warn("Received non-array data:", data)
        setEmployees([])
        setError("Received invalid data format from server")
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error)
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setError("Request timed out. Please try again.")
        } else {
          setError(error.message)
        }
      } else {
        setError("Failed to load employees")
      }
      setEmployees([])
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    if (!Array.isArray(employees)) {
      setFilteredEmployees([])
      return
    }

    let filtered = [...employees]

    if (searchTerm) {
      filtered = filtered.filter((emp) => {
        try {
          return (
            safeIncludes(emp.first_name, searchTerm) ||
            safeIncludes(emp.last_name, searchTerm) ||
            safeIncludes(emp.employee_id, searchTerm) ||
            safeIncludes(emp.email, searchTerm) ||
            safeIncludes(emp.department, searchTerm) ||
            safeIncludes(emp.position, searchTerm)
          )
        } catch (error) {
          console.error("Filter error for employee:", emp, error)
          return false
        }
      })
    }

    if (departmentFilter && departmentFilter !== "all") {
      filtered = filtered.filter((emp) => safeString(emp.department) === departmentFilter)
    }

    setFilteredEmployees(filtered)
  }

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEmployeeModalOpen(true)
  }

  const departments = [...new Set(employees.map((emp) => safeString(emp.department)))].filter(Boolean)

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  const handleEmployeeUpdate = () => {
    // Refresh the employee list after an update
    fetchEmployees()
    setIsEmployeeModalOpen(false)
    setSelectedEmployee(null)
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Employee Directory</CardTitle>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No employees found. Try adjusting your search or add a new employee.</p>
              {employees.length === 0 && (
                <div className="mt-4">
                  <Button variant="outline" onClick={handleRetry} className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Refresh Data
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group relative"
                  onClick={() => handleEmployeeClick(employee)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">
                        {`${safeString(employee.first_name)} ${safeString(employee.last_name)}`}
                      </h3>
                      <p className="text-gray-500">{safeString(employee.employee_id)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={employee.is_active ? "default" : "secondary"}>
                        {employee.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEmployeeClick(employee)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 mt-4">
                    <p>
                      <span className="font-medium">Department:</span> {safeString(employee.department)}
                    </p>
                    <p>
                      <span className="font-medium">Position:</span> {safeString(employee.position)}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {safeString(employee.email)}
                    </p>
                    {employee.phone_number && (
                      <p>
                        <span className="font-medium">Phone:</span> {formatPhoneNumber(employee.phone_number)}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      {employee.card_uid ? "Card Assigned" : "No Card"}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isAddModalOpen && (
        <AddEmployeeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={() => {
            fetchEmployees()
            setIsAddModalOpen(false)
          }}
        />
      )}

      {isEmployeeModalOpen && selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          isOpen={isEmployeeModalOpen}
          onClose={() => {
            setIsEmployeeModalOpen(false)
            setSelectedEmployee(null)
          }}
          onSave={handleEmployeeUpdate}
        />
      )}
    </div>
  )
}

// Helper function to format phone numbers for display
function formatPhoneNumber(phoneNumber: string): string {
  // If the phone number is not 10 digits, return as is
  if (!/^\d{10}$/.test(phoneNumber)) return phoneNumber

  // Format as (XXX) XXX-XXXX
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`
}
