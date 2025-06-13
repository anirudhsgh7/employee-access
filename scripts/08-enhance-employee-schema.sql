-- Add phone number to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Create attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  tap_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tap_type VARCHAR(10) CHECK (tap_type IN ('IN', 'OUT')) DEFAULT 'IN',
  nfc_card_uid VARCHAR(100),
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create room access logs table
CREATE TABLE IF NOT EXISTS room_access_logs (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  access_granted BOOLEAN DEFAULT true,
  nfc_card_uid VARCHAR(100),
  access_method VARCHAR(50) DEFAULT 'NFC_CARD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance_records(employee_id, DATE(tap_time));
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(DATE(tap_time));
CREATE INDEX IF NOT EXISTS idx_room_access_employee_date ON room_access_logs(employee_id, DATE(access_time));
CREATE INDEX IF NOT EXISTS idx_room_access_date ON room_access_logs(DATE(access_time));

-- Insert sample attendance data for today
INSERT INTO attendance_records (employee_id, tap_time, tap_type, nfc_card_uid, location) VALUES
(1, CURRENT_TIMESTAMP - INTERVAL '8 hours', 'IN', '04:A3:22:B1:C4:80:00', 'Main Entrance'),
(2, CURRENT_TIMESTAMP - INTERVAL '7 hours 30 minutes', 'IN', '04:B4:33:C2:D5:91:11', 'Main Entrance'),
(3, CURRENT_TIMESTAMP - INTERVAL '7 hours', 'IN', '04:C5:44:D3:E6:A2:22', 'Main Entrance'),
(1, CURRENT_TIMESTAMP - INTERVAL '4 hours', 'OUT', '04:A3:22:B1:C4:80:00', 'Main Entrance'),
(1, CURRENT_TIMESTAMP - INTERVAL '3 hours 30 minutes', 'IN', '04:A3:22:B1:C4:80:00', 'Main Entrance'),
(4, CURRENT_TIMESTAMP - INTERVAL '6 hours', 'IN', '04:D6:55:E4:F7:B3:33', 'Main Entrance'),
(5, CURRENT_TIMESTAMP - INTERVAL '5 hours 45 minutes', 'IN', '04:E7:66:F5:08:C4:44', 'Main Entrance');

-- Insert sample room access logs
INSERT INTO room_access_logs (employee_id, room_id, access_time, access_granted, nfc_card_uid) VALUES
(1, 1, CURRENT_TIMESTAMP - INTERVAL '7 hours 30 minutes', true, '04:A3:22:B1:C4:80:00'),
(1, 3, CURRENT_TIMESTAMP - INTERVAL '6 hours', true, '04:A3:22:B1:C4:80:00'),
(2, 1, CURRENT_TIMESTAMP - INTERVAL '7 hours', true, '04:B4:33:C2:D5:91:11'),
(2, 2, CURRENT_TIMESTAMP - INTERVAL '5 hours', true, '04:B4:33:C2:D5:91:11'),
(4, 3, CURRENT_TIMESTAMP - INTERVAL '5 hours 30 minutes', true, '04:D6:55:E4:F7:B3:33'),
(4, 1, CURRENT_TIMESTAMP - INTERVAL '4 hours', true, '04:D6:55:E4:F7:B3:33');

-- Update employees with phone numbers
UPDATE employees SET phone_number = '+1-555-0101' WHERE employee_id = 'EMP001';
UPDATE employees SET phone_number = '+1-555-0102' WHERE employee_id = 'EMP002';
UPDATE employees SET phone_number = '+1-555-0103' WHERE employee_id = 'EMP003';
UPDATE employees SET phone_number = '+1-555-0104' WHERE employee_id = 'EMP004';
UPDATE employees SET phone_number = '+1-555-0105' WHERE employee_id = 'EMP005';
