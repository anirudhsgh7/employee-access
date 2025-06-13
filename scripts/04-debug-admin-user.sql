-- Debug the current admin user state
SELECT 
    id,
    user_id,
    full_name,
    is_active,
    failed_attempts,
    locked_until,
    last_login,
    created_at,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 10) as hash_prefix
FROM admin_users 
WHERE user_id = 'admin';

-- Check if there are any login attempts
SELECT COUNT(*) as total_attempts FROM login_attempts;

-- Verify the password hash format
SELECT 
    user_id,
    CASE 
        WHEN password_hash LIKE '$2b$%' THEN 'bcrypt format'
        WHEN password_hash LIKE '$2a$%' THEN 'bcrypt format (old)'
        WHEN LENGTH(password_hash) = 60 THEN 'likely bcrypt'
        ELSE 'unknown format'
    END as hash_format,
    LENGTH(password_hash) as hash_length
FROM admin_users;
