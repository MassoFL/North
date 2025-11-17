-- Migration pour ajouter les nouveaux champs à la table existante
-- Exécutez ceci si vous avez déjà créé la table skills

ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'continuous' CHECK (type IN ('continuous', 'deadline', 'target')),
ADD COLUMN IF NOT EXISTS deadline DATE,
ADD COLUMN IF NOT EXISTS target INTEGER,
ADD COLUMN IF NOT EXISTS target_unit VARCHAR(50);

-- Mettre à jour les enregistrements existants
UPDATE skills SET type = 'continuous' WHERE type IS NULL;