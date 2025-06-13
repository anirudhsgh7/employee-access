-- First, let's see the current state
SELECT 
    user_id, 
    password_hash,
    LENGTH(password_hash) as hash_length,
    CASE 
        WHEN password_hash LIKE '$2b$%' THEN 'Valid bcrypt'
        WHEN password_hash LIKE '$2a$%' THEN 'Old bcrypt'
        ELSE 'Invalid format'
    END as hash_status
FROM admin_users 
WHERE user_id = 'admin';

-- Delete the existing admin user and recreate with proper hash
DELETE FROM admin_users WHERE user_id = 'admin';

-- Insert admin user with properly generated bcrypt hash for 'admin123'
INSERT INTO admin_users (user_id, password_hash, full_name, is_active, failed_attempts, locked_until, last_login) 
VALUES (
    'admin', 
    '$2b$12$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQ',
    'System Administrator', 
    true, 
    0, 
    NULL, 
    NULL
);

-- Verify the insertion
SELECT 
    user_id, 
    full_name, 
    is_active,
    failed_attempts,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 7) as hash_prefix
FROM admin_users 
WHERE user_id = 'admin';
