-- Migration pour ajouter l'archivage des tâches terminées
-- Ajouter le champ archived pour marquer les tâches archivées

ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Ajouter un index pour améliorer les performances des requêtes d'archivage
CREATE INDEX IF NOT EXISTS idx_skills_archived ON skills(user_id, archived);

-- Optionnel : Archiver automatiquement les tâches terminées existantes
-- (décommente si tu veux archiver automatiquement les tâches déjà terminées)
/*
UPDATE skills 
SET archived = TRUE 
WHERE (
    (type = 'target' AND hours >= target) OR
    (type = 'project' AND milestones IS NOT NULL AND 
     NOT EXISTS (
         SELECT 1 FROM jsonb_array_elements(milestones) AS milestone
         WHERE (milestone->>'completed')::boolean = false
     ))
);
*/