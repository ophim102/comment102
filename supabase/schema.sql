-- Tạo bảng users để lưu thông tin người dùng
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255) UNIQUE NOT NULL, -- ID từ website chính
    username VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng topics để lưu thông tin chủ đề/bài viết
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255) UNIQUE NOT NULL, -- ID từ website chính
    title VARCHAR(500),
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Cho reply
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng reactions (like/dislike)
CREATE TABLE IF NOT EXISTS comment_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(10) NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Tạo indexes để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_comments_topic_id ON comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_likes_count ON comments(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON comment_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_external_id ON users(external_id);
CREATE INDEX IF NOT EXISTS idx_topics_external_id ON topics(external_id);

-- Tạo function để cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo triggers để tự động cập nhật updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tạo function để cập nhật replies_count
CREATE OR REPLACE FUNCTION update_replies_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.parent_id IS NOT NULL THEN
            UPDATE comments 
            SET replies_count = replies_count + 1 
            WHERE id = NEW.parent_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.parent_id IS NOT NULL THEN
            UPDATE comments 
            SET replies_count = replies_count - 1 
            WHERE id = OLD.parent_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Tạo trigger để cập nhật replies_count
CREATE TRIGGER update_replies_count_trigger
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_replies_count();

-- Tạo function để cập nhật likes/dislikes count
CREATE OR REPLACE FUNCTION update_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.reaction_type = 'like' THEN
            UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
        ELSIF NEW.reaction_type = 'dislike' THEN
            UPDATE comments SET dislikes_count = dislikes_count + 1 WHERE id = NEW.comment_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Xóa reaction cũ
        IF OLD.reaction_type = 'like' THEN
            UPDATE comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
        ELSIF OLD.reaction_type = 'dislike' THEN
            UPDATE comments SET dislikes_count = dislikes_count - 1 WHERE id = OLD.comment_id;
        END IF;
        -- Thêm reaction mới
        IF NEW.reaction_type = 'like' THEN
            UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
        ELSIF NEW.reaction_type = 'dislike' THEN
            UPDATE comments SET dislikes_count = dislikes_count + 1 WHERE id = NEW.comment_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.reaction_type = 'like' THEN
            UPDATE comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
        ELSIF OLD.reaction_type = 'dislike' THEN
            UPDATE comments SET dislikes_count = dislikes_count - 1 WHERE id = OLD.comment_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Tạo trigger để cập nhật reaction count
CREATE TRIGGER update_reaction_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON comment_reactions
    FOR EACH ROW EXECUTE FUNCTION update_reaction_count();

-- Tạo view để lấy comments với thông tin user
CREATE OR REPLACE VIEW comments_with_users AS
SELECT 
    c.*,
    u.username,
    u.avatar_url,
    u.external_id as user_external_id
FROM comments c
JOIN users u ON c.user_id = u.id;

-- Tạo RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Policy cho users - cho phép đọc tất cả, chỉ cho phép insert/update với external_id
CREATE POLICY "Users can read all" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert with external_id" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);

-- Policy cho topics - cho phép đọc tất cả, chỉ cho phép insert/update với external_id
CREATE POLICY "Topics can read all" ON topics FOR SELECT USING (true);
CREATE POLICY "Topics can insert with external_id" ON topics FOR INSERT WITH CHECK (true);
CREATE POLICY "Topics can update own data" ON topics FOR UPDATE USING (true);

-- Policy cho comments - cho phép đọc tất cả, insert/update với user_id
CREATE POLICY "Comments can read all" ON comments FOR SELECT USING (true);
CREATE POLICY "Comments can insert with user_id" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Comments can update own data" ON comments FOR UPDATE USING (true);

-- Policy cho comment_reactions - cho phép đọc tất cả, insert/update với user_id
CREATE POLICY "Comment reactions can read all" ON comment_reactions FOR SELECT USING (true);
CREATE POLICY "Comment reactions can insert with user_id" ON comment_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Comment reactions can update own data" ON comment_reactions FOR UPDATE USING (true);
CREATE POLICY "Comment reactions can delete own data" ON comment_reactions FOR DELETE USING (true);
