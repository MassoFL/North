-- Migration pour ajouter le whiteboard Excalidraw à chaque skill
-- Ajouter le champ whiteboard_data pour stocker les données Excalidraw

ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS whiteboard_data JSONB DEFAULT NULL;

-- Index pour améliorer les performances si on veut chercher les skills avec whiteboard
CREATE INDEX IF NOT EXISTS idx_skills_has_whiteboard ON skills(user_id) 
WHERE whiteboard_data IS NOT NULL;

-- Commentaire pour documentation
COMMENT ON COLUMN skills.whiteboard_data IS 'Stocke les données Excalidraw (éléments, appState, files) en JSON';
