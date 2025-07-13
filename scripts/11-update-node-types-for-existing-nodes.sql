-- Update 'Main Office Node' to be a 'ROOM_ACCESS' type
UPDATE nfc_nodes
SET node_type = 'ROOM_ACCESS'
WHERE node_name = 'Main Office Node' AND node_type != 'ROOM_ACCESS';

-- Update 'Storage Room Node' to be a 'ROOM_ACCESS' type
UPDATE nfc_nodes
SET node_type = 'ROOM_ACCESS'
WHERE node_name = 'Storage Room Node' AND node_type != 'ROOM_ACCESS';

-- If you know the specific node_ids, it's safer to use them:
-- UPDATE nfc_nodes
-- SET node_type = 'ROOM_ACCESS'
-- WHERE node_id = 'YOUR_MAIN_OFFICE_NODE_ID' AND node_type != 'ROOM_ACCESS';

-- UPDATE nfc_nodes
-- SET node_type = 'ROOM_ACCESS'
-- WHERE node_id = 'YOUR_STORAGE_ROOM_NODE_ID' AND node_type != 'ROOM_ACCESS';
