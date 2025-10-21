-- Add missing fields to profiles table
ALTER TABLE profiles
  ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  ADD COLUMN location TEXT,
  ADD COLUMN website TEXT;

-- Create index on role for efficient role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- Add comment for documentation
COMMENT ON COLUMN profiles.role IS 'User role: user, moderator, or admin';
COMMENT ON COLUMN profiles.location IS 'User location (optional)';
COMMENT ON COLUMN profiles.website IS 'User website URL (optional)';
