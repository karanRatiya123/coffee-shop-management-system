-- Add avatar column to users table (run once if column missing)
-- ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL;

-- Fix broken default that points to a missing file (default-avatar.png does not exist)
UPDATE users
SET avatar = 'images/default-avatar.svg'
WHERE avatar IS NULL
   OR avatar = ''
   OR avatar = 'images/default-avatar.png'
   OR avatar = 'default-avatar.png';

-- To use YOUR photo as employee avatar:
-- 1. Copy your image file into: Test/src/main/webapp/images/karan.jpg
-- 2. Republish / refresh the Tomcat app
-- 3. Run:
-- UPDATE users SET avatar = 'images/karan.jpg' WHERE username = 'karan';
