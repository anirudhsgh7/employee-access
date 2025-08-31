import { neon } from "@neondatabase/serverless"
import { unstable_noStore as noStore } from "next/cache" // Re-added noStore

// Add error handling for database connection
let sql: any = null

try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  sql = neon(process.env.DATABASE_URL)
} catch (error) {
  console.error("Database connection error:", error)
  throw new Error("Failed to initialize database connection")
}

export interface User {
  id: string
  username: string
  password_hash: string
  role: "admin" | "employee"
  created_at: Date
}

export interface Employee {
  id: number
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  department: string
  position: string
  hire_date: string
  is_active: boolean
  profile_image_url?: string
  card_uid?: string // Re-added
  card_active?: boolean // Re-added
  card_assigned_date?: string // Re-added
  created_at: string
  updated_at: string
  role_id?: number
}

export interface Room {
  id: number
  room_name: string
  room_code: string
  description: string
  is_active: boolean
}

export interface AccessPermission {
  id: number
  employee_id: number
  room_id: number
  room_name: string
  granted_at: string
  is_active: boolean
}

export interface AttendanceRecord {
  id: number
  employee_id: number
  employee_name: string
  tap_time: string
  tap_type: "IN" | "OUT"
  nfc_card_uid?: string
  location?: string
  node_id?: string
  node_location?: string
  duration?: string | null // Duration only for OUT records
  check_in_time?: string
  check_out_time?: string
}

export interface RoomAccessLog {
  id: number
  employee_id: number
  employee_name: string
  room_id: number
  room_name: string
  access_time: string
  access_granted: boolean
  nfc_card_uid?: string
  access_method: string
}

export interface NFCNode {
  id: number
  node_id: string
  node_name: string
  location: string
  description?: string
  ip_address?: string
  is_active: boolean
  node_type: "ATTENDANCE" | "ROOM_ACCESS"
  last_heartbeat?: string
  created_at: string
  updated_at: string
  status?: "ONLINE" | "OFFLINE" | "ERROR" | "MAINTENANCE"
  uptime_duration?: string
}

export interface NodeActivityLog {
  id: number
  node_id: string
  activity_type: "ONLINE" | "OFFLINE" | "ERROR" | "MAINTENANCE"
  message?: string
  timestamp: string
}

export interface SearchFilters {
  search?: string
  department?: string
  position?: string
  nfc_uid?: string
  is_active?: boolean
}

// Safe data processing functions
const safeString = (value: any): string => {
  if (value === null || value === undefined) return ""
  return String(value)
}

// Corrected: Format date to YYYY-MM-DD based on local time
const formatDateForDB = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date")
    }
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error("Error formatting date for DB:", error)
    // Fallback to current local date
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const day = now.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }
}

// Calculate duration between two timestamps
const calculateDuration = (checkIn: string, checkOut: string): string => {
  try {
    const inTime = new Date(checkIn)
    const outTime = new Date(checkOut)
    const diffMs = outTime.getTime() - inTime.getTime()

    if (diffMs <= 0) return "0h 0m"

    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  } catch (error) {
    console.error("Error calculating duration:", error)
    return "N/A"
  }
}

// Calculate uptime duration
const calculateUptime = (startTime: string): string => {
  try {
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()

    if (diffMs <= 0) return "0m"

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  } catch (error) {
    console.error("Error calculating uptime:", error)
    return "N/A"
  }
}

const processEmployeeData = (rawEmployee: any): Employee => {
  return {
    id: Number(rawEmployee.id) || 0,
    employee_id: safeString(rawEmployee.employee_id),
    first_name: safeString(rawEmployee.first_name),
    last_name: safeString(rawEmployee.last_name),
    email: safeString(rawEmployee.email),
    phone_number: rawEmployee.phone_number ? safeString(rawEmployee.phone_number) : undefined,
    department: safeString(rawEmployee.department),
    position: safeString(rawEmployee.position),
    hire_date: safeString(rawEmployee.hire_date),
    is_active: Boolean(rawEmployee.is_active),
    profile_image_url: rawEmployee.profile_image_url ? safeString(rawEmployee.profile_image_url) : undefined,
    card_uid: rawEmployee.card_uid ? safeString(rawEmployee.card_uid) : undefined,
    card_active: Boolean(rawEmployee.card_active),
    card_assigned_date: rawEmployee.card_assigned_date ? safeString(rawEmployee.card_assigned_date) : undefined,
    created_at: safeString(rawEmployee.created_at),
    updated_at: safeString(rawEmployee.updated_at),
  }
}

const processAttendanceData = (rawRecord: any): AttendanceRecord => {
  const record: AttendanceRecord = {
    id: Number(rawRecord.id) || 0,
    employee_id: Number(rawRecord.employee_id) || 0,
    employee_name: safeString(rawRecord.employee_name),
    tap_time: safeString(rawRecord.tap_time),
    tap_type: rawRecord.tap_type === "OUT" ? "OUT" : "IN",
    nfc_card_uid: rawRecord.nfc_card_uid ? safeString(rawRecord.nfc_card_uid) : undefined,
    location: rawRecord.location ? safeString(rawRecord.location) : undefined,
    node_id: rawRecord.node_id ? safeString(rawRecord.node_id) : undefined,
    node_location: rawRecord.node_location ? safeString(rawRecord.node_location) : undefined,
  }

  // Add duration for check-out records
  if (rawRecord.duration) {
    record.duration = safeString(rawRecord.duration)
  }

  // Add check times if available
  if (rawRecord.check_in_time) {
    record.check_in_time = safeString(rawRecord.check_in_time)
  }
  if (rawRecord.check_out_time) {
    record.check_out_time = safeString(rawRecord.check_out_time)
  }

  return record
}

const processNodeData = (rawNode: any): NFCNode => {
  const node: NFCNode = {
    id: Number(rawNode.id) || 0,
    node_id: safeString(rawNode.node_id),
    node_name: safeString(rawNode.node_name),
    location: safeString(rawNode.location),
    description: rawNode.description ? safeString(rawNode.description) : undefined,
    ip_address: rawNode.ip_address ? safeString(rawNode.ip_address) : undefined,
    is_active: Boolean(rawNode.is_active),
    node_type: rawNode.node_type === "ROOM_ACCESS" ? "ROOM_ACCESS" : "ATTENDANCE",
    last_heartbeat: rawNode.last_heartbeat ? safeString(rawNode.last_heartbeat) : undefined,
    created_at: safeString(rawNode.created_at),
    updated_at: safeString(rawNode.updated_at),
  }

  // Determine status based on last heartbeat
  if (rawNode.last_heartbeat) {
    const lastHeartbeat = new Date(rawNode.last_heartbeat)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / (1000 * 60)

    if (diffMinutes < 5) {
      node.status = "ONLINE"
      node.uptime_duration = calculateUptime(rawNode.last_heartbeat)
    } else if (diffMinutes < 30) {
      node.status = "ERROR"
    } else {
      node.status = "OFFLINE"
    }
  } else {
    node.status = rawNode.is_active ? "OFFLINE" : "MAINTENANCE"
  }

  return node
}

// Enhanced employee functions with better error handling
export async function getEmployeesWithFilters(filters: SearchFilters = {}): Promise<Employee[]> {
  noStore() // Ensure no caching
  try {
    // If no filters, use simple query
    if (
      !filters.search &&
      !filters.department &&
      !filters.position &&
      !filters.nfc_uid &&
      filters.is_active === undefined
    ) {
      const result = await sql`
        SELECT 
          e.*,
          n.card_uid,
          n.is_active as card_active,
          n.assigned_date as card_assigned_date
        FROM employees e
        LEFT JOIN nfc_cards n ON e.id = n.employee_id
        ORDER BY e.employee_id
      `

      if (!result || !Array.isArray(result)) {
        console.warn("Query result is not an array:", result)
        return []
      }

      return result.map((row: any) => processEmployeeData(row))
    }

    // Build dynamic query with filters using sql.query method
    const queryParts = [
      `SELECT 
        e.*,
        n.card_uid,
        n.is_active as card_active,
        n.assigned_date as card_assigned_date
      FROM employees e
      LEFT JOIN nfc_cards n ON e.id = n.employee_id
      WHERE 1=1`,
    ]

    const params: any[] = []

    if (filters.search) {
      queryParts.push(`AND (
        LOWER(COALESCE(e.first_name, '')) LIKE LOWER($${params.length + 1}) OR 
        LOWER(COALESCE(e.last_name, '')) LIKE LOWER($${params.length + 1}) OR 
        LOWER(COALESCE(e.email, '')) LIKE LOWER($${params.length + 1}) OR 
        LOWER(COALESCE(e.employee_id, '')) LIKE LOWER($${params.length + 1}) OR
        LOWER(COALESCE(e.phone_number, '')) LIKE LOWER($${params.length + 1})
      )`)
      params.push(`%${filters.search}%`)
    }

    if (filters.department) {
      queryParts.push(`AND LOWER(COALESCE(e.department, '')) = LOWER($${params.length + 1})`)
      params.push(filters.department)
    }

    if (filters.position) {
      queryParts.push(`AND LOWER(COALESCE(e.position, '')) = LOWER($${params.length + 1})`)
      params.push(filters.position)
    }

    if (filters.nfc_uid) {
      queryParts.push(`AND COALESCE(n.card_uid, '') LIKE $${params.length + 1}`)
      params.push(`%${filters.nfc_uid}%`)
    }

    if (filters.is_active !== undefined) {
      queryParts.push(`AND e.is_active = $${params.length + 1}`)
      params.push(filters.is_active)
    }

    queryParts.push(`ORDER BY e.employee_id`)

    const query = queryParts.join(" ")

    // Use sql.query() method for parameterized queries
    const result = await sql.query(query, params)

    // Ensure result is an array before mapping
    if (!result || !Array.isArray(result)) {
      console.warn("Query result is not an array:", result)
      return []
    }

    return result.map((row: any) => processEmployeeData(row))
  } catch (error) {
    console.error("Error fetching employees with filters:", error)
    return []
  }
}

export async function getTodayAttendance(): Promise<AttendanceRecord[]> {
  noStore() // Ensure no caching
  try {
    const result = await sql`
      WITH attendance_with_duration AS (
        SELECT 
          ar.id,
          ar.employee_id,
          COALESCE(CONCAT(e.first_name, ' ', e.last_name), 'Unknown Employee') as employee_name,
          ar.tap_time,
          ar.tap_type,
          ar.nfc_card_uid,
          ar.location,
          ar.node_id,
          ar.node_location,
          CASE 
            WHEN ar.tap_type = 'OUT' THEN (
              SELECT 
                CASE 
                  WHEN EXTRACT(EPOCH FROM (ar.tap_time - ar_in.tap_time)) > 0 
                  THEN CONCAT(
                    FLOOR(EXTRACT(EPOCH FROM (ar.tap_time - ar_in.tap_time)) / 3600)::text, 'h ',
                    FLOOR((EXTRACT(EPOCH FROM (ar.tap_time - ar_in.tap_time)) % 3600) / 60)::text, 'm'
                  )
                  ELSE NULL
                END
              FROM attendance_records ar_in 
              WHERE ar_in.employee_id = ar.employee_id 
                AND ar_in.tap_type = 'IN' 
                AND DATE(ar_in.tap_time) = CURRENT_DATE
                AND ar_in.tap_time < ar.tap_time
              ORDER BY ar_in.tap_time DESC 
              LIMIT 1
            )
            ELSE NULL
          END as duration
        FROM attendance_records ar
        LEFT JOIN employees e ON ar.employee_id = e.id
        WHERE DATE(ar.tap_time) = CURRENT_DATE
      )
      SELECT * FROM attendance_with_duration
      ORDER BY tap_time DESC
    `

    // Ensure result is an array before mapping
    if (!result || !Array.isArray(result)) {
      console.warn("Today's attendance query result is not an array:", result)
      return []
    }

    return result.map((row: any) => processAttendanceData(row))
  } catch (error) {
    console.error("Error fetching today's attendance:", error)
    return []
  }
}

export async function getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
  noStore() // Ensure no caching
  try {
    const result = await sql`
      WITH attendance_with_duration AS (
        SELECT 
          ar.id,
          ar.employee_id,
          COALESCE(CONCAT(e.first_name, ' ', e.last_name), 'Unknown Employee') as employee_name,
          ar.tap_time,
          ar.tap_type,
          ar.nfc_card_uid,
          ar.location,
          ar.node_id,
          ar.node_location,
          CASE 
            WHEN ar.tap_type = 'OUT' THEN (
              SELECT 
                CASE 
                  WHEN EXTRACT(EPOCH FROM (ar.tap_time - ar_in.tap_time)) > 0 
                  THEN CONCAT(
                    FLOOR(EXTRACT(EPOCH FROM (ar.tap_time - ar_in.tap_time)) / 3600)::text, 'h ',
                    FLOOR((EXTRACT(EPOCH FROM (ar.tap_time - ar_in.tap_time)) % 3600) / 60)::text, 'm'
                  )
                  ELSE NULL
                END
              FROM attendance_records ar_in 
              WHERE ar_in.employee_id = ar.employee_id 
                AND ar_in.tap_type = 'IN' 
                AND DATE(ar_in.tap_time) = DATE(ar.tap_time) -- Use DATE(ar.tap_time) for the current record's date
                AND ar_in.tap_time < ar.tap_time
              ORDER BY ar_in.tap_time DESC 
              LIMIT 1
            )
            ELSE NULL
          END as duration
        FROM attendance_records ar
        LEFT JOIN employees e ON ar.employee_id = e.id
        WHERE DATE(ar.tap_time) = ${date}
      )
      SELECT * FROM attendance_with_duration
      ORDER BY tap_time DESC
    `

    // Ensure result is an array before mapping
    if (!result || !Array.isArray(result)) {
      console.warn("Attendance by date query result is not an array:", result)
      return []
    }

    return result.map((row: any) => processAttendanceData(row))
  } catch (error) {
    console.error("Error fetching attendance by date:", error)
    return []
  }
}

// Get today's attendance stats (not cumulative)
export async function getTodayAttendanceStats(): Promise<{
  totalEmployees: number
  totalCheckIns: number
  totalCheckOuts: number
}> {
  noStore() // Ensure no caching
  try {
    const result = await sql`
      SELECT 
        COUNT(DISTINCT ar.employee_id) as total_employees,
        COUNT(CASE WHEN ar.tap_type = 'IN' THEN 1 END) as total_check_ins,
        COUNT(CASE WHEN ar.tap_type = 'OUT' THEN 1 END) as total_check_outs
      FROM attendance_records ar
      WHERE DATE(ar.tap_time) = CURRENT_DATE
    `

    if (!result || !Array.isArray(result) || result.length === 0) {
      return { totalEmployees: 0, totalCheckIns: 0, totalCheckOuts: 0 }
    }

    const stats = result[0]
    return {
      totalEmployees: Number(stats.total_employees) || 0,
      totalCheckIns: Number(stats.total_check_ins) || 0,
      totalCheckOuts: Number(stats.total_check_outs) || 0,
    }
  } catch (error) {
    console.error("Error fetching today's attendance stats:", error)
    return { totalEmployees: 0, totalCheckIns: 0, totalCheckOuts: 0 }
  }
}

// Get attendance stats for a specific date
export async function getAttendanceStatsByDate(date: string): Promise<{
  totalEmployees: number
  totalCheckIns: number
  totalCheckOuts: number
}> {
  noStore() // Ensure no caching
  try {
    const result = await sql`
      SELECT 
        COUNT(DISTINCT ar.employee_id) as total_employees,
        COUNT(CASE WHEN ar.tap_type = 'IN' THEN 1 END) as total_check_ins,
        COUNT(CASE WHEN ar.tap_type = 'OUT' THEN 1 END) as total_check_outs
      FROM attendance_records ar
      WHERE DATE(ar.tap_time) = ${date}
    `

    if (!result || !Array.isArray(result) || result.length === 0) {
      return { totalEmployees: 0, totalCheckIns: 0, totalCheckOuts: 0 }
    }

    const stats = result[0]
    return {
      totalEmployees: Number(stats.total_employees) || 0,
      totalCheckIns: Number(stats.total_check_ins) || 0,
      totalCheckOuts: Number(stats.total_check_outs) || 0,
    }
  } catch (error) {
    console.error("Error fetching attendance stats by date:", error)
    return { totalEmployees: 0, totalCheckIns: 0, totalCheckOuts: 0 }
  }
}

// NFC Node Management Functions
export async function getNFCNodes(): Promise<NFCNode[]> {
  noStore()
  try {
    // Mark nodes as OFFLINE if last heartbeat was more than 6 minutes ago
    await sql`
      UPDATE nfc_nodes
      SET status = 'OFFLINE'
      WHERE (last_heartbeat IS NULL OR last_heartbeat < NOW() - INTERVAL '6 minutes')
        AND status = 'ONLINE';
    `
    // (Optional) Also mark nodes as ONLINE if they have recent heartbeat but status isn't updated
    await sql`
      UPDATE nfc_nodes
      SET status = 'ONLINE'
      WHERE last_heartbeat >= NOW() - INTERVAL '6 minutes'
        AND status = 'OFFLINE';
    `

    const result = await sql`SELECT * FROM nfc_nodes ORDER BY node_name`
    if (!result || !Array.isArray(result)) {
      console.warn("NFC nodes query result is not an array:", result)
      return []
    }
    return result.map((row: any) => processNodeData(row))
  } catch (error) {
    console.error("Failed to fetch NFC nodes:", error)
    return []
  }
}

export async function createNFCNode(nodeData: Partial<NFCNode>): Promise<NFCNode | null> {
  noStore() // Ensure no caching
  try {
    const result = await sql`
      INSERT INTO nfc_nodes (node_id, node_name, location, description, ip_address, is_active, node_type)
      VALUES (${nodeData.node_id}, ${nodeData.node_name}, ${nodeData.location}, 
              ${nodeData.description || null}, ${nodeData.ip_address || null}, 
              ${nodeData.is_active ?? true}, ${nodeData.node_type || "ATTENDANCE"})
      RETURNING *
    `

    if (!result || !Array.isArray(result) || result.length === 0) {
      return null
    }

    return processNodeData(result[0])
  } catch (error) {
    console.error("Error creating NFC node:", error)
    throw error
  }
}

export async function updateNFCNode(nodeId: string, nodeData: Partial<NFCNode>): Promise<NFCNode | null> {
  noStore() // Ensure no caching
  try {
    const result = await sql`
      UPDATE nfc_nodes 
      SET node_name = ${nodeData.node_name}, 
          location = ${nodeData.location},
          description = ${nodeData.description || null},
          ip_address = ${nodeData.ip_address || null},
          is_active = ${nodeData.is_active},
          node_type = ${nodeData.node_type || "ATTENDANCE"},
          updated_at = CURRENT_TIMESTAMP
      WHERE node_id = ${nodeId}
      RETURNING *
    `

    if (!result || !Array.isArray(result) || result.length === 0) {
      return null
    }

    return processNodeData(result[0])
  } catch (error) {
    console.error("Error updating NFC node:", error)
    throw error
  }
}

export async function deleteNFCNode(nodeId: string): Promise<boolean> {
  noStore() // Ensure no caching
  try {
    await sql`
      DELETE FROM nfc_nodes WHERE node_id = ${nodeId}
    `
    return true
  } catch (error) {
    console.error("Error deleting NFC node:", error)
    throw error
  }
}

export async function updateNodeHeartbeat(nodeId: string): Promise<void> {
  noStore() // prevent caching
  try {
    // Check the node's last heartbeat time and current status
    const [node] = await sql`SELECT status, last_heartbeat FROM nfc_nodes WHERE node_id = ${nodeId}`
    const now = Date.now()
    let wasOffline = false
    if (node) {
      const lastHb = node.last_heartbeat ? new Date(node.last_heartbeat).getTime() : 0
      const status = node.status
      // Consider node offline if status was OFFLINE or last heartbeat was more than 6 minutes ago
      if (status === "OFFLINE" || (lastHb > 0 && now - lastHb > 6 * 60 * 1000)) {
        wasOffline = true
      }
    }

    // Update the node's last_heartbeat to current time, and set status to ONLINE
    await sql`
      UPDATE nfc_nodes 
      SET last_heartbeat = CURRENT_TIMESTAMP, status = 'ONLINE' 
      WHERE node_id = ${nodeId}
    `

    // Only log an ONLINE event if the node was previously offline
    if (wasOffline) {
      await sql`
        INSERT INTO node_activity_logs (node_id, activity_type, message)
        VALUES (${nodeId}, 'ONLINE', 'Node came online')
      `
      console.log(`Node ${nodeId} came online (heartbeat received after downtime).`)
    } else {
      // (Optional: you could log a heartbeat ping here if needed, but it's usually not necessary to log every ping)
      console.log(`Heartbeat received from node ${nodeId}. (Already online)`)
    }
  } catch (error) {
    console.error("Error updating node heartbeat:", error)
    throw error
  }
}

export async function getNodeActivityLogs(nodeId?: string, limit = 100): Promise<NodeActivityLog[]> {
  noStore() // Ensure no caching
  try {
    let result
    if (nodeId) {
      result = await sql`
        SELECT * FROM node_activity_logs 
        WHERE node_id = ${nodeId}
        ORDER BY timestamp DESC 
        LIMIT ${limit}
      `
    } else {
      result = await sql`
        SELECT * FROM node_activity_logs 
        ORDER BY timestamp DESC 
        LIMIT ${limit}
      `
    }

    if (!result || !Array.isArray(result)) {
      console.warn("Node activity logs query result is not an array:", result)
      return []
    }

    return result as NodeActivityLog[]
  } catch (error) {
    console.error("Error fetching node activity logs:", error)
    return []
  }
}

// Keep all other functions the same but add safe processing
export async function getEmployees(): Promise<Employee[]> {
  noStore() // Ensure no caching
  return getEmployeesWithFilters()
}

export async function getEmployeeById(id: number): Promise<Employee | null> {
  noStore() // Ensure no caching
  try {
    const result = await sql`
      SELECT 
        e.*,
        n.card_uid,
        n.is_active as card_active,
        n.assigned_date as card_assigned_date
      FROM employees e
      LEFT JOIN nfc_cards n ON e.id = n.employee_id
      WHERE e.id = ${id}
    `

    // Ensure result is an array and has at least one element
    if (!result || !Array.isArray(result) || result.length === 0) {
      return null
    }

    return processEmployeeData(result[0])
  } catch (error) {
    console.error("Error fetching employee by ID:", error)
    return null
  }
}

export async function getEmployee(idOrString: number | string): Promise<Employee | null> {
  const id = typeof idOrString === "string" ? Number(idOrString) : idOrString
  if (!Number.isFinite(id)) {
    console.warn("getEmployee called with invalid id:", idOrString)
    return null
  }
  return getEmployeeById(id)
}

export async function getEmployeeByNfcCardUid(nfcCardUid: string): Promise<Employee | undefined> {
  noStore() // Ensure no caching
  try {
    const employees = await sql<Employee[]>`SELECT * FROM employees WHERE card_uid = ${nfcCardUid}`
    return employees[0]
  } catch (error) {
    console.error("Failed to fetch employee by NFC card UID:", error)
    throw new Error("Failed to fetch employee.")
  }
}

export async function createEmployee(employee: Partial<Employee>): Promise<Employee> {
  noStore() // Ensure no caching
  try {
    // Format hire_date to ensure it's in YYYY-MM-DD format
    const formattedHireDate = employee.hire_date
      ? formatDateForDB(employee.hire_date)
      : formatDateForDB(new Date().toISOString())

    // Insert the new employee into the 'employees' table
    const [newEmployee] = await sql<Employee[]>`
      INSERT INTO employees (
        employee_id, first_name, last_name, email, phone_number,
        department, position, hire_date, is_active, profile_image_url, role_id
      ) VALUES (
        ${employee.employee_id},
        ${employee.first_name},
        ${employee.last_name},
        ${employee.email},
        ${employee.phone_number || null},
        ${employee.department},
        ${employee.position},
        ${formattedHireDate},
        ${employee.is_active ?? true},
        ${employee.profile_image_url || null},
        ${employee.role_id}
      )
      RETURNING *
    `

    // Process the returned employee data into the expected format
    const createdEmployee = processEmployeeData(newEmployee)

    // --- AUTOMATIC ROOM ASSIGNMENT LOGIC ---
    const department = createdEmployee.department

    // Check if the department exists in our room configurations
    if (department && roomConfigurations[department as keyof typeof roomConfigurations]) {
      try {
        const roomCodesForDepartment = roomConfigurations[department as keyof typeof roomConfigurations]

        // Fetch the actual numeric room IDs from the database using their codes
        const roomIdsForDepartment = await getRoomIdsByCodes(roomCodesForDepartment)

        // User ID for automated access grants (action performed via admin panel)
        const grantedByUserId = null

        // Loop through each relevant room ID and grant access to the new employee
        for (const roomId of roomIdsForDepartment) {
          await grantRoomAccess(createdEmployee.id, roomId, grantedByUserId)
          console.log(`Granted access for employee ${createdEmployee.employee_id} (${department}) to room ID ${roomId}`)
        }
      } catch (autoAssignError) {
        // Log any errors during auto-assignment, but do not prevent employee creation from succeeding.
        console.error(
          `Error during automatic room assignment for ${department} employee ${createdEmployee.employee_id}:`,
          autoAssignError,
        )
      }
    }
    // --- END AUTOMATIC ROOM ASSIGNMENT LOGIC ---

    // Return the newly created and processed employee data
    return createdEmployee
  } catch (error) {
    console.error("Error creating employee:", error)
    // Re-throw the error to indicate that employee creation failed
    throw new Error(`Failed to create employee: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee | null> {
  noStore() // Ensure no caching
  try {
    // Build the SET clause dynamically based on provided fields
    const updateFields = []
    const values = []
    let paramCounter = 1

    if (employee.first_name !== undefined) {
      updateFields.push(`first_name = $${paramCounter++}`)
      values.push(employee.first_name)
    }

    if (employee.last_name !== undefined) {
      updateFields.push(`last_name = $${paramCounter++}`)
      values.push(employee.last_name)
    }

    if (employee.email !== undefined) {
      updateFields.push(`email = $${paramCounter++}`)
      values.push(employee.email)
    }

    if (employee.phone_number !== undefined) {
      updateFields.push(`phone_number = $${paramCounter++}`)
      values.push(employee.phone_number)
    }

    if (employee.department !== undefined) {
      updateFields.push(`department = $${paramCounter++}`)
      values.push(employee.department)
    }

    if (employee.position !== undefined) {
      updateFields.push(`position = $${paramCounter++}`)
      values.push(employee.position)
    }

    if (employee.hire_date !== undefined) {
      // Format the hire_date to ensure it's in YYYY-MM-DD format
      const formattedHireDate = formatDateForDB(employee.hire_date)
      updateFields.push(`hire_date = $${paramCounter++}`)
      values.push(formattedHireDate)
    }

    if (employee.is_active !== undefined) {
      updateFields.push(`is_active = $${paramCounter++}`)
      values.push(employee.is_active)
    }

    if (employee.profile_image_url !== undefined) {
      updateFields.push(`profile_image_url = $${paramCounter++}`)
      values.push(employee.profile_image_url)
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)

    // If no fields to update, return the current employee
    if (updateFields.length === 0) {
      return getEmployeeById(id)
    }

    // Add the ID parameter
    values.push(id)

    // Build and execute the query
    const query = `
      UPDATE employees 
      SET ${updateFields.join(", ")} 
      WHERE id = $${paramCounter}
      RETURNING *
    `

    const result = await sql(query, values)
    const [updatedEmployee] = result as Employee[]
    return processEmployeeData(updatedEmployee)
  } catch (error) {
    console.error("Error updating employee:", error)
    throw new Error(`Failed to update employee: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function deleteEmployee(id: number): Promise<void> {
  noStore() // Ensure no caching
  try {
    await sql`DELETE FROM employees WHERE id = ${id}`
  } catch (error) {
    console.error("Failed to delete employee:", error)
    throw new Error("Failed to delete employee.")
  }
}

export async function assignNfcCardToEmployee(employeeId: number, nfcCardUid: string): Promise<Employee> {
  noStore() // Ensure no caching
  try {
    const [updatedEmployee] = await sql<Employee[]>`
      UPDATE employees
      SET card_uid = ${nfcCardUid}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${employeeId}
      RETURNING *
    `
    return processEmployeeData(updatedEmployee)
  } catch (error) {
    console.error("Failed to assign NFC card:", error)
    throw new Error("Failed to assign NFC card.")
  }
}

export async function removeNfcCardFromEmployee(employeeId: number): Promise<Employee> {
  noStore() // Ensure no caching
  try {
    const [updatedEmployee] = await sql<Employee[]>`
      UPDATE employees
      SET card_uid = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${employeeId}
      RETURNING *
    `
    return processEmployeeData(updatedEmployee)
  } catch (error) {
    console.error("Failed to remove NFC card:", error)
    throw new Error("Failed to remove NFC card.")
  }
}

export async function getRooms(): Promise<Room[]> {
  noStore() // Ensure no caching
  try {
    const result = await sql`
      SELECT * FROM rooms 
      WHERE is_active = true 
      ORDER BY room_name
    `

    // Ensure result is an array
    if (!result || !Array.isArray(result)) {
      console.warn("Rooms query result is not an array:", result)
      return []
    }

    return result as Room[]
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return []
  }
}

export async function getRoomById(id: number): Promise<Room | undefined> {
  noStore() // Ensure no caching
  try {
    const rooms = await sql<Room[]>`SELECT * FROM rooms WHERE id = ${id}`
    return rooms[0]
  } catch (error) {
    console.error("Failed to fetch room by ID:", error)
    throw new Error("Failed to fetch room.")
  }
}

export async function grantRoomAccess(
  employeeId: number,
  roomId: number,
  grantedByUserId: string | null,
): Promise<AccessPermission> {
  noStore()
  try {
    // Try to update existing inactive record first
    const [updatedAccess] = await sql<AccessPermission[]>`
      UPDATE access_permissions
      SET is_active = true, granted_by = ${grantedByUserId}, granted_at = CURRENT_TIMESTAMP
      WHERE employee_id = ${employeeId} AND room_id = ${roomId} AND is_active = false
      RETURNING *
    `

    // If no existing record was updated, insert a new one
    if (!updatedAccess) {
      const [newAccess] = await sql<AccessPermission[]>`
        INSERT INTO access_permissions (employee_id, room_id, granted_by, is_active)
        VALUES (${employeeId}, ${roomId}, ${grantedByUserId}, true)
        RETURNING *
      `
      return newAccess
    }

    return updatedAccess
  } catch (error) {
    console.error("Failed to grant room access:", error)
    throw new Error("Failed to grant room access.")
  }
}

// Room configurations for each department/role
const roomConfigurations = {
  Engineering: [
    "ROOM_021",
    "ROOM_022",
    "ROOM_023", // Floors 2,3,4
    "ROOM_006",
    "ROOM_007",
    "ROOM_008",
    "CONF001", // All Meeting rooms (assuming Conf Room is also a meeting room)
    "ROOM_013", // Library
    "ROOM_009", // Break Room
    "ROOM_011", // Reception
    "ROOM_012", // Training Room
  ],
  Marketing: [
    "ROOM_020", // Floor 1
    "ROOM_006",
    "ROOM_007",
    "ROOM_008",
    "CONF001", // All Meeting rooms
    "ROOM_013", // Library
    "ROOM_009", // Break Room
    "ROOM_011", // Reception
  ],
  Sales: [
    "ROOM_024", // Floor 5
    "ROOM_006",
    "ROOM_007",
    "ROOM_008",
    "CONF001", // All Meeting rooms
    "ROOM_009", // Break Room
    "ROOM_011", // Reception
  ],
  HR: [
    "ROOM_019", // HR Cabin
    "ROOM_018", // CEO Cabin
    "ROOM_020",
    "ROOM_021",
    "ROOM_022",
    "ROOM_023",
    "ROOM_024", // All floors
    "ROOM_006",
    "ROOM_007",
    "ROOM_008",
    "CONF001", // All Meeting rooms
    "ROOM_009", // Break Room
    "ROOM_013", // Library
    "ROOM_012", // Training Room
    "EXEC001", // Executive Office
  ],
  Finance: [
    "ROOM_016", // Finance Room
    "ROOM_017", // Accounts Room
    "ROOM_006",
    "ROOM_007",
    "ROOM_008",
    "CONF001", // All Meeting rooms
    "ROOM_009", // Break Room
    "ROOM_011", // Reception
    "ROOM_013", // Library
  ],
  Operations: [
    "ROOM_020",
    "ROOM_021",
    "ROOM_022",
    "ROOM_023",
    "ROOM_024", // All floors
    "ROOM_006",
    "ROOM_007",
    "ROOM_008",
    "CONF001", // All Meeting rooms
    "ROOM_010", // Security Office
    "ROOM_009", // Break Room
    "ROOM_011", // Reception
    "ROOM_013", // Library
  ],
  IT: [
    "ROOM_021",
    "ROOM_022",
    "ROOM_023", // Floor 2,3,4
    "SERV001", // Server Room
    "ROOM_015", // Server Backup Room
    "ROOM_010", // Security Office
    "ROOM_006",
    "ROOM_007",
    "ROOM_008",
    "CONF001", // All Meeting rooms
    "ROOM_009", // Break Room
    "ROOM_011", // Reception
    "ROOM_014", // Admin Cabin
  ],
  "Customer Support": [
    "ROOM_020", // Floor 1
    "ROOM_006",
    "ROOM_007",
    "ROOM_008",
    "CONF001", // All Meeting rooms
    "ROOM_012", // Training Room
    "ROOM_009", // Break Room
    "ROOM_011", // Reception
  ],
  Legal: [
    "ROOM_006",
    "ROOM_007",
    "ROOM_008",
    "CONF001", // All Meeting rooms
    "ROOM_018", // CEO Cabin
    "EXEC001", // Executive Office
    "ROOM_013", // Library
    "ROOM_009", // Break Room
    "ROOM_011", // Reception
  ],
  Research: [
    "ROOM_013", // Library
    "ROOM_006",
    "ROOM_007",
    "ROOM_008",
    "CONF001", // All Meeting rooms
    "ROOM_021",
    "ROOM_022",
    "ROOM_023", // Floor 2,3,4
    "ROOM_009", // Break Room
    "ROOM_011", // Reception
  ],
}

export async function revokeRoomAccess(employeeId: number, roomId: number): Promise<void> {
  noStore() // Ensure no caching
  try {
    await sql`
      UPDATE access_permissions
      SET is_active = false
      WHERE employee_id = ${employeeId} AND room_id = ${roomId}
    `
  } catch (error) {
    console.error("Failed to revoke room access:", error)
    throw new Error("Failed to revoke room access.")
  }
}

export async function getEmployeeRoomAccess(employeeId: number): Promise<AccessPermission[]> {
  noStore() // Ensure no caching
  try {
    const accessRecords = await sql<AccessPermission[]>`
      SELECT ap.*, r.room_name
      FROM access_permissions ap
      JOIN rooms r ON ap.room_id = r.id
      WHERE ap.employee_id = ${employeeId} AND ap.is_active = true
      ORDER BY ap.granted_at DESC
    `
    return accessRecords
  } catch (error) {
    console.error("Failed to fetch employee room access:", error)
    throw new Error("Failed to fetch employee room access.")
  }
}

export async function checkRoomAccess(employeeId: number, roomId: number): Promise<boolean> {
  noStore() // Ensure no caching
  try {
    const result = await sql`
      SELECT COUNT(*) FROM access_permissions
      WHERE employee_id = ${employeeId} AND room_id = ${roomId} AND is_active = true
    `
    return (result[0] as any).count > 0
  } catch (error) {
    console.error("Failed to check room access:", error)
    throw new Error("Failed to check room access.")
  }
}

export async function recordCheckIn(employeeId: number, nfcCardUid: string, nodeId: string): Promise<AttendanceRecord> {
  noStore() // Ensure no caching
  try {
    const [newRecord] = await sql<AttendanceRecord[]>`
      INSERT INTO attendance_records (employee_id, nfc_card_uid, node_id, tap_time, tap_type)
      VALUES (${employeeId}, ${nfcCardUid}, ${nodeId}, NOW(), 'IN')
      RETURNING *
    `
    return processAttendanceData(newRecord)
  } catch (error) {
    console.error("Failed to record check-in:", error)
    throw new Error("Failed to record check-in.")
  }
}

export async function recordCheckOut(recordId: number): Promise<AttendanceRecord> {
  noStore() // Ensure no caching
  try {
    const [updatedRecord] = await sql<AttendanceRecord[]>`
      UPDATE attendance_records
      SET check_out_time = NOW(),
          duration_ms = EXTRACT(EPOCH FROM (NOW() - check_in_time)) * 1000,
          tap_type = 'OUT'
      WHERE id = ${recordId}
      RETURNING *
    `
    return processAttendanceData(updatedRecord)
  } catch (error) {
    console.error("Failed to record check-out:", error)
    throw new Error("Failed to record check-out.")
  }
}

export async function getAttendanceRecords(employeeId?: number, date?: string): Promise<AttendanceRecord[]> {
  noStore() // Ensure no caching
  try {
    let query = `
      SELECT ar.*, e.first_name, e.last_name, n.location as node_location
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
      JOIN nfc_nodes n ON ar.node_id = n.node_id
    `
    const params: any[] = []
    const conditions: string[] = []

    if (employeeId) {
      conditions.push(`ar.employee_id = $${params.length + 1}`)
      params.push(employeeId)
    }

    if (date) {
      conditions.push(`DATE(ar.tap_time) = $${params.length + 1}`)
      params.push(date)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    query += ` ORDER BY ar.tap_time DESC`

    const result = (await sql(query, params)) as AttendanceRecord[]
    return result.map((row: any) => processAttendanceData(row))
  } catch (error) {
    console.error("Failed to fetch attendance records:", error)
    throw new Error("Failed to fetch attendance records.")
  }
}

export async function getFilterOptions() {
  noStore() // Ensure no caching
  try {
    const departments = await sql`
      SELECT DISTINCT department FROM employees WHERE department IS NOT NULL AND department != '' ORDER BY department
    `

    const positions = await sql`
      SELECT DISTINCT position FROM employees WHERE position IS NOT NULL AND position != '' ORDER BY position
    `

    // Ensure results are arrays
    const deptArray = Array.isArray(departments) ? departments : []
    const posArray = Array.isArray(positions) ? positions : []

    return {
      departments: deptArray.map((d: any) => safeString(d.department)).filter(Boolean),
      positions: posArray.map((p: any) => safeString(p.position)).filter(Boolean),
    }
  } catch (error) {
    console.error("Error fetching filter options:", error)
    return {
      departments: [],
      positions: [],
    }
  }
}

export async function getEmployeeAttendanceHistory(employeeId: number, limit = 50): Promise<AttendanceRecord[]> {
  noStore() // Ensure no caching
  try {
    const result = await sql`
     WITH attendance_with_duration AS (
       SELECT 
         ar.id,
         ar.employee_id,
         COALESCE(CONCAT(e.first_name, ' ', e.last_name), 'Unknown Employee') as employee_name,
         ar.tap_time,
         ar.tap_type,
         ar.nfc_card_uid,
         ar.location,
         ar.node_id,
         ar.node_location,
         CASE 
           WHEN ar.tap_type = 'OUT' THEN (
             SELECT 
               CASE 
                 WHEN EXTRACT(EPOCH FROM (ar.tap_time - ar_in.tap_time)) > 0 
                 THEN CONCAT(
                   FLOOR(EXTRACT(EPOCH FROM (ar.tap_time - ar_in.tap_time)) / 3600)::text, 'h ',
                   FLOOR((EXTRACT(EPOCH FROM (ar.tap_time - ar_in.tap_time)) % 3600) / 60)::text, 'm'
                 )
                 ELSE NULL
               END
             FROM attendance_records ar_in 
             WHERE ar_in.employee_id = ar.employee_id 
               AND ar_in.tap_type = 'IN' 
               AND DATE(ar_in.tap_time) = DATE(ar.tap_time) -- Corrected: Use DATE(ar.tap_time) for the current record's date
               AND ar_in.tap_time < ar.tap_time
             ORDER BY ar_in.tap_time DESC 
             LIMIT 1
           )
           ELSE NULL
         END as duration
       FROM attendance_records ar
       LEFT JOIN employees e ON ar.employee_id = e.id
       WHERE ar.employee_id = ${employeeId} AND DATE(ar.tap_time) = CURRENT_DATE
     )
     SELECT * FROM attendance_with_duration
     ORDER BY tap_time DESC
     LIMIT ${limit}
   `

    // Ensure result is an array
    if (!result || !Array.isArray(result)) {
      console.warn("Employee attendance history query result is not an array:", result)
      return []
    }

    return result.map((row: any) => processAttendanceData(row))
  } catch (error) {
    console.error("Error fetching employee attendance history:", error)
    return []
  }
}

export async function getEmployeeRoomAccessHistory(employeeId: number, limit = 50): Promise<RoomAccessLog[]> {
  noStore() // Ensure no caching
  try {
    const result = await sql`
      SELECT 
        ral.*,
        COALESCE(CONCAT(e.first_name, ' ', e.last_name), 'Unknown Employee') as employee_name,
        r.room_name
      FROM room_access_logs ral
      LEFT JOIN employees e ON ral.employee_id = e.id
      LEFT JOIN rooms r ON ral.room_id = r.id
      WHERE ral.employee_id = ${employeeId}
      ORDER BY ral.access_time DESC
      LIMIT ${limit}
    `

    // Ensure result is an array
    if (!result || !Array.isArray(result)) {
      console.warn("Employee room access history query result is not an array:", result)
      return []
    }

    return result as RoomAccessLog[]
  } catch (error) {
    console.error("Error fetching employee room access history:", error)
    return []
  }
}

export async function getEmployeeAttendanceByDate(employeeId: number, date: string): Promise<AttendanceRecord[]> {
  noStore() // Ensure no caching
  try {
    const result = await sql`
      WITH attendance_with_duration AS (
        SELECT 
          ar.id,
          ar.employee_id,
          COALESCE(CONCAT(e.first_name, ' ', e.last_name), 'Unknown Employee') as employee_name,
          ar.tap_time,
          ar.tap_type,
          ar.nfc_card_uid,
          ar.location,
          ar.node_id,
          ar.node_location,
          CASE 
            WHEN ar.tap_type = 'OUT' THEN (
              SELECT 
                CASE 
                  WHEN EXTRACT(EPOCH FROM (ar.tap_time - ar_in.tap_time)) > 0 
                  THEN CONCAT(
                    FLOOR(EXTRACT(EPOCH FROM (ar.tap_time - ar_in.tap_time)) / 3600)::text, 'h ',
                    FLOOR((EXTRACT(EPOCH FROM (ar.tap_time - ar_in.tap_time)) % 3600) / 60)::text, 'm'
                  )
                  ELSE NULL
                END
              FROM attendance_records ar_in 
              WHERE ar_in.employee_id = ar.employee_id 
                AND ar_in.tap_type = 'IN' 
                AND DATE(ar_in.tap_time) = DATE(ar.tap_time) -- Corrected: Use DATE(ar.tap_time) for the current record's date
                AND ar_in.tap_time < ar.tap_time
              ORDER BY ar_in.tap_time DESC 
              LIMIT 1
            )
            ELSE NULL
          END as duration
        FROM attendance_records ar
        LEFT JOIN employees e ON ar.employee_id = e.id
        WHERE ar.employee_id = ${employeeId} AND DATE(ar.tap_time) = ${date}
      )
      SELECT * FROM attendance_with_duration
      ORDER BY tap_time DESC
    `

    // Ensure result is an array
    if (!result || !Array.isArray(result)) {
      console.warn("Employee attendance by date query result is not an array:", result)
      return []
    }

    return result.map((row: any) => processAttendanceData(row))
  } catch (error) {
    console.error("Error fetching employee attendance by date:", error)
    return []
  }
}

export async function getRoomIdsByCodes(roomCodes: string[]): Promise<number[]> {
  noStore()
  try {
    const result = await sql<{ id: number }[]>`
      SELECT id FROM rooms
      WHERE room_code = ANY(${roomCodes}::text[]) AND is_active = true
    `
    return result.map((row: { id: any }) => row.id)
  } catch (error) {
    console.error("Error fetching room IDs by codes:", error)
    throw new Error("Failed to fetch room IDs for auto-assignment.")
  }
}

// Queries room access logs for a given node_id, includes both granted and denied attempts, and enriches with employee and room names.
export async function getRoomAccessLogsByNodeId(nodeId: string, limit = 100): Promise<RoomAccessLog[]> {
  noStore() // Ensure no caching
  try {
    // Fetch logs for the room associated with this node.
    // If the node has no mapped room_id, this will return an empty set.
    const result = await sql`
      SELECT 
        ral.id,
        ral.employee_id,
        COALESCE(CONCAT(e.first_name, ' ', e.last_name), 'Unknown Employee') AS employee_name,
        ral.room_id,
        COALESCE(r.room_name, 'Unknown Room') AS room_name,
        ral.access_time,
        ral.access_granted,
        ral.nfc_card_uid,
        ral.access_method
      FROM room_access_logs ral
      LEFT JOIN employees e ON ral.employee_id = e.id
      LEFT JOIN rooms r ON ral.room_id = r.id
      WHERE ral.room_id = (
        SELECT nn.room_id
        FROM nfc_nodes nn
        WHERE nn.node_id = ${nodeId}
        LIMIT 1
      )
      ORDER BY ral.access_time DESC
      LIMIT ${limit}
    `

    if (!result || !Array.isArray(result)) {
      console.warn("Room access logs by node query result is not an array:", result)
      return []
    }
    return result as RoomAccessLog[]
  } catch (error) {
    console.error("Error fetching room access logs by node:", error)
    return []
  }
}
