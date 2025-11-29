# ✅ Checklist de vérification rapide

## Avant de déployer

### Fichiers modifiés
- [x] `index.html` - Scripts React/Excalidraw + modal whiteboard
- [x] `script.js` - Fonctions openWhiteboard, saveWhiteboard, closeWhiteboard
- [x] `styles.css` - Styles pour .whiteboard-modal, .whiteboard-btn

### Nouveaux fichiers
- [x] `migration_whiteboard.sql` - Migration DB
- [x] `WHITEBOARD_SETUP.md` - Guide de configuration
- [x] `TEST_WHITEBOARD.md` - Procédure de test
- [x] `CHANGELOG_WHITEBOARD.md` - Détails des modifications
- [x] `INTEGRATION_SUMMARY.md` - Résumé de l'intégration
- [x] `DEPLOY_INSTRUCTIONS.md` - Instructions de déploiement

### Vérifications techniques
- [x] Pas d'erreurs de syntaxe JavaScript
- [x] Pas d'erreurs de syntaxe CSS
- [x] HTML valide
- [x] Migration SQL prête

## Checklist de déploiement

### 1. Base de données
- [ ] Ouvrir Supabase Dashboard
- [ ] Aller dans SQL Editor
- [ ] Exécuter `migration_whiteboard.sql`
- [ ] Vérifier que la colonne `whiteboard_data` existe

### 2. Test local
- [ ] Ouvrir l'application
- [ ] Se connecter
- [ ] Voir le bouton "📋" sur chaque objectif
- [ ] Cliquer sur "📋"
- [ ] Le modal Excalidraw s'ouvre
- [ ] Dessiner quelque chose
- [ ] Cliquer sur "💾 Sauvegarder"
- [ ] Voir "✓ Sauvegardé"
- [ ] Fermer le modal
- [ ] Le bouton "📋" est maintenant bleu
- [ ] Rouvrir le modal
- [ ] Les dessins sont toujours là

### 3. Git & Déploiement
- [ ] `git add .`
- [ ] `git commit -m "feat: Add Excalidraw whiteboard"`
- [ ] `git push origin main`
- [ ] Attendre le déploiement Vercel

### 4. Test en production
- [ ] Ouvrir l'app sur le domaine Vercel
- [ ] Tester le bouton "📋"
- [ ] Tester la sauvegarde
- [ ] Tester la persistance
- [ ] Tester sur mobile

## Commandes rapides

```bash
# Vérifier les fichiers modifiés
git status

# Voir les changements
git diff index.html
git diff script.js
git diff styles.css

# Ajouter et commiter
git add index.html script.js styles.css migration_whiteboard.sql
git commit -m "feat: Add Excalidraw whiteboard for each goal"
git push

# Vérifier le déploiement
# Aller sur https://vercel.com/dashboard
```

## Tests de régression

Vérifier que les fonctionnalités existantes fonctionnent toujours :

- [ ] Ajout d'un nouvel objectif
- [ ] Incrémentation des heures
- [ ] Modification d'un objectif
- [ ] Suppression d'un objectif
- [ ] Archivage d'un objectif terminé
- [ ] Drag & drop des objectifs
- [ ] Milestones des projets
- [ ] Objectifs quantifiés
- [ ] Déconnexion/reconnexion

## En cas de problème

### Rollback rapide
```bash
git revert HEAD
git push
```

### Debug
```javascript
// Dans la console du navigateur
console.log(window.ExcalidrawLib); // Doit exister
console.log(React); // Doit exister
console.log(ReactDOM); // Doit exister
```

### Support
- Voir `TEST_WHITEBOARD.md` section "Dépannage"
- Vérifier la console du navigateur (F12)
- Vérifier les logs Supabase

---

**Status actuel** : ✅ Prêt pour le déploiement
**Dernière vérification** : 29 Nov 2024
