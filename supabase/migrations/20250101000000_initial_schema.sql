-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30)
);

-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create threads table
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT title_length CHECK (char_length(title) >= 5 AND char_length(title) <= 300)
);

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT vote_target CHECK (
    (thread_id IS NOT NULL AND comment_id IS NULL) OR
    (thread_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, comment_id)
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reply', 'mention', 'vote')),
  content TEXT NOT NULL,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create thread_tags junction table
CREATE TABLE thread_tags (
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (thread_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX idx_threads_author ON threads(author_id);
CREATE INDEX idx_threads_category ON threads(category_id);
CREATE INDEX idx_threads_created ON threads(created_at DESC);
CREATE INDEX idx_threads_pinned ON threads(is_pinned, created_at DESC);
CREATE INDEX idx_comments_thread ON comments(thread_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_votes_thread ON votes(thread_id);
CREATE INDEX idx_votes_comment ON votes(comment_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_thread_tags_thread ON thread_tags(thread_id);
CREATE INDEX idx_thread_tags_tag ON thread_tags(tag_id);

-- Create full-text search indexes
CREATE INDEX idx_threads_title_search ON threads USING GIN (to_tsvector('english', title));
CREATE INDEX idx_threads_content_search ON threads USING GIN (to_tsvector('english', content));
CREATE INDEX idx_profiles_username_search ON profiles USING GIN (username gin_trgm_ops);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate and update reputation
CREATE OR REPLACE FUNCTION update_author_reputation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.thread_id IS NOT NULL THEN
      -- Update thread author reputation
      UPDATE profiles
      SET reputation = reputation + CASE WHEN NEW.vote_type = 'upvote' THEN 10 ELSE -5 END
      WHERE id = (SELECT author_id FROM threads WHERE id = NEW.thread_id);
    ELSIF NEW.comment_id IS NOT NULL THEN
      -- Update comment author reputation
      UPDATE profiles
      SET reputation = reputation + CASE WHEN NEW.vote_type = 'upvote' THEN 5 ELSE -2 END
      WHERE id = (SELECT author_id FROM comments WHERE id = NEW.comment_id);
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type != NEW.vote_type THEN
      IF NEW.thread_id IS NOT NULL THEN
        UPDATE profiles
        SET reputation = reputation + CASE WHEN NEW.vote_type = 'upvote' THEN 15 ELSE -15 END
        WHERE id = (SELECT author_id FROM threads WHERE id = NEW.thread_id);
      ELSIF NEW.comment_id IS NOT NULL THEN
        UPDATE profiles
        SET reputation = reputation + CASE WHEN NEW.vote_type = 'upvote' THEN 7 ELSE -7 END
        WHERE id = (SELECT author_id FROM comments WHERE id = NEW.comment_id);
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.thread_id IS NOT NULL THEN
      UPDATE profiles
      SET reputation = reputation - CASE WHEN OLD.vote_type = 'upvote' THEN 10 ELSE -5 END
      WHERE id = (SELECT author_id FROM threads WHERE id = OLD.thread_id);
    ELSIF OLD.comment_id IS NOT NULL THEN
      UPDATE profiles
      SET reputation = reputation - CASE WHEN OLD.vote_type = 'upvote' THEN 5 ELSE -2 END
      WHERE id = (SELECT author_id FROM comments WHERE id = OLD.comment_id);
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for reputation updates
CREATE TRIGGER update_reputation_on_vote
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_author_reputation();

-- Function to create notification on reply
CREATE OR REPLACE FUNCTION create_reply_notification()
RETURNS TRIGGER AS $$
DECLARE
  parent_author_id UUID;
  thread_title TEXT;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    SELECT author_id INTO parent_author_id FROM comments WHERE id = NEW.parent_id;
  ELSE
    SELECT author_id INTO parent_author_id FROM threads WHERE id = NEW.thread_id;
  END IF;

  IF parent_author_id != NEW.author_id THEN
    SELECT title INTO thread_title FROM threads WHERE id = NEW.thread_id;
    INSERT INTO notifications (user_id, type, content, thread_id, comment_id)
    VALUES (
      parent_author_id,
      'reply',
      'Someone replied to your ' || CASE WHEN NEW.parent_id IS NULL THEN 'thread' ELSE 'comment' END,
      NEW.thread_id,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for reply notifications
CREATE TRIGGER notify_on_reply
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION create_reply_notification();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for categories
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- RLS Policies for tags
CREATE POLICY "Tags are viewable by everyone" ON tags FOR SELECT USING (true);

-- RLS Policies for threads
CREATE POLICY "Threads are viewable by everyone" ON threads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create threads" ON threads FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own threads" ON threads FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own threads" ON threads FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own comments" ON comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own comments" ON comments FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for votes
CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for thread_tags
CREATE POLICY "Thread tags are viewable by everyone" ON thread_tags FOR SELECT USING (true);
CREATE POLICY "Thread authors can manage tags" ON thread_tags FOR ALL USING (
  auth.uid() IN (SELECT author_id FROM threads WHERE id = thread_id)
);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some default categories
INSERT INTO categories (name, slug, description, color) VALUES
  ('General', 'general', 'General discussions about anything', '#6366f1'),
  ('Digital Services', 'digital-services', 'Sell and buy digital services', '#8b5cf6'),
  ('Usernames', 'usernames', 'Trade usernames and handles', '#ec4899'),
  ('Marketplace', 'marketplace', 'Buy and sell digital goods', '#f59e0b'),
  ('Support', 'support', 'Get help and support', '#10b981'),
  ('Announcements', 'announcements', 'Official announcements', '#ef4444');
