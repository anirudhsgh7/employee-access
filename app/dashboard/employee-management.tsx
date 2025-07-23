"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Filter, UserPlus, Users, CreditCard, Building, Briefcase, AlertCircle, Key } from "lucide-react"
import type { Employee, SearchFilters } from "@/lib/database-enhanced"
import EmployeeCard from "./employee-card"
import AddEmployeeModal from "./add-employee-modal"
import EmployeeModal from "./employee-modal"

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [filters, setFilters] = useState<SearchFilters>({})
  const [filterOptions, setFilterOptions] = useState<{ departments: string[]; positions: string[] }>({
    departments: [],
    positions: [],
  })
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEmployees()
    fetchFilterOptions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [employees, filters])

  const fetchEmployees = async () => {
    try {
      setError(null)
      setIsLoading(true)

      // Try simple endpoint first (more reliable)
      let response
      try {
        response = await fetch("/api/employees/simple")
      } catch (simpleError) {
        console.warn("Simple endpoint failed:", simpleError)
        // Fallback to enhanced endpoint
        response = await fetch("/api/employees/enhanced")
      }

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
        setError(error.message)
      } else {
        setError("Failed to load employees")
      }
      setEmployees([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch("/api/employees/filter-options")
      if (!response.ok) {
        throw new Error(`Failed to fetch filter options: ${response.status}`)
      }
      const data = await response.json()

      if (data && typeof data === "object") {
        setFilterOptions({
          departments: Array.isArray(data.departments) ? data.departments : [],
          positions: Array.isArray(data.positions) ? data.positions : [],
        })
      }
    } catch (error) {
      console.error("Failed to fetch filter options:", error)
    }
  }

  const applyFilters = () => {
    if (!Array.isArray(employees)) {
      console.warn("Employees is not an array:", employees)
      setFilteredEmployees([])
      return
    }

    let filtered = [...employees]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (emp) =>
          emp.first_name?.toLowerCase().includes(searchLower) ||
          emp.last_name?.toLowerCase().includes(searchLower) ||
          emp.email?.toLowerCase().includes(searchLower) ||
          emp.employee_id?.toLowerCase().includes(searchLower) ||
          emp.phone_number?.toLowerCase().includes(searchLower) ||
          emp.card_uid?.toLowerCase().includes(searchLower),
      )
    }

    if (filters.department && filters.department !== "all") {
      filtered = filtered.filter((emp) => emp.department === filters.department)
    }

    if (filters.position && filters.position !== "all") {
      filtered = filtered.filter((emp) => emp.position === filters.position)
    }

    if (filters.nfc_uid) {
      filtered = filtered.filter((emp) => emp.card_uid?.includes(filters.nfc_uid!))
    }

    if (filters.is_active !== undefined) {
      filtered = filtered.filter((emp) => emp.is_active === filters.is_active)
    }

    setFilteredEmployees(filtered)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string | boolean | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" || value === "all" ? undefined : value,
    }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEmployeeModalOpen(true)
  }

  const activeFilterCount = Object.values(filters).filter((value) => value !== undefined && value !== "").length

  // Calculate stats
  const stats = {
    total: employees.length,
    active: employees.filter((emp) => emp.is_active).length,
    withCards: employees.filter((emp) => emp.card_uid).length,
    activeCards: employees.filter((emp) => emp.card_uid && emp.card_active).length,
  }

  if (error) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchEmployees}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Badge variant="default" className="h-8 w-8 rounded-full flex items-center justify-center">
                ✓
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">NFC Cards Assigned</p>
                <p className="text-2xl font-bold">{stats.withCards}</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Cards</p>
                <p className="text-2xl font-bold">{stats.activeCards}</p>
              </div>
              <Key className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <Users className="h-6 w-6 mr-2" />
              Employee Management
            </CardTitle>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Advanced Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, employee ID, phone, or NFC UID..."
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-slate-500" />
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select
                value={filters.department || ""}
                onValueChange={(value) => handleFilterChange("department", value)}
              >
                <SelectTrigger>
                  <Building className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {filterOptions.departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.position || ""} onValueChange={(value) => handleFilterChange("position", value)}>
                <SelectTrigger>
                  <Briefcase className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {filterOptions.positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="NFC UID"
                  value={filters.nfc_uid || ""}
                  onChange={(e) => handleFilterChange("nfc_uid", e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.is_active === undefined ? "" : filters.is_active.toString()}
                onValueChange={(value) => handleFilterChange("is_active", value === "" ? undefined : value === "true")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters} disabled={activeFilterCount === 0}>
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                Showing <span className="font-medium">{filteredEmployees.length}</span> of{" "}
                <span className="font-medium">{employees.length}</span> employees
              </div>
              {activeFilterCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  Filtered results
                </Badge>
              )}
            </div>
          </div>

          {/* Employee Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 rounded-lg h-48"></div>
                </div>
              ))}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No employees found</h3>
              <p className="text-slate-500">
                {activeFilterCount > 0 ? "Try adjusting your filters" : "Add your first employee to get started"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onClick={() => handleEmployeeClick(employee)}
                  onUpdate={fetchEmployees}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Employee Modal */}
{isAddModalOpen && (
  <AddEmployeeModal
    isOpen={isAddModalOpen}
    onClose={() => setIsAddModalOpen(false)}

    onEmployeeAdded={() => {
      fetchEmployees();
      setIsAddModalOpen(false);
    }}
  />
)}

      {/* Employee Details Modal */}
      {isEmployeeModalOpen && selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          isOpen={isEmployeeModalOpen}
          onClose={() => {
            setIsEmployeeModalOpen(false)
            setSelectedEmployee(null)
          }}
          onSave={() => {
            fetchEmployees()
            setIsEmployeeModalOpen(false)
            setSelectedEmployee(null)
          }}
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
