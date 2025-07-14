"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Server,
  Plus,
  Edit,
  Trash2,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  Settings,
  RefreshCw,
  Clock,
  MapPin,
  Users,
  DoorOpen,
  Shield,
  Building,
} from "lucide-react"
import type { NFCNode, NodeActivityLog } from "@/lib/database-enhanced"

export default function NodeManagement() {
  const [nodes, setNodes] = useState<NFCNode[]>([])
  const [activityLogs, setActivityLogs] = useState<NodeActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<NFCNode | null>(null)
  const [newNode, setNewNode] = useState({
    node_id: "",
    node_name: "",
    location: "",
    description: "",
    ip_address: "",
    is_active: true,
    node_type: "ATTENDANCE" as "ATTENDANCE" | "ROOM_ACCESS",
  })

  useEffect(() => {
    fetchNodes()
    fetchActivityLogs()

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchNodes()
      fetchActivityLogs()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchNodes = async () => {
    try {
      const response = await fetch("/api/nodes")
      const data = await response.json()
      setNodes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch nodes:", error)
      setNodes([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch("/api/nodes/activity-logs?limit=50")
      const data = await response.json()
      setActivityLogs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch activity logs:", error)
      setActivityLogs([])
    }
  }

  const handleCreateNode = async () => {
    try {
      const response = await fetch("/api/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNode),
      })

      if (response.ok) {
        setIsCreateModalOpen(false)
        setNewNode({
          node_id: "",
          node_name: "",
          location: "",
          description: "",
          ip_address: "",
          is_active: true,
          node_type: "ATTENDANCE",
        })
        fetchNodes()
      }
    } catch (error) {
      console.error("Failed to create node:", error)
    }
  }

  const handleUpdateNode = async () => {
    if (!selectedNode) return

    try {
      const response = await fetch(`/api/nodes/${selectedNode.node_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedNode),
      })

      if (response.ok) {
        setIsEditModalOpen(false)
        setSelectedNode(null)
        fetchNodes()
      }
    } catch (error) {
      console.error("Failed to update node:", error)
    }
  }

  const handleDeleteNode = async (nodeId: string) => {
    if (!confirm("Are you sure you want to delete this node?")) return

    try {
      const response = await fetch(`/api/nodes/${nodeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchNodes()
      }
    } catch (error) {
      console.error("Failed to delete node:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ONLINE":
        return <Wifi className="h-4 w-4 text-green-500" />
      case "OFFLINE":
        return <WifiOff className="h-4 w-4 text-red-500" />
      case "ERROR":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "MAINTENANCE":
        return <Settings className="h-4 w-4 text-blue-500" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "default"
      case "OFFLINE":
        return "destructive"
      case "ERROR":
        return "secondary"
      case "MAINTENANCE":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getNodeTypeIcon = (nodeType: string) => {
    return nodeType === "ATTENDANCE" ? (
      <Users className="h-4 w-4 text-blue-500" />
    ) : (
      <DoorOpen className="h-4 w-4 text-purple-500" />
    )
  }

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-200 rounded-lg h-32"></div>
        ))}
      </div>
    )
  }

  // Separate nodes by type
  const attendanceNodes = nodes.filter((node) => node.node_type === "ATTENDANCE")
  const roomAccessNodes = nodes.filter((node) => node.node_type === "ROOM_ACCESS")

  // Calculate stats for each type
  const attendanceStats = {
    online: attendanceNodes.filter((node) => node.status === "ONLINE").length,
    offline: attendanceNodes.filter((node) => node.status === "OFFLINE").length,
    error: attendanceNodes.filter((node) => node.status === "ERROR").length,
    total: attendanceNodes.length,
  }

  const roomAccessStats = {
    online: roomAccessNodes.filter((node) => node.status === "ONLINE").length,
    offline: roomAccessNodes.filter((node) => node.status === "OFFLINE").length,
    error: roomAccessNodes.filter((node) => node.status === "ERROR").length,
    total: roomAccessNodes.length,
  }

  const renderNodeCard = (node: NFCNode) => (
    <Card
      key={node.id}
      className={`border-l-4 ${node.node_type === "ATTENDANCE" ? "border-l-blue-500" : "border-l-purple-500"}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon(node.status || "OFFLINE")}
            {getNodeTypeIcon(node.node_type)}
            <h3 className="font-semibold">{node.node_name}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={node.node_type === "ATTENDANCE" ? "text-blue-600" : "text-purple-600"}>
              {node.node_type === "ATTENDANCE" ? "Attendance" : "Room Access"}
            </Badge>
            <Badge variant={getStatusColor(node.status || "OFFLINE")}>{node.status || "OFFLINE"}</Badge>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <MapPin className="h-3 w-3" />
            <span>{node.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Server className="h-3 w-3" />
            <span>{node.node_id}</span>
          </div>
          {node.ip_address && (
            <div className="flex items-center space-x-2">
              <Activity className="h-3 w-3" />
              <span>{node.ip_address}</span>
            </div>
          )}
          {node.uptime_duration && (
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3" />
              <span>Uptime: {node.uptime_duration}</span>
            </div>
          )}
          {node.last_heartbeat && <div className="text-xs">Last seen: {formatDateTime(node.last_heartbeat)}</div>}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedNode(node)
              setIsEditModalOpen(true)
            }}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDeleteNode(node.node_id)}>
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Online Nodes</p>
                <p className="text-3xl font-bold">{attendanceStats.online + roomAccessStats.online}</p>
              </div>
              <Wifi className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Offline Nodes</p>
                <p className="text-3xl font-bold">{attendanceStats.offline + roomAccessStats.offline}</p>
              </div>
              <WifiOff className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Error Nodes</p>
                <p className="text-3xl font-bold">{attendanceStats.error + roomAccessStats.error}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Nodes</p>
                <p className="text-3xl font-bold">{nodes.length}</p>
              </div>
              <Server className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Node Management Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <Server className="h-6 w-6 mr-2" />
              NFC Node Management
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={fetchNodes}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Node
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New NFC Node</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="node_type">Node Type</Label>
                      <Select
                        value={newNode.node_type}
                        onValueChange={(value: "ATTENDANCE" | "ROOM_ACCESS") =>
                          setNewNode({ ...newNode, node_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select node type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ATTENDANCE">Attendance Tracking</SelectItem>
                          <SelectItem value="ROOM_ACCESS">Room Access Control</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="node_id">Node ID</Label>
                      <Input
                        id="node_id"
                        value={newNode.node_id}
                        onChange={(e) => setNewNode({ ...newNode, node_id: e.target.value })}
                        placeholder={newNode.node_type === "ATTENDANCE" ? "ATT_006" : "ROOM_006"}
                      />
                    </div>
                    <div>
                      <Label htmlFor="node_name">Node Name</Label>
                      <Input
                        id="node_name"
                        value={newNode.node_name}
                        onChange={(e) => setNewNode({ ...newNode, node_name: e.target.value })}
                        placeholder={
                          newNode.node_type === "ATTENDANCE" ? "Main Entrance Reader" : "Conference Room Reader"
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newNode.location}
                        onChange={(e) => setNewNode({ ...newNode, location: e.target.value })}
                        placeholder={newNode.node_type === "ATTENDANCE" ? "Main Entrance" : "Conference Room A"}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newNode.description}
                        onChange={(e) => setNewNode({ ...newNode, description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ip_address">IP Address</Label>
                      <Input
                        id="ip_address"
                        value={newNode.ip_address}
                        onChange={(e) => setNewNode({ ...newNode, ip_address: e.target.value })}
                        placeholder="192.168.1.100"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={newNode.is_active}
                        onCheckedChange={(checked) => setNewNode({ ...newNode, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateNode}>Create Node</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="attendance" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attendance" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Attendance Nodes ({attendanceStats.total})</span>
              </TabsTrigger>
              <TabsTrigger value="room-access" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Room Access Nodes ({roomAccessStats.total})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="space-y-4">
              {/* Attendance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">Total</p>
                        <p className="text-2xl font-bold text-blue-700">{attendanceStats.total}</p>
                      </div>
                      <Building className="h-6 w-6 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Online</p>
                        <p className="text-2xl font-bold text-green-700">{attendanceStats.online}</p>
                      </div>
                      <Wifi className="h-6 w-6 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-600 text-sm font-medium">Offline</p>
                        <p className="text-2xl font-bold text-red-700">{attendanceStats.offline}</p>
                      </div>
                      <WifiOff className="h-6 w-6 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-600 text-sm font-medium">Error</p>
                        <p className="text-2xl font-bold text-yellow-700">{attendanceStats.error}</p>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Attendance Nodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendanceNodes.map(renderNodeCard)}
              </div>

              {attendanceNodes.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No attendance nodes found</h3>
                  <p className="text-slate-500">Add your first attendance tracking node to get started</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="room-access" className="space-y-4">
              {/* Room Access Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Total</p>
                        <p className="text-2xl font-bold text-purple-700">{roomAccessStats.total}</p>
                      </div>
                      <DoorOpen className="h-6 w-6 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Online</p>
                        <p className="text-2xl font-bold text-green-700">{roomAccessStats.online}</p>
                      </div>
                      <Wifi className="h-6 w-6 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-600 text-sm font-medium">Offline</p>
                        <p className="text-2xl font-bold text-red-700">{roomAccessStats.offline}</p>
                      </div>
                      <WifiOff className="h-6 w-6 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-600 text-sm font-medium">Error</p>
                        <p className="text-2xl font-bold text-yellow-700">{roomAccessStats.error}</p>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Room Access Nodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomAccessNodes.map(renderNodeCard)}
              </div>

              {roomAccessNodes.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No room access nodes found</h3>
                  <p className="text-slate-500">Add your first room access control node to get started</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity logs found</p>
          ) : (
            <div className="space-y-2">
              {activityLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">{getStatusIcon(log.activity_type)}</div>
                    <div>
                      <p className="font-medium text-sm">{log.node_id}</p>
                      <p className="text-xs text-muted-foreground">{log.message}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(log.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Node Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit NFC Node</DialogTitle>
          </DialogHeader>
          {selectedNode && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_node_type">Node Type</Label>
                <Select
                  value={selectedNode.node_type}
                  onValueChange={(value: "ATTENDANCE" | "ROOM_ACCESS") =>
                    setSelectedNode({ ...selectedNode, node_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATTENDANCE">Attendance Tracking</SelectItem>
                    <SelectItem value="ROOM_ACCESS">Room Access Control</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_node_name">Node Name</Label>
                <Input
                  id="edit_node_name"
                  value={selectedNode.node_name}
                  onChange={(e) => setSelectedNode({ ...selectedNode, node_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_location">Location</Label>
                <Input
                  id="edit_location"
                  value={selectedNode.location}
                  onChange={(e) => setSelectedNode({ ...selectedNode, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_description">Description</Label>
                <Input
                  id="edit_description"
                  value={selectedNode.description || ""}
                  onChange={(e) => setSelectedNode({ ...selectedNode, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_ip_address">IP Address</Label>
                <Input
                  id="edit_ip_address"
                  value={selectedNode.ip_address || ""}
                  onChange={(e) => setSelectedNode({ ...selectedNode, ip_address: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_active"
                  checked={selectedNode.is_active}
                  onCheckedChange={(checked) => setSelectedNode({ ...selectedNode, is_active: checked })}
                />
                <Label htmlFor="edit_is_active">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateNode}>Update Node</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
