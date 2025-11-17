-- Créer la table skills
CREATE TABLE skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    hours INTEGER DEFAULT 0,
    type VARCHAR(20) DEFAULT 'continuous' CHECK (type IN ('continuous', 'deadline', 'target')),
    deadline DATE,
    target INTEGER,
    target_unit VARCHAR(50),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres skills
CREATE POLICY "Users can view own skills" ON skills
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills" ON skills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills" ON skills
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills" ON skills
    FOR DELETE USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_hours ON skills(hours DESC);