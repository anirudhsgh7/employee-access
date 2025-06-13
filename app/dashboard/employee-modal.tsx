"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  CreditCard,
  Edit,
  Save,
  X,
  AlertCircle,
  Loader2,
  Key,
  Shield,
  ShieldOff,
  Plus,
} from "lucide-react"
import type { Employee, Room, AccessPermission } from "@/lib/database-enhanced"
import AttendanceHistoryTab from "./attendance-history-tab"
import RoomAccessHistoryTab from "./room-access-history-tab"

interface EmployeeModalProps {
  employee: Employee
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function EmployeeModal({ employee, isOpen, onClose, onSave }: EmployeeModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [employeeAccess, setEmployeeAccess] = useState<AccessPermission[]>([])
  const [newCardUid, setNewCardUid] = useState("")
  const [isCardLoading, setIsCardLoading] = useState(false)
  const [isAccessLoading, setIsAccessLoading] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  // Format date to YYYY-MM-DD format
  const formatDateForInput = (dateString: string): string => {
    try {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString
      }

      // Parse the date and format it as YYYY-MM-DD
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date")
      }

      return date.toISOString().split("T")[0]
    } catch (error) {
      console.error("Error formatting date for input:", error)
      // Return current date as fallback
      return new Date().toISOString().split("T")[0]
    }
  }

  const [formData, setFormData] = useState({
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    phone_number: employee.phone_number || "",
    department: employee.department,
    position: employee.position,
    hire_date: formatDateForInput(employee.hire_date),
    is_active: employee.is_active,
  })

  // Reset form data when employee changes
  useEffect(() => {
    if (isOpen && employee) {
      setFormData({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        phone_number: employee.phone_number || "",
        department: employee.department,
        position: employee.position,
        hire_date: formatDateForInput(employee.hire_date),
        is_active: employee.is_active,
      })
      setNewCardUid(employee.card_uid || "")
      setIsEditing(false)
      setError(null)
      setPhoneError(null)

      // Fetch rooms and access data
      fetchRooms()
      fetchEmployeeAccess()
    }
  }, [employee, isOpen])

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms")
      if (response.ok) {
        const data = await response.json()
        setRooms(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error)
      setRooms([])
    }
  }

  const fetchEmployeeAccess = async () => {
    try {
      const response = await fetch(`/api/employees/${employee.id}/access`)
      if (response.ok) {
        const data = await response.json()
        setEmployeeAccess(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to fetch employee access:", error)
      setEmployeeAccess([])
    }
  }

  // Validate phone number - must be exactly 10 digits if provided
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true // Phone is optional
    return /^\d{10}$/.test(phone)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === "phone_number") {
      // Only allow digits in phone number field
      const digitsOnly = String(value).replace(/\D/g, "")

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

  const handleSave = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Validate required fields
      if (!formData.first_name.trim()) {
        setError("First name is required")
        return
      }

      if (!formData.last_name.trim()) {
        setError("Last name is required")
        return
      }

      if (!formData.email.trim()) {
        setError("Email is required")
        return
      }

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

      // Ensure hire_date is in YYYY-MM-DD format
      const dataToSend = {
        ...formData,
        hire_date: formatDateForInput(formData.hire_date),
      }

      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update employee")
      }

      setIsEditing(false)
      onSave()
    } catch (error) {
      console.error("Error updating employee:", error)
      setError(error instanceof Error ? error.message : "Failed to update employee")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone_number: employee.phone_number || "",
      department: employee.department,
      position: employee.position,
      hire_date: formatDateForInput(employee.hire_date),
      is_active: employee.is_active,
    })
    setNewCardUid(employee.card_uid || "")
    setIsEditing(false)
    setError(null)
    setPhoneError(null)
  }

  // NFC Card Management
  const handleAssignCard = async () => {
    if (!newCardUid.trim()) {
      setError("Please enter a valid card UID")
      return
    }

    try {
      setIsCardLoading(true)
      setError(null)

      const response = await fetch(`/api/employees/${employee.id}/nfc-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardUid: newCardUid.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to assign card")
      }

      onSave() // Refresh employee data
    } catch (error) {
      console.error("Error assigning card:", error)
      setError(error instanceof Error ? error.message : "Failed to assign card")
    } finally {
      setIsCardLoading(false)
    }
  }

  const handleDeactivateCard = async () => {
    if (!employee.card_uid) return

    try {
      setIsCardLoading(true)
      setError(null)

      const response = await fetch(`/api/nfc-cards/${employee.card_uid}/deactivate`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to deactivate card")
      }

      onSave() // Refresh employee data
    } catch (error) {
      console.error("Error deactivating card:", error)
      setError(error instanceof Error ? error.message : "Failed to deactivate card")
    } finally {
      setIsCardLoading(false)
    }
  }

  // Room Access Management
  const hasAccessToRoom = (roomId: number) => {
    return employeeAccess.some((access) => access.room_id === roomId && access.is_active)
  }

  const handleAccessToggle = async (roomId: number, hasAccess: boolean) => {
    try {
      setIsAccessLoading(true)
      setError(null)

      const endpoint = hasAccess ? "revoke" : "grant"
      const response = await fetch(`/api/employees/${employee.id}/access/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${endpoint} access`)
      }

      await fetchEmployeeAccess() // Refresh access data
    } catch (error) {
      console.error("Error updating access:", error)
      setError(error instanceof Error ? error.message : "Failed to update room access")
    } finally {
      setIsAccessLoading(false)
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {employee.first_name} {employee.last_name}
            <Badge variant={employee.is_active ? "default" : "secondary"} className="ml-2">
              {employee.is_active ? "Active" : "Inactive"}
            </Badge>
          </DialogTitle>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isLoading || !!phoneError}>
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="nfc-card">NFC Card</TabsTrigger>
            <TabsTrigger value="room-access">Room Access</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="access-history">Access History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => handleInputChange("first_name", e.target.value)}
                          placeholder="Enter first name"
                        />
                      ) : (
                        <p className="mt-1 text-sm">{employee.first_name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => handleInputChange("last_name", e.target.value)}
                          placeholder="Enter last name"
                        />
                      ) : (
                        <p className="mt-1 text-sm">{employee.last_name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter email address"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{employee.email}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      {isEditing && <span className="text-xs text-gray-500">10 digits required</span>}
                    </div>
                    {isEditing ? (
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
                    ) : (
                      <p className="mt-1 text-sm">
                        {employee.phone_number ? formatPhoneNumber(employee.phone_number) : "Not provided"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Work Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Work Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="employee_id">Employee ID</Label>
                    <p className="mt-1 text-sm font-mono bg-gray-50 p-2 rounded">{employee.employee_id}</p>
                  </div>

                  <div>
                    <Label htmlFor="department" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Department
                    </Label>
                    {isEditing ? (
                      <Select
                        value={formData.department}
                        onValueChange={(value) => handleInputChange("department", value)}
                      >
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
                    ) : (
                      <p className="mt-1 text-sm">{employee.department}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="position">Position</Label>
                    {isEditing ? (
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => handleInputChange("position", e.target.value)}
                        placeholder="Enter position"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{employee.position}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="hire_date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Hire Date
                    </Label>
                    {isEditing ? (
                      <Input
                        id="hire_date"
                        type="date"
                        value={formData.hire_date}
                        onChange={(e) => handleInputChange("hire_date", e.target.value)}
                      />
                    ) : (
                      <p className="mt-1 text-sm">{new Date(employee.hire_date).toLocaleDateString()}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Employee Status</Label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                        />
                        <span className="text-sm">{formData.is_active ? "Active" : "Inactive"}</span>
                      </div>
                    ) : (
                      <Badge variant={employee.is_active ? "default" : "secondary"}>
                        {employee.is_active ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="nfc-card" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  NFC Card Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {employee.card_uid ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Current NFC Card</h4>
                        <Badge variant={employee.card_active ? "default" : "destructive"}>
                          {employee.card_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 font-mono">{employee.card_uid}</p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="destructive"
                        onClick={handleDeactivateCard}
                        disabled={isCardLoading || !employee.card_active}
                      >
                        {isCardLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ShieldOff className="h-4 w-4 mr-2" />
                        )}
                        Deactivate Card
                      </Button>

                      {!employee.card_active && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewCardUid("")
                            // This would trigger the assign new card flow
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Assign New Card
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No NFC Card Assigned</h3>
                      <p className="text-gray-500">Assign an NFC card to enable access control</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="new_card_uid">NFC Card UID</Label>
                      <Input
                        id="new_card_uid"
                        value={newCardUid}
                        onChange={(e) => setNewCardUid(e.target.value)}
                        placeholder="Enter NFC card UID (e.g., 04:A3:22:B1:C4:80:00)"
                      />
                      <Button
                        onClick={handleAssignCard}
                        disabled={isCardLoading || !newCardUid.trim()}
                        className="w-full"
                      >
                        {isCardLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Shield className="h-4 w-4 mr-2" />
                        )}
                        Assign NFC Card
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="room-access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Room Access Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rooms.length === 0 ? (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No rooms available for access control</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rooms.map((room) => {
                      const hasAccess = hasAccessToRoom(room.id)
                      return (
                        <div
                          key={room.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${hasAccess ? "bg-green-500" : "bg-gray-300"}`} />
                              <div>
                                <h4 className="font-medium">{room.room_name}</h4>
                                <p className="text-sm text-gray-500">{room.room_code}</p>
                                {room.description && <p className="text-sm text-gray-400">{room.description}</p>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge variant={hasAccess ? "default" : "outline"}>
                              {hasAccess ? "Access Granted" : "No Access"}
                            </Badge>
                            <Checkbox
                              checked={hasAccess}
                              onCheckedChange={() => handleAccessToggle(room.id, hasAccess)}
                              disabled={isAccessLoading}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {employeeAccess.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-3">Access Summary</h4>
                    <div className="flex flex-wrap gap-2">
                      {employeeAccess
                        .filter((access) => access.is_active)
                        .map((access) => (
                          <Badge key={access.id} variant="secondary">
                            {access.room_name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceHistoryTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="access-history">
            <RoomAccessHistoryTab employeeId={employee.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to format phone numbers for display
function formatPhoneNumber(phoneNumber: string): string {
  // If the phone number is not 10 digits, return as is
  if (!/^\d{10}$/.test(phoneNumber)) return phoneNumber

  // Format as (XXX) XXX-XXXX
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`
}
