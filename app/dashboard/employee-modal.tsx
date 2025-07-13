"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  CreditCard,
  Shield,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react"
import type { Employee, Room, AccessPermission } from "@/lib/database-enhanced"
import AttendanceHistoryTab from "./attendance-history-tab"
import RoomAccessHistoryTab from "./room-access-history-tab"

interface EmployeeModalProps {
  employee: Employee | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (employee: Employee) => void
}

export default function EmployeeModal({ employee, isOpen, onClose, onUpdate }: EmployeeModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedEmployee, setEditedEmployee] = useState<Employee | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [employeeAccess, setEmployeeAccess] = useState<AccessPermission[]>([])
  const [newCardUid, setNewCardUid] = useState("")
  const [selectedRoomId, setSelectedRoomId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (employee) {
      setEditedEmployee({ ...employee })
      fetchRooms()
      fetchEmployeeAccess()
    }
  }, [employee])

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms")
      const data = await response.json()
      setRooms(data)
    } catch (error) {
      console.error("Failed to fetch rooms:", error)
    }
  }

  const fetchEmployeeAccess = async () => {
    if (!employee) return
    try {
      const response = await fetch(`/api/employees/${employee.id}/access`)
      const data = await response.json()
      setEmployeeAccess(data)
    } catch (error) {
      console.error("Failed to fetch employee access:", error)
    }
  }

  const handleSave = async () => {
    if (!editedEmployee) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/employees/${editedEmployee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedEmployee),
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        onUpdate(updatedEmployee)
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Failed to update employee:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignCard = async () => {
    if (!employee || !newCardUid.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/employees/${employee.id}/nfc-card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardUid: newCardUid.trim() }),
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        onUpdate(updatedEmployee)
        setNewCardUid("")
      }
    } catch (error) {
      console.error("Failed to assign NFC card:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivateCard = async () => {
    if (!employee?.card_uid) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/nfc-cards/${employee.card_uid}/deactivate`, {
        method: "POST",
      })

      if (response.ok) {
        const updatedEmployee = await response.json()
        onUpdate(updatedEmployee)
      }
    } catch (error) {
      console.error("Failed to deactivate NFC card:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGrantAccess = async () => {
    if (!employee || !selectedRoomId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/employees/${employee.id}/access/grant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId: Number.parseInt(selectedRoomId) }),
      })

      if (response.ok) {
        await fetchEmployeeAccess()
        setSelectedRoomId("")
      }
    } catch (error) {
      console.error("Failed to grant access:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeAccess = async (roomId: number) => {
    if (!employee) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/employees/${employee.id}/access/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId }),
      })

      if (response.ok) {
        await fetchEmployeeAccess()
      }
    } catch (error) {
      console.error("Failed to revoke access:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid Date"
    }
  }

  const availableRooms = rooms.filter((room) => !employeeAccess.some((access) => access.room_id === room.id))

  if (!employee) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={employee.profile_image_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {employee.first_name[0]}
                  {employee.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">
                  {employee.first_name} {employee.last_name}
                </h2>
                <p className="text-sm text-muted-foreground">{employee.employee_id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={isLoading} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="room-access">Room Access</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editedEmployee?.first_name || ""}
                        onChange={(e) => setEditedEmployee((prev) => prev && { ...prev, first_name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editedEmployee?.last_name || ""}
                        onChange={(e) => setEditedEmployee((prev) => prev && { ...prev, last_name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={editedEmployee?.email || ""}
                        onChange={(e) => setEditedEmployee((prev) => prev && { ...prev, email: e.target.value })}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={editedEmployee?.phone_number || ""}
                        onChange={(e) => setEditedEmployee((prev) => prev && { ...prev, phone_number: e.target.value })}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Work Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Work Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="department"
                        value={editedEmployee?.department || ""}
                        onChange={(e) => setEditedEmployee((prev) => prev && { ...prev, department: e.target.value })}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="position"
                        value={editedEmployee?.position || ""}
                        onChange={(e) => setEditedEmployee((prev) => prev && { ...prev, position: e.target.value })}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="hireDate">Hire Date</Label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="hireDate"
                        type="date"
                        value={editedEmployee?.hire_date || ""}
                        onChange={(e) => setEditedEmployee((prev) => prev && { ...prev, hire_date: e.target.value })}
                        disabled={!isEditing}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive">Active Employee</Label>
                    <Switch
                      id="isActive"
                      checked={editedEmployee?.is_active || false}
                      onCheckedChange={(checked) =>
                        setEditedEmployee((prev) => prev && { ...prev, is_active: checked })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* NFC Card Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  NFC Card Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employee.card_uid ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">Card UID: {employee.card_uid}</p>
                        <p className="text-sm text-muted-foreground">
                          Status: {employee.card_active ? "Active" : "Inactive"}
                        </p>
                        {employee.card_assigned_date && (
                          <p className="text-sm text-muted-foreground">
                            Issued: {formatDate(employee.card_assigned_date)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={employee.card_active ? "default" : "secondary"}>
                          {employee.card_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button onClick={handleDeactivateCard} variant="destructive" size="sm" disabled={isLoading}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">No NFC card assigned</p>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Enter NFC Card UID"
                        value={newCardUid}
                        onChange={(e) => setNewCardUid(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleAssignCard} disabled={isLoading || !newCardUid.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Assign Card
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Room Access Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Grant New Access */}
                <div className="flex items-center space-x-2">
                  <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a room to grant access" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.room_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleGrantAccess} disabled={isLoading || !selectedRoomId}>
                    <Plus className="h-4 w-4 mr-2" />
                    Grant Access
                  </Button>
                </div>

                {/* Current Access */}
                <div className="space-y-2">
                  {employeeAccess.length === 0 ? (
                    <p className="text-muted-foreground">No room access permissions granted</p>
                  ) : (
                    employeeAccess.map((access) => (
                      <div key={access.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">{access.room_name}</p>
                          <p className="text-sm text-muted-foreground">Granted: {formatDate(access.granted_at)}</p>
                        </div>
                        <Button
                          onClick={() => handleRevokeAccess(access.room_id)}
                          variant="destructive"
                          size="sm"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Revoke
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceHistoryTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="room-access">
            <RoomAccessHistoryTab employeeId={employee.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
