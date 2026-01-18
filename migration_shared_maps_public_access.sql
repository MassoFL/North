-- Mise à jour des politiques RLS pour permettre l'accès public aux maps publiques

-- Supprimer l'ancienne politique de lecture publique
DROP POLICY IF EXISTS "Anyone can view public maps" ON shared_maps;

-- Créer une nouvelle politique qui permet l'accès sans authentification
CREATE POLICY "Public maps are viewable by everyone" ON shared_maps
    FOR SELECT USING (is_public = true);

-- Note: Cette politique permet à TOUT LE MONDE (même non authentifié) 
-- de voir les maps publiques
