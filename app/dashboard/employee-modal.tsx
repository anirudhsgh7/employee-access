"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Clock,
  MapPin,
  Plus,
  Trash2,
  Save,
  X,
} from "lucide-react"
import type { Employee, Room, AccessPermission, RoomAccessLog } from "@/lib/database-enhanced"
import AttendanceHistoryTab from "./attendance-history-tab"

interface EmployeeModalProps {
  employee: Employee | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void // Changed from onUpdate
}

export default function EmployeeModal({ employee, isOpen, onClose, onSave }: EmployeeModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedEmployee, setEditedEmployee] = useState<Partial<Employee>>({})
  const [rooms, setRooms] = useState<Room[]>([])
  const [employeeAccess, setEmployeeAccess] = useState<AccessPermission[]>([])
  const [roomAccessHistory, setRoomAccessHistory] = useState<RoomAccessLog[]>([])
  const [newCardUid, setNewCardUid] = useState("")
  const [selectedRoomId, setSelectedRoomId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (employee && isOpen) {
      setEditedEmployee(employee)
      fetchRooms()
      fetchEmployeeAccess()
      fetchRoomAccessHistory()
    }
  }, [employee, isOpen])

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
      const response = await fetch(`/api/employees/${employee.id}/room-access`)
      const data = await response.json()
      setEmployeeAccess(data)
    } catch (error) {
      console.error("Failed to fetch employee access:", error)
    }
  }

  const fetchRoomAccessHistory = async () => {
    if (!employee) return
    try {
      const response = await fetch(`/api/employees/${employee.id}/room-access`)
      const data = await response.json()
      setRoomAccessHistory(data)
    } catch (error) {
      console.error("Failed to fetch room access history:", error)
    }
  }

  const handleSave = async () => {
    if (!employee) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedEmployee),
      })

      if (response.ok) {
        setIsEditing(false)
        onSave() // Changed from onUpdate()
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardUid: newCardUid.trim() }),
      })

      if (response.ok) {
        setNewCardUid("")
        onSave() // Changed from onUpdate()
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
        onSave() // Changed from onUpdate()
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: Number.parseInt(selectedRoomId) }),
      })

      if (response.ok) {
        setSelectedRoomId("")
        fetchEmployeeAccess()
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })

      if (response.ok) {
        fetchEmployeeAccess()
      }
    } catch (error) {
      console.error("Failed to revoke access:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return "Invalid Date"
    }
  }

  if (!employee) return null

  const availableRooms = rooms.filter((room) => !employeeAccess.some((access) => access.room_id === room.id))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6" />
              <span>
                {employee.first_name} {employee.last_name}
              </span>
              <Badge variant={employee.is_active ? "default" : "secondary"}>
                {employee.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="access">Room Access</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="history">Access History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <User className="h-5 w-5 mr-2" />
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
                          value={editedEmployee.first_name || ""}
                          onChange={(e) => setEditedEmployee({ ...editedEmployee, first_name: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{employee.first_name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="last_name"
                          value={editedEmployee.last_name || ""}
                          onChange={(e) => setEditedEmployee({ ...editedEmployee, last_name: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{employee.last_name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedEmployee.email || ""}
                        onChange={(e) => setEditedEmployee({ ...editedEmployee, email: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone_number"
                        value={editedEmployee.phone_number || ""}
                        onChange={(e) => setEditedEmployee({ ...editedEmployee, phone_number: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{employee.phone_number || "N/A"}</p>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={editedEmployee.is_active ?? true}
                        onCheckedChange={(checked) => setEditedEmployee({ ...editedEmployee, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Active Employee</Label>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Work Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Work Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="employee_id">Employee ID</Label>
                    <p className="text-sm text-muted-foreground mt-1">{employee.employee_id}</p>
                  </div>

                  <div>
                    <Label htmlFor="department">Department</Label>
                    {isEditing ? (
                      <Input
                        id="department"
                        value={editedEmployee.department || ""}
                        onChange={(e) => setEditedEmployee({ ...editedEmployee, department: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{employee.department}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="position">Position</Label>
                    {isEditing ? (
                      <Input
                        id="position"
                        value={editedEmployee.position || ""}
                        onChange={(e) => setEditedEmployee({ ...editedEmployee, position: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="hire_date">Hire Date</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{formatDate(employee.hire_date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* NFC Card Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CreditCard className="h-5 w-5 mr-2" />
                  NFC Card Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employee.card_uid ? (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Card UID: {employee.card_uid}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <Badge variant={employee.card_active ? "default" : "secondary"}>
                          {employee.card_active ? "Active" : "Inactive"}
                        </Badge>
                        {employee.card_assigned_date && <span>Issued: {formatDate(employee.card_assigned_date)}</span>}
                      </div>
                    </div>
                    {employee.card_active && (
                      <Button variant="destructive" size="sm" onClick={handleDeactivateCard} disabled={isLoading}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deactivate
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Enter NFC Card UID"
                      value={newCardUid}
                      onChange={(e) => setNewCardUid(e.target.value)}
                    />
                    <Button onClick={handleAssignCard} disabled={isLoading || !newCardUid.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Assign Card
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
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
                  <Button
                    onClick={handleGrantAccess}
                    disabled={isLoading || !selectedRoomId || availableRooms.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Grant Access
                  </Button>
                </div>

                {/* Current Access */}
                <div className="space-y-2">
                  {employeeAccess.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No room access permissions granted.</p>
                  ) : (
                    employeeAccess.map((access) => (
                      <div key={access.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">{access.room_name}</p>
                          <p className="text-sm text-muted-foreground">Granted: {formatDateTime(access.granted_at)}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeAccess(access.room_id)}
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

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="h-5 w-5 mr-2" />
                  Room Access History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {roomAccessHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No room access history found.</p>
                ) : (
                  <div className="space-y-2">
                    {roomAccessHistory.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-3 h-3 rounded-full ${log.access_granted ? "bg-green-500" : "bg-red-500"}`}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{log.room_name}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{formatDateTime(log.access_time)}</span>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{log.access_method}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge variant={log.access_granted ? "default" : "destructive"}>
                          {log.access_granted ? "Granted" : "Denied"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
