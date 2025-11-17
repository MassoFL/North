-- Migration pour mettre à jour la table skills existante
-- Exécutez ceci si vous avez déjà créé la table skills

-- Supprimer l'ancienne contrainte de type si elle existe
ALTER TABLE skills DROP CONSTRAINT IF EXISTS skills_type_check;

-- Ajouter les nouveaux champs
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'continuous',
ADD COLUMN IF NOT EXISTS milestones JSONB,
ADD COLUMN IF NOT EXISTS target INTEGER,
ADD COLUMN IF NOT EXISTS target_unit VARCHAR(50);

-- Supprimer la colonne deadline si elle existe
ALTER TABLE skills DROP COLUMN IF EXISTS deadline;

-- Ajouter la nouvelle contrainte de type
ALTER TABLE skills ADD CONSTRAINT skills_type_check CHECK (type IN ('continuous', 'project', 'target'));

-- Mettre à jour les enregistrements existants
UPDATE skills SET type = 'continuous' WHERE type IS NULL OR type = 'deadline';