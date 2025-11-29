# 🚀 Instructions de déploiement - Tableau Blanc

## Déploiement en 3 étapes

### Étape 1 : Migration de la base de données (2 min)

1. Ouvrez votre projet Supabase : https://supabase.com/dashboard
2. Allez dans **SQL Editor**
3. Créez une nouvelle requête
4. Copiez-collez le contenu de `migration_whiteboard.sql` :

```sql
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS whiteboard_data JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_skills_has_whiteboard ON skills(user_id) 
WHERE whiteboard_data IS NOT NULL;

COMMENT ON COLUMN skills.whiteboard_data IS 'Stocke les données Excalidraw (éléments, appState, files) en JSON';
```

5. Cliquez sur **Run** (ou Ctrl/Cmd + Enter)
6. Vérifiez que la migration s'est bien passée (message de succès)

### Étape 2 : Test local (5 min)

1. Ouvrez votre application en local
2. Connectez-vous avec votre compte
3. Cliquez sur le bouton "📋" d'un objectif
4. Le tableau blanc Excalidraw devrait s'ouvrir
5. Dessinez quelque chose (un rectangle, du texte, etc.)
6. Cliquez sur "💾 Sauvegarder"
7. Fermez le tableau blanc
8. Le bouton "📋" devrait maintenant être bleu
9. Rouvrez le tableau blanc → vos dessins sont toujours là ✅

### Étape 3 : Déploiement sur Vercel (2 min)

```bash
# Ajouter tous les fichiers modifiés
git add index.html script.js styles.css migration_whiteboard.sql

# Commit avec un message descriptif
git commit -m "feat: Add Excalidraw whiteboard for each goal

- Add whiteboard button to each skill item
- Integrate Excalidraw with React
- Add save functionality with visual feedback
- Add database migration for whiteboard_data column
- Add responsive design for mobile"

# Push vers votre repository
git push origin main
```

Vercel déploiera automatiquement les changements.

## ✅ Vérification post-déploiement

### Sur production :

1. **Ouvrez votre app** sur le domaine Vercel
2. **Testez le bouton "📋"** sur un objectif
3. **Dessinez quelque chose** et sauvegardez
4. **Rechargez la page** → les données doivent persister
5. **Testez sur mobile** → le tableau doit être plein écran

### En cas de problème :

#### Le tableau blanc ne s'ouvre pas
```javascript
// Ouvrez la console du navigateur (F12)
// Vérifiez les erreurs liées à :
- React (doit être chargé)
- Excalidraw (doit être chargé)
- Supabase (permissions RLS)
```

#### Les données ne se sauvegardent pas
```sql
-- Vérifiez dans Supabase SQL Editor :
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'skills' 
AND column_name = 'whiteboard_data';

-- Devrait retourner : whiteboard_data | jsonb
```

#### Erreur de permissions
```sql
-- Vérifiez les politiques RLS :
SELECT * FROM pg_policies WHERE tablename = 'skills';

-- Les politiques UPDATE doivent permettre la modification de whiteboard_data
```

## 🎉 C'est terminé !

Votre application dispose maintenant d'un tableau blanc Excalidraw pour chaque objectif.

### Fonctionnalités disponibles :
- ✅ Dessin à main levée
- ✅ Formes géométriques
- ✅ Texte et annotations
- ✅ Couleurs et styles
- ✅ Sauvegarde persistante
- ✅ Indicateur visuel de contenu
- ✅ Responsive mobile

### Prochaines améliorations possibles :
- Auto-save automatique
- Export en image
- Templates prédéfinis
- Collaboration en temps réel

---

**Besoin d'aide ?**
- Consultez `TEST_WHITEBOARD.md` pour les tests détaillés
- Consultez `WHITEBOARD_SETUP.md` pour la configuration
- Consultez `CHANGELOG_WHITEBOARD.md` pour les détails techniques
