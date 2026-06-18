-- ===== HYPPOPROOF =====
-- Section communautaire : chaque utilisateur connecté peut poser des
-- hypothèses, et tout le monde peut apporter des preuves (proofs).

-- Table des hypothèses
CREATE TABLE IF NOT EXISTS hypotheses (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE hypotheses ENABLE ROW LEVEL SECURITY;

-- Tout utilisateur connecté peut voir toutes les hypothèses
CREATE POLICY "Authenticated can view hypotheses" ON hypotheses
    FOR SELECT USING (auth.role() = 'authenticated');

-- Seul le créateur peut créer / modifier / supprimer ses hypothèses
CREATE POLICY "Owner can insert own hypotheses" ON hypotheses
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner can update own hypotheses" ON hypotheses
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owner can delete own hypotheses" ON hypotheses
    FOR DELETE USING (auth.uid() = owner_id);

CREATE INDEX idx_hypotheses_owner ON hypotheses(owner_id);
CREATE INDEX idx_hypotheses_created ON hypotheses(created_at DESC);


-- Table des preuves (rattachées à une hypothèse)
CREATE TABLE IF NOT EXISTS proofs (
    id BIGSERIAL PRIMARY KEY,
    hypothesis_id BIGINT REFERENCES hypotheses(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;

-- Tout utilisateur connecté peut voir toutes les preuves
CREATE POLICY "Authenticated can view proofs" ON proofs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Tout utilisateur connecté peut apporter une preuve (sous son identité)
CREATE POLICY "Authenticated can insert proofs" ON proofs
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Seul l'auteur peut supprimer sa preuve
CREATE POLICY "Author can delete own proofs" ON proofs
    FOR DELETE USING (auth.uid() = author_id);

CREATE INDEX idx_proofs_hypothesis ON proofs(hypothesis_id);
CREATE INDEX idx_proofs_created ON proofs(created_at ASC);
