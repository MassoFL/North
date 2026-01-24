# 🚀 Déploiement - Maps Partagés

## Guide de déploiement en 3 étapes

### Étape 1 : Migration de la base de données (2 minutes)

#### Option A : Via l'interface Supabase (Recommandé)

1. Ouvrez votre projet Supabase : https://supabase.com/dashboard
2. Allez dans **SQL Editor** (icône 📝 dans le menu)
3. Cliquez sur **New Query**
4. Copiez tout le contenu du fichier `migration_shared_maps.sql`
5. Collez dans l'éditeur
6. Cliquez sur **Run** (ou Ctrl/Cmd + Enter)
7. Vérifiez le message de succès ✅

#### Option B : Via CLI Supabase

```bash
# Si vous avez Supabase CLI installé
supabase db push migration_shared_maps.sql
```

#### Vérification

Exécutez cette requête pour vérifier que tout fonctionne :

```sql
-- Devrait retourner 0 (table vide mais existante)
SELECT COUNT(*) FROM shared_maps;

-- Devrait lister les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'shared_maps';
```

### Étape 2 : Test en local (5 minutes)

#### Démarrer le serveur local

```bash
# Si pas encore démarré
cd North
node server.js
```

Ou utilisez Python :

```bash
cd North
python3 -m http.server 8000
```

#### Tests à effectuer

Suivez le guide : `QUICK_TEST_SHARED_MAPS.md`

Checklist rapide :
- [ ] Le bouton "Maps Partagés" apparaît dans le menu
- [ ] Vous pouvez créer une map
- [ ] La map s'affiche dans "Mes Maps"
- [ ] La map s'affiche dans "Parcourir"
- [ ] Vous pouvez modifier votre map
- [ ] Le compteur de vues fonctionne

### Étape 3 : Déploiement en production (2 minutes)

#### Via Git (Vercel auto-deploy)

```bash
# Ajouter tous les fichiers
git add .

# Commit avec message descriptif
git commit -m "feat: Add Shared Maps feature with Excalidraw

- Add shared_maps table with RLS policies
- Add UI for browsing and creating maps
- Add read-only mode for non-owners
- Add view counter and statistics
- Add comprehensive documentation"

# Push vers la branche principale
git push origin main
```

Vercel détectera automatiquement les changements et déploiera.

#### Vérification du déploiement

1. Attendez que Vercel termine le build (~2 min)
2. Ouvrez votre app en production
3. Testez la création d'une map
4. Vérifiez que tout fonctionne

## Rollback (en cas de problème)

### Annuler le déploiement

```bash
# Revenir au commit précédent
git revert HEAD
git push origin main
```

### Supprimer la table (si nécessaire)

```sql
-- ⚠️ ATTENTION : Cela supprimera toutes les données
DROP TABLE IF EXISTS shared_maps CASCADE;
```

## Configuration avancée

### Variables d'environnement

Aucune variable supplémentaire n'est nécessaire. La fonctionnalité utilise la même configuration Supabase existante.

### Permissions Supabase

Vérifiez que les politiques RLS sont actives :

```sql
-- Devrait retourner 't' (true)
SELECT relrowsecurity 
FROM pg_class 
WHERE relname = 'shared_maps';
```

### Index de performance

Les index sont créés automatiquement par la migration. Vérifiez :

```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'shared_maps';
```

## Monitoring

### Requêtes utiles pour le monitoring

#### Nombre total de maps
```sql
SELECT COUNT(*) as total_maps FROM shared_maps;
```

#### Maps les plus vues
```sql
SELECT title, view_count, owner_id 
FROM shared_maps 
ORDER BY view_count DESC 
LIMIT 10;
```

#### Maps créées aujourd'hui
```sql
SELECT COUNT(*) as maps_today 
FROM shared_maps 
WHERE created_at::date = CURRENT_DATE;
```

#### Utilisateurs les plus actifs
```sql
SELECT owner_id, COUNT(*) as map_count 
FROM shared_maps 
GROUP BY owner_id 
ORDER BY map_count DESC 
LIMIT 10;
```

### Logs à surveiller

Dans Supabase Dashboard → Logs :
- Erreurs de permission (RLS)
- Requêtes lentes
- Erreurs d'insertion

## Performance

### Optimisations recommandées

#### Si vous avez beaucoup de maps (>1000)

Ajoutez la pagination dans le code :

```javascript
// Dans loadSharedMaps()
const { data, error } = await supabaseClient
    .from('shared_maps')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(0, 49); // Limite à 50 maps
```

#### Si les données Excalidraw sont volumineuses

Considérez le stockage des images dans Supabase Storage :

```javascript
// Future amélioration
// Stocker les images séparément
// Garder seulement les références dans excalidraw_data
```

## Sécurité

### Checklist de sécurité

- [x] RLS activé sur la table
- [x] Politiques de lecture/écriture configurées
- [x] Échappement HTML dans l'affichage
- [x] Validation des permissions côté serveur
- [x] Authentification requise pour créer

### Audit de sécurité

Testez avec différents comptes :

1. Créez une map avec le compte A
2. Connectez-vous avec le compte B
3. Vérifiez que B ne peut pas modifier la map de A
4. Vérifiez que B peut voir la map si elle est publique

## Troubleshooting

### Problème : "Table does not exist"

**Solution** : La migration n'a pas été exécutée
```sql
-- Exécutez migration_shared_maps.sql
```

### Problème : "Permission denied"

**Solution** : Vérifiez les politiques RLS
```sql
-- Listez les politiques
SELECT * FROM pg_policies WHERE tablename = 'shared_maps';
```

### Problème : "Excalidraw non chargé"

**Solution** : Vérifiez que les scripts sont chargés dans index.html
```html
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
```

### Problème : Les maps ne s'affichent pas

**Solution** : Vérifiez la console du navigateur (F12)
- Erreurs JavaScript ?
- Erreurs réseau ?
- Erreurs Supabase ?

## Support

### Ressources

- 📚 Documentation complète : `SHARED_MAPS_README.md`
- ✅ Guide de test : `QUICK_TEST_SHARED_MAPS.md`
- 📝 Changelog : `CHANGELOG_SHARED_MAPS.md`
- 🗄️ Migration SQL : `migration_shared_maps.sql`

### Contacts

- Issues GitHub : [Créer une issue]
- Documentation Supabase : https://supabase.com/docs
- Documentation Excalidraw : https://docs.excalidraw.com

## Checklist finale

Avant de considérer le déploiement comme terminé :

- [ ] Migration SQL exécutée avec succès
- [ ] Tests locaux passés
- [ ] Code déployé sur Vercel
- [ ] Tests en production passés
- [ ] Au moins une map de démonstration créée
- [ ] Documentation lue par l'équipe
- [ ] Monitoring configuré
- [ ] Backup de la base de données effectué

## Prochaines étapes

Après le déploiement :

1. 📢 Annoncez la nouvelle fonctionnalité aux utilisateurs
2. 📊 Surveillez les métriques d'utilisation
3. 🐛 Collectez les retours et bugs éventuels
4. 🚀 Planifiez les améliorations futures

---

**Temps total estimé** : 10 minutes  
**Difficulté** : ⭐⭐ (Facile)  
**Prérequis** : Accès Supabase + Git configuré  
**Statut** : ✅ Prêt pour la production

Bon déploiement ! 🚀
