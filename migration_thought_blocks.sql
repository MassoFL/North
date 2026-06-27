-- ============================================================
-- Migration : Thoughts en "mur à blocs"
-- Une Thought devient une liste ordonnée de blocs typés
-- (texte, whiteboard, carrousel de photos, vidéo).
-- ============================================================

-- 1) Nouvelle colonne "blocks" sur shared_maps
--    Format : tableau JSON ordonné de blocs
--    [{ "id": "...", "type": "text|whiteboard|carousel|video", "data": {...} }]
ALTER TABLE shared_maps
    ADD COLUMN IF NOT EXISTS blocks JSONB DEFAULT '[]'::jsonb;

-- excalidraw_data reste pour compatibilité avec les anciennes Thoughts,
-- mais n'est plus requis pour les nouvelles.
ALTER TABLE shared_maps
    ALTER COLUMN excalidraw_data DROP NOT NULL;

-- ============================================================
-- 2) Bucket de stockage pour les médias des blocs (images + vidéos)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('thought-media', 'thought-media', true)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique des médias (les Thoughts publiques doivent être visibles par tous)
DROP POLICY IF EXISTS "Public read thought-media" ON storage.objects;
CREATE POLICY "Public read thought-media" ON storage.objects
    FOR SELECT USING (bucket_id = 'thought-media');

-- Upload réservé aux utilisateurs authentifiés, dans leur propre dossier (prefix = user id)
DROP POLICY IF EXISTS "Authenticated upload thought-media" ON storage.objects;
CREATE POLICY "Authenticated upload thought-media" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'thought-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Suppression réservée au propriétaire du fichier
DROP POLICY IF EXISTS "Owner delete thought-media" ON storage.objects;
CREATE POLICY "Owner delete thought-media" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'thought-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
