import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Employee {
  id: number
  employee_id: string
  first_name: string
  last_name: string
  email: string
  department: string
  position: string
  hire_date: string
  is_active: boolean
  card_uid?: string
  card_active?: boolean
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

export async function getEmployees(): Promise<Employee[]> {
  const result = await sql`
    SELECT 
      e.*,
      n.card_uid,
      n.is_active as card_active
    FROM employees e
    LEFT JOIN nfc_cards n ON e.id = n.employee_id
    ORDER BY e.employee_id
  `
  return result as Employee[]
}

export async function getEmployee(id: number): Promise<Employee | null> {
  const result = await sql`
    SELECT 
      e.*,
      n.card_uid,
      n.is_active as card_active
    FROM employees e
    LEFT JOIN nfc_cards n ON e.id = n.employee_id
    WHERE e.id = ${id}
  `
  return (result[0] as Employee) || null
}

export async function getRooms(): Promise<Room[]> {
  const result = await sql`
    SELECT * FROM rooms 
    WHERE is_active = true 
    ORDER BY room_name
  `
  return result as Room[]
}

export async function getEmployeeAccess(employeeId: number): Promise<AccessPermission[]> {
  const result = await sql`
    SELECT 
      ap.*,
      r.room_name
    FROM access_permissions ap
    JOIN rooms r ON ap.room_id = r.id
    WHERE ap.employee_id = ${employeeId} AND ap.is_active = true
    ORDER BY r.room_name
  `
  return result as AccessPermission[]
}

export async function grantAccess(employeeId: number, roomId: number, grantedBy: string) {
  await sql`
    INSERT INTO access_permissions (employee_id, room_id, granted_by)
    VALUES (${employeeId}, ${roomId}, ${grantedBy})
    ON CONFLICT (employee_id, room_id) 
    DO UPDATE SET is_active = true, granted_at = CURRENT_TIMESTAMP, granted_by = ${grantedBy}
  `
}

export async function revokeAccess(employeeId: number, roomId: number) {
  await sql`
    UPDATE access_permissions 
    SET is_active = false 
    WHERE employee_id = ${employeeId} AND room_id = ${roomId}
  `
}

export async function assignNFCCard(employeeId: number, cardUid: string) {
  await sql`
    INSERT INTO nfc_cards (card_uid, employee_id)
    VALUES (${cardUid}, ${employeeId})
    ON CONFLICT (card_uid) 
    DO UPDATE SET employee_id = ${employeeId}, is_active = true, assigned_date = CURRENT_TIMESTAMP
  `
}

export async function deactivateNFCCard(cardUid: string) {
  await sql`
    UPDATE nfc_cards 
    SET is_active = false 
    WHERE card_uid = ${cardUid}
  `
}
