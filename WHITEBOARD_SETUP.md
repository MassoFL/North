# Configuration du Tableau Blanc Excalidraw

## Migration de la base de données

Pour activer la fonctionnalité de tableau blanc, vous devez exécuter la migration SQL suivante dans votre console Supabase :

1. Allez dans votre projet Supabase
2. Ouvrez l'éditeur SQL
3. Exécutez le contenu du fichier `migration_whiteboard.sql`

```sql
-- Migration pour ajouter le whiteboard Excalidraw à chaque skill
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS whiteboard_data JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_skills_has_whiteboard ON skills(user_id) 
WHERE whiteboard_data IS NOT NULL;
```

## Fonctionnalités

### Tableau blanc par objectif
- Chaque objectif/tâche dispose maintenant d'un bouton "📋" pour ouvrir son tableau blanc
- Le bouton devient bleu quand le tableau contient du contenu
- Interface Excalidraw complète avec :
  - Dessin à main levée
  - Formes géométriques (rectangles, cercles, flèches, etc.)
  - Texte
  - Couleurs et styles
  - Gomme
  - Sélection et déplacement d'éléments

### Sauvegarde
- Bouton "💾 Sauvegarder" dans l'en-tête du tableau blanc
- Les données sont stockées en JSON dans Supabase
- Indicateur visuel lors de la sauvegarde

### Utilisation
1. Cliquez sur le bouton "📋" d'un objectif
2. Dessinez, écrivez, créez vos schémas
3. Cliquez sur "💾 Sauvegarder" pour enregistrer
4. Fermez avec le bouton "×"

## Structure des données

Le champ `whiteboard_data` stocke un objet JSON contenant :
- `elements` : Tous les éléments dessinés (formes, textes, etc.)
- `appState` : État de l'application (couleurs, styles, etc.)
- `files` : Images et fichiers intégrés

## Responsive
- Desktop : Modal 95vw × 95vh
- Mobile : Plein écran pour une meilleure expérience de dessin
