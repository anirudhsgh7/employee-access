-- Link ROOM_ACCESS nodes with a room so we can query logs per node via its room_id.
-- Safe to run multiple times.

ALTER TABLE nfc_nodes
  ADD COLUMN IF NOT EXISTS room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_nfc_nodes_room_id ON nfc_nodes(room_id);

-- Optional: If you already know mappings, you can set them here, e.g.:
-- UPDATE nfc_nodes SET room_id = (SELECT id FROM rooms WHERE room_code = 'CONF001') WHERE node_id = 'NODE_CONF_1';
