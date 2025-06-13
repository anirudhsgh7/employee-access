-- Insert sample admin user (password: admin123)
INSERT INTO admin_users (user_id, password_hash, full_name) VALUES 
('admin', '$2b$10$rOzJqQqQqQqQqQqQqQqQqO', 'System Administrator')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample rooms
INSERT INTO rooms (room_name, room_code, description) VALUES 
('Main Office', 'MAIN001', 'Main office area'),
('Conference Room A', 'CONF001', 'Large conference room'),
('Server Room', 'SERV001', 'Restricted server room'),
('Storage Room', 'STOR001', 'General storage area'),
('Executive Office', 'EXEC001', 'Executive office suite')
ON CONFLICT (room_code) DO NOTHING;

-- Insert sample employees
INSERT INTO employees (employee_id, first_name, last_name, email, department, position) VALUES 
('EMP001', 'John', 'Doe', 'john.doe@company.com', 'IT', 'Software Developer'),
('EMP002', 'Jane', 'Smith', 'jane.smith@company.com', 'HR', 'HR Manager'),
('EMP003', 'Mike', 'Johnson', 'mike.johnson@company.com', 'Finance', 'Accountant'),
('EMP004', 'Sarah', 'Wilson', 'sarah.wilson@company.com', 'IT', 'System Administrator'),
('EMP005', 'David', 'Brown', 'david.brown@company.com', 'Operations', 'Operations Manager')
ON CONFLICT (employee_id) DO NOTHING;

-- Insert sample NFC cards
INSERT INTO nfc_cards (card_uid, employee_id) VALUES 
('04:A3:22:B1:C4:80:00', 1),
('04:B4:33:C2:D5:91:11', 2),
('04:C5:44:D3:E6:A2:22', 3),
('04:D6:55:E4:F7:B3:33', 4),
('04:E7:66:F5:08:C4:44', 5)
ON CONFLICT (card_uid) DO NOTHING;
