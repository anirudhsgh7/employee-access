-- Create NFC nodes/readers table
CREATE TABLE IF NOT EXISTS nfc_nodes (
    id SERIAL PRIMARY KEY,
    node_id VARCHAR(50) UNIQUE NOT NULL,
    node_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address INET,
    is_active BOOLEAN DEFAULT true,
    last_heartbeat TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create node activity logs table
CREATE TABLE IF NOT EXISTS node_activity_logs (
    id SERIAL PRIMARY KEY,
    node_id VARCHAR(50) REFERENCES nfc_nodes(node_id),
    activity_type VARCHAR(20) NOT NULL, -- 'ONLINE', 'OFFLINE', 'ERROR', 'MAINTENANCE'
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update attendance_records to include node information
ALTER TABLE attendance_records 
ADD COLUMN IF NOT EXISTS node_id VARCHAR(50) REFERENCES nfc_nodes(node_id),
ADD COLUMN IF NOT EXISTS node_location VARCHAR(100);

-- Insert default nodes
INSERT INTO nfc_nodes (node_id, node_name, location, description, is_active) VALUES
('NODE_001', 'Main Entrance Reader', 'Main Entrance', 'Primary entrance NFC card reader', true),
('NODE_002', 'Back Entrance Reader', 'Back Entrance', 'Secondary entrance NFC card reader', true),
('NODE_003', 'Parking Garage Reader', 'Parking Garage', 'Underground parking entrance reader', true),
('NODE_004', 'Executive Floor Reader', 'Executive Floor', 'Executive floor access reader', true),
('NODE_005', 'Cafeteria Reader', 'Cafeteria', 'Cafeteria entrance reader', true)
ON CONFLICT (node_id) DO NOTHING;

-- Insert some sample node activity logs
INSERT INTO node_activity_logs (node_id, activity_type, message) VALUES
('NODE_001', 'ONLINE', 'Node came online'),
('NODE_002', 'ONLINE', 'Node came online'),
('NODE_003', 'ONLINE', 'Node came online'),
('NODE_004', 'ONLINE', 'Node came online'),
('NODE_005', 'ONLINE', 'Node came online');

-- Update existing attendance records to have node information
UPDATE attendance_records 
SET node_id = 'NODE_001', node_location = 'Main Entrance' 
WHERE node_id IS NULL;
