-- Add a room link to ROOM_ACCESS nodes so we can fetch logs per node via its room.
-- Safe to run multiple times.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'nfc_nodes' AND column_name = 'room_id'
  ) THEN
    ALTER TABLE nfc_nodes
      ADD COLUMN room_id INTEGER NULL REFERENCES rooms(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Optional indexes to speed up lookups
CREATE INDEX IF NOT EXISTS idx_nfc_nodes_room_id ON nfc_nodes(room_id);
CREATE INDEX IF NOT EXISTS idx_room_access_logs_room_id ON room_access_logs(room_id);
