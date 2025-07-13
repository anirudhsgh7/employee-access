"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

  const onlineNodes = nodes.filter((node) => node.status === "ONLINE").length
  const offlineNodes = nodes.filter((node) => node.status === "OFFLINE").length
  const errorNodes = nodes.filter((node) => node.status === "ERROR").length

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Online Nodes</p>
                <p className="text-3xl font-bold">{onlineNodes}</p>
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
                <p className="text-3xl font-bold">{offlineNodes}</p>
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
                <p className="text-3xl font-bold">{errorNodes}</p>
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

      {/* Node Management */}
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
                      <Label htmlFor="node_id">Node ID</Label>
                      <Input
                        id="node_id"
                        value={newNode.node_id}
                        onChange={(e) => setNewNode({ ...newNode, node_id: e.target.value })}
                        placeholder="NODE_006"
                      />
                    </div>
                    <div>
                      <Label htmlFor="node_name">Node Name</Label>
                      <Input
                        id="node_name"
                        value={newNode.node_name}
                        onChange={(e) => setNewNode({ ...newNode, node_name: e.target.value })}
                        placeholder="Conference Room Reader"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newNode.location}
                        onChange={(e) => setNewNode({ ...newNode, location: e.target.value })}
                        placeholder="Conference Room A"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map((node) => (
              <Card key={node.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(node.status || "OFFLINE")}
                      <h3 className="font-semibold">{node.node_name}</h3>
                    </div>
                    <Badge variant={getStatusColor(node.status || "OFFLINE")}>{node.status || "OFFLINE"}</Badge>
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
                    {node.last_heartbeat && (
                      <div className="text-xs">Last seen: {formatDateTime(node.last_heartbeat)}</div>
                    )}
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
            ))}
          </div>

          {nodes.length === 0 && (
            <div className="text-center py-12">
              <Server className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No NFC nodes found</h3>
              <p className="text-slate-500">Add your first NFC node to get started</p>
            </div>
          )}
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
