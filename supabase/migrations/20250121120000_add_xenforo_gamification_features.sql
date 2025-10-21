-- Migration: Add XenForo-style features, gamification, and role colors
-- Date: 2025-01-21

-- ============================================
-- PART 1: XenForo-style Features
-- ============================================

-- Add XenForo-style fields to profiles
ALTER TABLE profiles
  ADD COLUMN signature TEXT,
  ADD COLUMN post_count INTEGER DEFAULT 0,
  ADD COLUMN thread_count INTEGER DEFAULT 0,
  ADD COLUMN likes_received INTEGER DEFAULT 0,
  ADD COLUMN likes_given INTEGER DEFAULT 0;

-- Create reactions table (replaces simple votes)
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT reaction_target CHECK (
    (thread_id IS NOT NULL AND comment_id IS NULL) OR
    (thread_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE(user_id, thread_id, reaction_type),
  UNIQUE(user_id, comment_id, reaction_type)
);

-- Create indexes for reactions
CREATE INDEX idx_reactions_thread ON reactions(thread_id);
CREATE INDEX idx_reactions_comment ON reactions(comment_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);

-- Create thread bookmarks table
CREATE TABLE thread_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, thread_id)
);

CREATE INDEX idx_thread_bookmarks_user ON thread_bookmarks(user_id);
CREATE INDEX idx_thread_bookmarks_thread ON thread_bookmarks(thread_id);

-- Create thread watchers table
CREATE TABLE thread_watchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, thread_id)
);

CREATE INDEX idx_thread_watchers_user ON thread_watchers(user_id);
CREATE INDEX idx_thread_watchers_thread ON thread_watchers(thread_id);

-- Create edit history table
CREATE TABLE edit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  editor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  old_content TEXT NOT NULL,
  edit_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT edit_target CHECK (
    (thread_id IS NOT NULL AND comment_id IS NULL) OR
    (thread_id IS NULL AND comment_id IS NOT NULL)
  )
);

CREATE INDEX idx_edit_history_thread ON edit_history(thread_id);
CREATE INDEX idx_edit_history_comment ON edit_history(comment_id);

-- Add quote support to comments
ALTER TABLE comments
  ADD COLUMN quoted_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL;

CREATE INDEX idx_comments_quoted ON comments(quoted_comment_id);

-- ============================================
-- PART 2: Gamification System
-- ============================================

-- Add gamification fields to profiles
ALTER TABLE profiles
  ADD COLUMN experience_points INTEGER DEFAULT 0,
  ADD COLUMN level INTEGER DEFAULT 1,
  ADD COLUMN daily_streak INTEGER DEFAULT 0,
  ADD COLUMN last_login_date DATE,
  ADD COLUMN total_login_days INTEGER DEFAULT 0;

-- Create achievements/badges table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('post_count', 'thread_count', 'reputation', 'login_streak', 'likes_received', 'level', 'manual')),
  requirement_value INTEGER,
  badge_tier TEXT CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements junction table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

-- ============================================
-- PART 3: Role Colors and Custom Roles
-- ============================================

-- Create roles table with custom colors
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6366f1',
  text_color TEXT NOT NULL DEFAULT '#ffffff',
  priority INTEGER DEFAULT 0,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add role_id to profiles (will replace the role TEXT field eventually)
ALTER TABLE profiles
  ADD COLUMN role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

CREATE INDEX idx_profiles_role_id ON profiles(role_id);

-- ============================================
-- PART 4: Followers/Following System
-- ============================================

-- Create followers table
CREATE TABLE followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_followers_follower ON followers(follower_id);
CREATE INDEX idx_followers_following ON followers(following_id);

-- Add follower counts to profiles
ALTER TABLE profiles
  ADD COLUMN follower_count INTEGER DEFAULT 0,
  ADD COLUMN following_count INTEGER DEFAULT 0;

-- ============================================
-- PART 5: Functions and Triggers
-- ============================================

-- Function to update post counts
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'threads' THEN
      UPDATE profiles SET thread_count = thread_count + 1 WHERE id = NEW.author_id;
    ELSIF TG_TABLE_NAME = 'comments' THEN
      UPDATE profiles SET post_count = post_count + 1 WHERE id = NEW.author_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'threads' THEN
      UPDATE profiles SET thread_count = thread_count - 1 WHERE id = OLD.author_id;
    ELSIF TG_TABLE_NAME = 'comments' THEN
      UPDATE profiles SET post_count = post_count - 1 WHERE id = OLD.author_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for post counts
CREATE TRIGGER update_thread_count
  AFTER INSERT OR DELETE ON threads
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

CREATE TRIGGER update_comment_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- Function to update reaction counts
CREATE OR REPLACE FUNCTION update_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'like' THEN
      -- Update likes_given for the user who reacted
      UPDATE profiles SET likes_given = likes_given + 1 WHERE id = NEW.user_id;

      -- Update likes_received for the content author
      IF NEW.thread_id IS NOT NULL THEN
        UPDATE profiles SET likes_received = likes_received + 1
        WHERE id = (SELECT author_id FROM threads WHERE id = NEW.thread_id);
      ELSIF NEW.comment_id IS NOT NULL THEN
        UPDATE profiles SET likes_received = likes_received + 1
        WHERE id = (SELECT author_id FROM comments WHERE id = NEW.comment_id);
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'like' THEN
      -- Update likes_given for the user who reacted
      UPDATE profiles SET likes_given = likes_given - 1 WHERE id = OLD.user_id;

      -- Update likes_received for the content author
      IF OLD.thread_id IS NOT NULL THEN
        UPDATE profiles SET likes_received = likes_received - 1
        WHERE id = (SELECT author_id FROM threads WHERE id = OLD.thread_id);
      ELSIF OLD.comment_id IS NOT NULL THEN
        UPDATE profiles SET likes_received = likes_received - 1
        WHERE id = (SELECT author_id FROM comments WHERE id = OLD.comment_id);
      END IF;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reaction counts
CREATE TRIGGER update_reactions_on_action
  AFTER INSERT OR DELETE ON reactions
  FOR EACH ROW EXECUTE FUNCTION update_reaction_counts();

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    UPDATE profiles SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for follower counts
CREATE TRIGGER update_follower_counts_on_action
  AFTER INSERT OR DELETE ON followers
  FOR EACH ROW EXECUTE FUNCTION update_follower_counts();

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  RETURN FLOOR(SQRT(xp::NUMERIC / 100)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to grant achievement
CREATE OR REPLACE FUNCTION check_and_grant_achievements(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  achievement RECORD;
  user_profile RECORD;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile FROM profiles WHERE id = p_user_id;

  -- Check each achievement
  FOR achievement IN SELECT * FROM achievements WHERE requirement_type != 'manual' LOOP
    -- Skip if already earned
    IF EXISTS (SELECT 1 FROM user_achievements WHERE user_id = p_user_id AND achievement_id = achievement.id) THEN
      CONTINUE;
    END IF;

    -- Check requirement
    CASE achievement.requirement_type
      WHEN 'post_count' THEN
        IF user_profile.post_count >= achievement.requirement_value THEN
          INSERT INTO user_achievements (user_id, achievement_id) VALUES (p_user_id, achievement.id);
        END IF;
      WHEN 'thread_count' THEN
        IF user_profile.thread_count >= achievement.requirement_value THEN
          INSERT INTO user_achievements (user_id, achievement_id) VALUES (p_user_id, achievement.id);
        END IF;
      WHEN 'reputation' THEN
        IF user_profile.reputation >= achievement.requirement_value THEN
          INSERT INTO user_achievements (user_id, achievement_id) VALUES (p_user_id, achievement.id);
        END IF;
      WHEN 'login_streak' THEN
        IF user_profile.daily_streak >= achievement.requirement_value THEN
          INSERT INTO user_achievements (user_id, achievement_id) VALUES (p_user_id, achievement.id);
        END IF;
      WHEN 'likes_received' THEN
        IF user_profile.likes_received >= achievement.requirement_value THEN
          INSERT INTO user_achievements (user_id, achievement_id) VALUES (p_user_id, achievement.id);
        END IF;
      WHEN 'level' THEN
        IF user_profile.level >= achievement.requirement_value THEN
          INSERT INTO user_achievements (user_id, achievement_id) VALUES (p_user_id, achievement.id);
        END IF;
    END CASE;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update XP and level
CREATE OR REPLACE FUNCTION update_user_xp(p_user_id UUID, p_xp_gain INTEGER)
RETURNS VOID AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  UPDATE profiles
  SET experience_points = experience_points + p_xp_gain
  WHERE id = p_user_id
  RETURNING experience_points INTO new_xp;

  new_level := calculate_level(new_xp);

  UPDATE profiles SET level = new_level WHERE id = p_user_id;

  -- Check for achievements
  PERFORM check_and_grant_achievements(p_user_id);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 6: Row Level Security (RLS)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reactions
CREATE POLICY "Reactions are viewable by everyone" ON reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions" ON reactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for thread_bookmarks
CREATE POLICY "Users can view own bookmarks" ON thread_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookmarks" ON thread_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON thread_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for thread_watchers
CREATE POLICY "Users can view own watches" ON thread_watchers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own watches" ON thread_watchers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own watches" ON thread_watchers FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for edit_history
CREATE POLICY "Edit history is viewable by everyone" ON edit_history FOR SELECT USING (true);

-- RLS Policies for achievements
CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "User achievements are viewable by everyone" ON user_achievements FOR SELECT USING (true);

-- RLS Policies for roles
CREATE POLICY "Roles are viewable by everyone" ON roles FOR SELECT USING (true);

-- RLS Policies for followers
CREATE POLICY "Followers are viewable by everyone" ON followers FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON followers FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow others" ON followers FOR DELETE USING (auth.uid() = follower_id);

-- ============================================
-- PART 7: Insert Default Data
-- ============================================

-- Insert default roles
INSERT INTO roles (name, slug, color, text_color, priority, permissions) VALUES
  ('Admin', 'admin', '#ef4444', '#ffffff', 100, '["manage_users", "manage_threads", "manage_categories", "manage_roles"]'::jsonb),
  ('Moderator', 'moderator', '#f59e0b', '#000000', 50, '["manage_threads", "delete_posts"]'::jsonb),
  ('VIP', 'vip', '#8b5cf6', '#ffffff', 25, '[]'::jsonb),
  ('Member', 'member', '#6366f1', '#ffffff', 10, '[]'::jsonb),
  ('New User', 'new-user', '#94a3b8', '#000000', 1, '[]'::jsonb);

-- Insert default achievements
INSERT INTO achievements (name, slug, description, icon, color, requirement_type, requirement_value, badge_tier) VALUES
  ('First Post', 'first-post', 'Make your first post', 'MessageSquare', '#10b981', 'post_count', 1, 'bronze'),
  ('Active Poster', 'active-poster', 'Post 50 times', 'MessageSquare', '#3b82f6', 'post_count', 50, 'silver'),
  ('Prolific Poster', 'prolific-poster', 'Post 500 times', 'MessageSquare', '#8b5cf6', 'post_count', 500, 'gold'),
  ('First Thread', 'first-thread', 'Create your first thread', 'FileText', '#10b981', 'thread_count', 1, 'bronze'),
  ('Thread Starter', 'thread-starter', 'Create 10 threads', 'FileText', '#3b82f6', 'thread_count', 10, 'silver'),
  ('Discussion Leader', 'discussion-leader', 'Create 100 threads', 'FileText', '#8b5cf6', 'thread_count', 100, 'gold'),
  ('Well Known', 'well-known', 'Reach 100 reputation', 'Award', '#f59e0b', 'reputation', 100, 'bronze'),
  ('Popular', 'popular', 'Reach 1000 reputation', 'Award', '#f59e0b', 'reputation', 1000, 'silver'),
  ('Celebrity', 'celebrity', 'Reach 10000 reputation', 'Award', '#f59e0b', 'reputation', 10000, 'gold'),
  ('Loved', 'loved', 'Receive 100 likes', 'Heart', '#ec4899', 'likes_received', 100, 'bronze'),
  ('Adored', 'adored', 'Receive 1000 likes', 'Heart', '#ec4899', 'likes_received', 1000, 'silver'),
  ('Dedicated', 'dedicated', 'Login for 7 days in a row', 'Calendar', '#6366f1', 'login_streak', 7, 'bronze'),
  ('Committed', 'committed', 'Login for 30 days in a row', 'Calendar', '#6366f1', 'login_streak', 30, 'silver'),
  ('Level 5', 'level-5', 'Reach level 5', 'TrendingUp', '#8b5cf6', 'level', 5, 'bronze'),
  ('Level 10', 'level-10', 'Reach level 10', 'TrendingUp', '#8b5cf6', 'level', 10, 'silver'),
  ('Level 25', 'level-25', 'Reach level 25', 'TrendingUp', '#8b5cf6', 'level', 25, 'gold');

-- Add comments for documentation
COMMENT ON TABLE reactions IS 'XenForo-style reactions (like, love, etc.)';
COMMENT ON TABLE thread_bookmarks IS 'User bookmarks for threads';
COMMENT ON TABLE thread_watchers IS 'Users watching threads for updates';
COMMENT ON TABLE edit_history IS 'Track edits to threads and comments';
COMMENT ON TABLE achievements IS 'Gamification achievements/badges';
COMMENT ON TABLE user_achievements IS 'User earned achievements';
COMMENT ON TABLE roles IS 'Custom roles with colors and permissions';
COMMENT ON TABLE followers IS 'User following system';
