-- Comprehensive authentication diagnosis
SELECT 'Current Admin User State' as diagnosis_step;

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
    SUBSTRING(password_hash, 1, 20) as hash_sample,
    CASE 
        WHEN password_hash LIKE '$2b$12$%' THEN 'Valid bcrypt v2b format'
        WHEN password_hash LIKE '$2a$12$%' THEN 'Valid bcrypt v2a format'
        WHEN password_hash LIKE '$2b$%' THEN 'bcrypt v2b but wrong cost'
        WHEN LENGTH(password_hash) = 60 THEN 'Correct length but wrong format'
        ELSE 'Invalid hash format'
    END as hash_analysis
FROM admin_users 
WHERE user_id = 'admin';

SELECT 'Recent Login Attempts' as diagnosis_step;

SELECT 
    user_id,
    ip_address,
    success,
    error_message,
    attempted_at
FROM login_attempts 
ORDER BY attempted_at DESC 
LIMIT 10;

SELECT 'Database Connection Test' as diagnosis_step;
SELECT CURRENT_TIMESTAMP as current_time, version() as db_version;
