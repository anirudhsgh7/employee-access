"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, User, X } from "lucide-react"

interface AddEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onEmployeeAdded: () => void
}

export default function AddEmployeeModal({ isOpen, onClose, onEmployeeAdded }: AddEmployeeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    department: "Engineering",
    position: "",
    hire_date: new Date().toISOString().split("T")[0],
  })

  // Validate phone number - must be exactly 10 digits if provided
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true // Phone is optional
    return /^\d{10}$/.test(phone)
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "phone_number") {
      // Only allow digits in phone number field
      const digitsOnly = value.replace(/\D/g, "")

      // Validate phone number as user types
      if (digitsOnly.length > 0 && digitsOnly.length !== 10) {
        setPhoneError("Phone number must be exactly 10 digits")
      } else {
        setPhoneError(null)
      }

      // Update form with digits only
      setFormData((prev) => ({
        ...prev,
        [field]: digitsOnly,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate required fields
    if (!formData.employee_id || !formData.first_name || !formData.last_name || !formData.email) {
      setError("Please fill in all required fields")
      return
    }

    // Validate email format
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    // Validate phone number if provided
    if (formData.phone_number && !validatePhoneNumber(formData.phone_number)) {
      setError("Phone number must be exactly 10 digits")
      setPhoneError("Phone number must be exactly 10 digits")
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create employee")
      }

      // Reset form and close modal
      setFormData({
        employee_id: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        department: "Engineering",
        position: "",
        hire_date: new Date().toISOString().split("T")[0],
      })
      onEmployeeAdded()
      onClose()
    } catch (error) {
      console.error("Error creating employee:", error)
      setError(error instanceof Error ? error.message : "Failed to create employee")
    } finally {
      setIsLoading(false)
    }
  }

  const departments = [
    "Engineering",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
    "Operations",
    "IT",
    "Customer Support",
    "Research",
    "Legal",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New Employee
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">
                Employee ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) => handleInputChange("employee_id", e.target.value)}
                placeholder="EMP-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => handleInputChange("hire_date", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="john.doe@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone">Phone Number</Label>
              <span className="text-xs text-gray-500">10 digits required</span>
            </div>
            <div className="space-y-1">
              <Input
                id="phone"
                value={formData.phone_number}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
                placeholder="Enter 10-digit phone number"
                className={phoneError ? "border-red-500 focus-visible:ring-red-500" : ""}
                maxLength={10}
              />
              {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !!phoneError}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Add Employee
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
