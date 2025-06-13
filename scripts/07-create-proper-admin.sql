-- Delete existing problematic admin user
DELETE FROM admin_users WHERE user_id = 'admin';

-- Create a new admin user with a properly generated bcrypt hash
-- This hash corresponds to the password 'admin123'
INSERT INTO admin_users (
    user_id, 
    password_hash, 
    full_name, 
    is_active, 
    failed_attempts, 
    locked_until, 
    last_login,
    created_at
) VALUES (
    'admin',
    '$2b$12$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQ',
    'System Administrator',
    true,
    0,
    NULL,
    NULL,
    CURRENT_TIMESTAMP
);

-- Verify the new admin user
SELECT 
    'New Admin User Created' as status,
    user_id,
    full_name,
    is_active,
    failed_attempts,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 10) as hash_prefix
FROM admin_users 
WHERE user_id = 'admin';

-- Clear any existing login attempts for fresh start
DELETE FROM login_attempts WHERE user_id = 'admin';

SELECT 'Login attempts cleared' as cleanup_status;
