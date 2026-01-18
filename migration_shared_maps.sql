-- Table pour les Maps Partagés
CREATE TABLE shared_maps (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    excalidraw_data JSONB NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_public BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE shared_maps ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut voir les maps publiques (lecture seule)
CREATE POLICY "Anyone can view public maps" ON shared_maps
    FOR SELECT USING (is_public = true);

-- Politique: Le propriétaire peut tout faire sur ses maps
CREATE POLICY "Owner can view own maps" ON shared_maps
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owner can insert own maps" ON shared_maps
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner can update own maps" ON shared_maps
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owner can delete own maps" ON shared_maps
    FOR DELETE USING (auth.uid() = owner_id);

-- Index pour améliorer les performances
CREATE INDEX idx_shared_maps_owner ON shared_maps(owner_id);
CREATE INDEX idx_shared_maps_public ON shared_maps(is_public) WHERE is_public = true;
CREATE INDEX idx_shared_maps_created ON shared_maps(created_at DESC);

-- Fonction pour mettre à jour le compteur de vues
CREATE OR REPLACE FUNCTION increment_map_view_count(map_id BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE shared_maps 
    SET view_count = view_count + 1 
    WHERE id = map_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
