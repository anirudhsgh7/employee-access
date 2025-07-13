import { neon } from "@neondatabase/serverless"

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
  card_uid?: string
  card_active?: boolean
  card_assigned_date?: string
  created_at: string
  updated_at: string
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
  duration?: string
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

// Format date to YYYY-MM-DD format without time zone information
const formatDateForDB = (dateString: string): string => {
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
    console.error("Error formatting date:", error)
    // Return current date as fallback
    return new Date().toISOString().split("T")[0]
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
  }

  // Add duration and check times if available
  if (rawRecord.check_in_time) {
    record.check_in_time = safeString(rawRecord.check_in_time)
  }
  if (rawRecord.check_out_time) {
    record.check_out_time = safeString(rawRecord.check_out_time)
  }
  if (rawRecord.check_in_time && rawRecord.check_out_time) {
    record.duration = calculateDuration(rawRecord.check_in_time, rawRecord.check_out_time)
  }

  return record
}

// Enhanced employee functions with better error handling
export async function getEmployeesWithFilters(filters: SearchFilters = {}): Promise<Employee[]> {
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
  try {
    const result = await sql`
      SELECT 
        ar.id,
        ar.employee_id,
        COALESCE(CONCAT(e.first_name, ' ', e.last_name), 'Unknown Employee') as employee_name,
        ar.tap_time,
        ar.tap_type,
        ar.nfc_card_uid,
        ar.location
      FROM attendance_records ar
      LEFT JOIN employees e ON ar.employee_id = e.id
      WHERE DATE(ar.tap_time) = CURRENT_DATE
      ORDER BY ar.tap_time DESC
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
  try {
    const result = await sql`
      SELECT 
        ar.id,
        ar.employee_id,
        COALESCE(CONCAT(e.first_name, ' ', e.last_name), 'Unknown Employee') as employee_name,
        ar.tap_time,
        ar.tap_type,
        ar.nfc_card_uid,
        ar.location
      FROM attendance_records ar
      LEFT JOIN employees e ON ar.employee_id = e.id
      WHERE DATE(ar.tap_time) = ${date}
      ORDER BY ar.tap_time DESC
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

// Keep all other functions the same but add safe processing
export async function getEmployees(): Promise<Employee[]> {
  return getEmployeesWithFilters()
}

export async function getEmployee(id: number): Promise<Employee | null> {
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
    console.error("Error fetching employee:", error)
    return null
  }
}

export async function getRooms(): Promise<Room[]> {
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

export async function getEmployeeAccess(employeeId: number): Promise<AccessPermission[]> {
  try {
    const result = await sql`
      SELECT 
        ap.*,
        r.room_name
      FROM access_permissions ap
      JOIN rooms r ON ap.room_id = r.id
      WHERE ap.employee_id = ${employeeId} AND ap.is_active = true
      ORDER BY r.room_name
    `

    // Ensure result is an array
    if (!result || !Array.isArray(result)) {
      console.warn("Employee access query result is not an array:", result)
      return []
    }

    return result as AccessPermission[]
  } catch (error) {
    console.error("Error fetching employee access:", error)
    return []
  }
}

export async function grantAccess(employeeId: number, roomId: number, grantedBy: string) {
  try {
    await sql`
      INSERT INTO access_permissions (employee_id, room_id, granted_by)
      VALUES (${employeeId}, ${roomId}, ${grantedBy})
      ON CONFLICT (employee_id, room_id) 
      DO UPDATE SET is_active = true, granted_at = CURRENT_TIMESTAMP, granted_by = ${grantedBy}
    `
  } catch (error) {
    console.error("Error granting access:", error)
    throw error
  }
}

export async function revokeAccess(employeeId: number, roomId: number) {
  try {
    await sql`
      UPDATE access_permissions 
      SET is_active = false 
      WHERE employee_id = ${employeeId} AND room_id = ${roomId}
    `
  } catch (error) {
    console.error("Error revoking access:", error)
    throw error
  }
}

export async function assignNFCCard(employeeId: number, cardUid: string) {
  try {
    await sql`
      INSERT INTO nfc_cards (card_uid, employee_id)
      VALUES (${cardUid}, ${employeeId})
      ON CONFLICT (card_uid) 
      DO UPDATE SET employee_id = ${employeeId}, is_active = true, assigned_date = CURRENT_TIMESTAMP
    `
  } catch (error) {
    console.error("Error assigning NFC card:", error)
    throw error
  }
}

export async function deactivateNFCCard(cardUid: string) {
  try {
    await sql`
      UPDATE nfc_cards 
      SET is_active = false 
      WHERE card_uid = ${cardUid}
    `
  } catch (error) {
    console.error("Error deactivating NFC card:", error)
    throw error
  }
}

// Additional helper functions
export async function createEmployee(employeeData: Partial<Employee>): Promise<Employee> {
  try {
    // Format hire_date to ensure it's in YYYY-MM-DD format
    const formattedHireDate = employeeData.hire_date
      ? formatDateForDB(employeeData.hire_date)
      : formatDateForDB(new Date().toISOString())

    const result = await sql`
      INSERT INTO employees (
        employee_id, first_name, last_name, email, phone_number,
        department, position, hire_date, is_active, profile_image_url
      ) VALUES (
        ${employeeData.employee_id},
        ${employeeData.first_name},
        ${employeeData.last_name},
        ${employeeData.email},
        ${employeeData.phone_number || null},
        ${employeeData.department},
        ${employeeData.position},
        ${formattedHireDate},
        ${employeeData.is_active ?? true},
        ${employeeData.profile_image_url || null}
      )
      RETURNING *
    `

    // Ensure result is an array and has at least one element
    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error("Failed to create employee: No result returned")
    }

    return processEmployeeData(result[0])
  } catch (error) {
    console.error("Error creating employee:", error)
    throw new Error(`Failed to create employee: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getFilterOptions() {
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
  try {
    const result = await sql`
      SELECT 
        ar.id,
        ar.employee_id,
        COALESCE(CONCAT(e.first_name, ' ', e.last_name), 'Unknown Employee') as employee_name,
        ar.tap_time,
        ar.tap_type,
        ar.nfc_card_uid,
        ar.location
      FROM attendance_records ar
      LEFT JOIN employees e ON ar.employee_id = e.id
      WHERE ar.employee_id = ${employeeId} AND DATE(ar.tap_time) = CURRENT_DATE
      ORDER BY ar.tap_time DESC
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

export async function updateEmployee(id: number, employeeData: Partial<Employee>): Promise<Employee | null> {
  try {
    // Build the SET clause dynamically based on provided fields
    const updateFields = []
    const values = []
    let paramCounter = 1

    if (employeeData.first_name !== undefined) {
      updateFields.push(`first_name = $${paramCounter++}`)
      values.push(employeeData.first_name)
    }

    if (employeeData.last_name !== undefined) {
      updateFields.push(`last_name = $${paramCounter++}`)
      values.push(employeeData.last_name)
    }

    if (employeeData.email !== undefined) {
      updateFields.push(`email = $${paramCounter++}`)
      values.push(employeeData.email)
    }

    if (employeeData.phone_number !== undefined) {
      updateFields.push(`phone_number = $${paramCounter++}`)
      values.push(employeeData.phone_number)
    }

    if (employeeData.department !== undefined) {
      updateFields.push(`department = $${paramCounter++}`)
      values.push(employeeData.department)
    }

    if (employeeData.position !== undefined) {
      updateFields.push(`position = $${paramCounter++}`)
      values.push(employeeData.position)
    }

    if (employeeData.hire_date !== undefined) {
      // Format the hire_date to ensure it's in YYYY-MM-DD format
      const formattedHireDate = formatDateForDB(employeeData.hire_date)
      updateFields.push(`hire_date = $${paramCounter++}`)
      values.push(formattedHireDate)
    }

    if (employeeData.is_active !== undefined) {
      updateFields.push(`is_active = $${paramCounter++}`)
      values.push(employeeData.is_active)
    }

    if (employeeData.profile_image_url !== undefined) {
      updateFields.push(`profile_image_url = $${paramCounter++}`)
      values.push(employeeData.profile_image_url)
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)

    // If no fields to update, return the current employee
    if (updateFields.length === 0) {
      return getEmployee(id)
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

    const result = await sql.query(query, values)

    // Ensure result is an array and has at least one element
    if (!result || !Array.isArray(result) || result.length === 0) {
      return null
    }

    // Get the updated employee with card info
    return getEmployee(id)
  } catch (error) {
    console.error("Error updating employee:", error)
    throw new Error(`Failed to update employee: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function getEmployeeAttendanceByDate(employeeId: number, date: string): Promise<AttendanceRecord[]> {
  try {
    const result = await sql`
      SELECT 
        ar.id,
        ar.employee_id,
        COALESCE(CONCAT(e.first_name, ' ', e.last_name), 'Unknown Employee') as employee_name,
        ar.tap_time,
        ar.tap_type,
        ar.nfc_card_uid,
        ar.location
      FROM attendance_records ar
      LEFT JOIN employees e ON ar.employee_id = e.id
      WHERE ar.employee_id = ${employeeId} AND DATE(ar.tap_time) = ${date}
      ORDER BY ar.tap_time DESC
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
