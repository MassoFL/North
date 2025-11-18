-- Migration pour ajouter le drag and drop
-- Ajouter le champ order_index pour gérer l'ordre des skills

ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Mettre à jour les enregistrements existants avec un ordre basé sur la date de création
UPDATE skills 
SET order_index = (
    SELECT ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at)
    FROM skills s2 
    WHERE s2.id = skills.id
);

-- Index pour améliorer les performances de tri
CREATE INDEX IF NOT EXISTS idx_skills_user_order ON skills(user_id, order_index);