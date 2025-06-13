-- Update admin users table with proper password hash
-- Password: admin123 -> bcrypt hash
UPDATE admin_users 
SET password_hash = '$2b$12$LQv3c1yqBwlFDtDk.kmysuWYHiXMUkrweLHvKn/jH6kkUgWxGKbaC'
WHERE user_id = 'admin';

-- Add failed login attempts tracking
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL;

-- Create login attempts log table
CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50),
  ip_address INET,
  success BOOLEAN DEFAULT false,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  error_message TEXT
);
