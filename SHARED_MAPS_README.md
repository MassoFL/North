# 🗺️ Maps Partagés - Documentation

## Vue d'ensemble

La fonctionnalité "Maps Partagés" permet aux utilisateurs de créer et partager des tableaux blancs Excalidraw. Seul le propriétaire peut modifier une map, les autres utilisateurs peuvent uniquement la consulter en lecture seule.

## Fonctionnalités

### Pour tous les utilisateurs
- 📚 **Parcourir** les maps publiques créées par la communauté
- 👁️ **Visualiser** les maps en lecture seule
- 📊 **Voir les statistiques** (nombre de vues, date de création)

### Pour les propriétaires
- ➕ **Créer** de nouvelles maps partagées
- ✏️ **Modifier** leurs propres maps
- 🗑️ **Supprimer** leurs maps
- 🌍 **Choisir** la visibilité (public/privé)

## Installation

### 1. Migration de la base de données

Exécutez le fichier `migration_shared_maps.sql` dans votre console SQL Supabase :

```bash
# Ouvrez Supabase Dashboard → SQL Editor
# Copiez et exécutez le contenu de migration_shared_maps.sql
```

Ou directement :

```sql
-- Voir le fichier migration_shared_maps.sql pour le code complet
```

### 2. Vérification

Vérifiez que la table a été créée :

```sql
SELECT * FROM shared_maps LIMIT 1;
```

### 3. Déploiement

```bash
git add .
git commit -m "feat: Add Shared Maps feature"
git push origin main
```

Vercel déploiera automatiquement les changements.

## Utilisation

### Accéder aux Maps Partagés

1. Connectez-vous à l'application
2. Cliquez sur le menu utilisateur (⋯)
3. Sélectionnez "🗺️ Maps Partagés"

### Créer une Map

1. Dans l'onglet "📝 Mes Maps"
2. Cliquez sur "+ Créer une nouvelle map"
3. Remplissez :
   - **Titre** (obligatoire)
   - **Description** (optionnelle)
   - **Visibilité** (public/privé)
4. Cliquez sur "Continuer vers l'éditeur"
5. Créez votre contenu avec Excalidraw
6. Cliquez sur "💾 Sauvegarder la map"

### Modifier une Map

1. Dans "📝 Mes Maps"
2. Cliquez sur l'icône ✏️ sur votre map
3. Modifiez le contenu
4. Cliquez sur "💾 Mettre à jour"

### Visualiser une Map

1. Dans l'onglet "📚 Parcourir"
2. Cliquez sur une map
3. La map s'ouvre en lecture seule (si vous n'êtes pas le propriétaire)

## Architecture Technique

### Base de données

**Table : `shared_maps`**

| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGSERIAL | Identifiant unique |
| title | VARCHAR(200) | Titre de la map |
| description | TEXT | Description optionnelle |
| excalidraw_data | JSONB | Données Excalidraw |
| owner_id | UUID | ID du propriétaire |
| is_public | BOOLEAN | Visibilité publique |
| view_count | INTEGER | Nombre de vues |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de modification |

### Politiques RLS (Row Level Security)

- ✅ Tout le monde peut voir les maps publiques
- ✅ Le propriétaire peut tout faire sur ses maps
- ❌ Les autres ne peuvent pas modifier les maps

### Fichiers modifiés

```
✏️  index.html                    (+80 lignes)  - Modals et interface
✏️  script.js                     (+350 lignes) - Logique métier
✏️  styles.css                    (+200 lignes) - Styles
➕  migration_shared_maps.sql                   - Migration DB
➕  SHARED_MAPS_README.md                       - Documentation
```

## Sécurité

### Protection des données

1. **RLS activé** : Seul le propriétaire peut modifier ses maps
2. **Validation côté serveur** : Supabase vérifie les permissions
3. **Échappement HTML** : Protection contre XSS
4. **Authentification requise** : Seuls les utilisateurs connectés peuvent créer

### Permissions

```sql
-- Lecture : Tout le monde (maps publiques)
-- Écriture : Propriétaire uniquement
-- Suppression : Propriétaire uniquement
```

## Performance

### Optimisations

- **Index sur owner_id** : Requêtes rapides par utilisateur
- **Index sur is_public** : Filtrage efficace des maps publiques
- **Index sur created_at** : Tri chronologique optimisé

### Compteur de vues

Fonction SQL optimisée pour incrémenter les vues :

```sql
CREATE OR REPLACE FUNCTION increment_map_view_count(map_id BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE shared_maps 
    SET view_count = view_count + 1 
    WHERE id = map_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Améliorations futures

### Fonctionnalités prévues

- 🔍 **Recherche** de maps par titre/description
- 🏷️ **Tags** pour catégoriser les maps
- ⭐ **Favoris** pour sauvegarder les maps préférées
- 💬 **Commentaires** sur les maps
- 📤 **Export** en PNG/SVG
- 🔗 **Partage** par lien direct
- 📊 **Statistiques** détaillées pour les créateurs
- 🎨 **Templates** prédéfinis

### Améliorations techniques

- ⚡ **Pagination** pour les grandes listes
- 🔄 **Mise à jour en temps réel** avec Supabase Realtime
- 💾 **Sauvegarde automatique** pendant l'édition
- 📱 **Optimisation mobile** améliorée

## Dépannage

### La map ne se charge pas

1. Vérifiez la console (F12)
2. Assurez-vous que Excalidraw est chargé
3. Vérifiez votre connexion internet

### Erreur de permission

1. Vérifiez que vous êtes connecté
2. Assurez-vous d'être le propriétaire pour modifier
3. Vérifiez les politiques RLS dans Supabase

### Les maps ne s'affichent pas

1. Vérifiez que la migration SQL est exécutée
2. Vérifiez les permissions RLS
3. Regardez les logs Supabase

## Support

Pour toute question ou problème :

1. Vérifiez cette documentation
2. Consultez les logs de la console (F12)
3. Vérifiez les logs Supabase
4. Contactez le support

---

**Version** : 1.0  
**Date** : Janvier 2025  
**Statut** : ✅ Prêt pour la production
