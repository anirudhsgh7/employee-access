-- Add the node_type column to the nfc_nodes table
ALTER TABLE nfc_nodes
ADD COLUMN node_type VARCHAR(20) NOT NULL DEFAULT 'ATTENDANCE';

-- Update existing nodes to a default type if needed, or based on some logic
-- For example, setting all existing nodes to 'ATTENDANCE'
UPDATE nfc_nodes
SET node_type = 'ATTENDANCE'
WHERE node_type IS NULL;

-- Optionally, add some sample room access nodes for demonstration
INSERT INTO nfc_nodes (node_id, node_name, location, description, ip_address, is_active, status, last_heartbeat, uptime_duration, node_type)
VALUES
('ROOM_001', 'Server Room Door', 'Server Room', 'Access control for server room', '192.168.1.201', TRUE, 'ONLINE', NOW(), '10 days', 'ROOM_ACCESS'),
('ROOM_002', 'Executive Office Door', 'Executive Office', 'Access control for executive office', '192.168.1.202', TRUE, 'ONLINE', NOW(), '5 days', 'ROOM_ACCESS'),
('ROOM_003', 'Storage Closet Door', 'Storage Closet', 'Access control for storage closet', '192.168.1.203', TRUE, 'OFFLINE', NOW() - INTERVAL '2 hours', '1 day', 'ROOM_ACCESS')
ON CONFLICT (node_id) DO NOTHING;

-- Add a unique constraint to node_id if not already present
ALTER TABLE nfc_nodes
ADD CONSTRAINT unique_node_id UNIQUE (node_id);
