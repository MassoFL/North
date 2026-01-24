# ✅ Test Rapide - Maps Partagés

## Checklist de test (5 minutes)

### 1️⃣ Migration SQL (2 min)

- [ ] Ouvrir Supabase Dashboard
- [ ] Aller dans SQL Editor
- [ ] Copier/coller le contenu de `migration_shared_maps.sql`
- [ ] Exécuter
- [ ] Vérifier : `SELECT COUNT(*) FROM shared_maps;` → devrait fonctionner

### 2️⃣ Interface (1 min)

- [ ] Recharger l'application (http://localhost:8000)
- [ ] Se connecter
- [ ] Cliquer sur le menu (⋯)
- [ ] Vérifier que "🗺️ Maps Partagés" apparaît

### 3️⃣ Créer une map (2 min)

- [ ] Cliquer sur "🗺️ Maps Partagés"
- [ ] Aller dans l'onglet "📝 Mes Maps"
- [ ] Cliquer sur "+ Créer une nouvelle map"
- [ ] Remplir :
  - Titre : "Test Map"
  - Description : "Ma première map"
  - Cocher "Public"
- [ ] Cliquer "Continuer vers l'éditeur"
- [ ] Dessiner quelque chose (rectangle, texte, etc.)
- [ ] Cliquer "💾 Sauvegarder la map"
- [ ] Vérifier que la map apparaît dans "Mes Maps"

### 4️⃣ Visualiser (30 sec)

- [ ] Aller dans l'onglet "📚 Parcourir"
- [ ] Vérifier que votre map apparaît
- [ ] Cliquer dessus
- [ ] Vérifier que le contenu s'affiche

### 5️⃣ Test lecture seule (optionnel)

Pour tester la lecture seule, vous auriez besoin d'un deuxième compte :

- [ ] Se déconnecter
- [ ] Créer un nouveau compte
- [ ] Aller dans "Maps Partagés" → "Parcourir"
- [ ] Cliquer sur la map créée précédemment
- [ ] Vérifier le badge "👁️ Lecture seule"
- [ ] Vérifier qu'on ne peut pas modifier

## Résultats attendus

### ✅ Succès si :

- La migration SQL s'exécute sans erreur
- Le bouton "Maps Partagés" apparaît dans le menu
- Vous pouvez créer une map
- La map apparaît dans "Mes Maps" et "Parcourir"
- Vous pouvez visualiser la map
- Le compteur de vues s'incrémente

### ❌ Problèmes possibles :

**"Table shared_maps does not exist"**
→ La migration SQL n'a pas été exécutée

**"Permission denied"**
→ Vérifier les politiques RLS dans Supabase

**"Excalidraw non chargé"**
→ Recharger la page (F5)

**La map ne s'affiche pas**
→ Vérifier la console (F12) pour les erreurs

## Commandes SQL utiles

### Vérifier les maps créées
```sql
SELECT id, title, owner_id, is_public, view_count, created_at 
FROM shared_maps 
ORDER BY created_at DESC;
```

### Voir toutes les maps d'un utilisateur
```sql
SELECT * FROM shared_maps 
WHERE owner_id = 'YOUR_USER_ID';
```

### Réinitialiser les compteurs de vues
```sql
UPDATE shared_maps SET view_count = 0;
```

### Supprimer toutes les maps de test
```sql
DELETE FROM shared_maps WHERE title LIKE '%Test%';
```

## Prochaines étapes

Une fois les tests réussis :

1. ✅ Créer quelques maps de démonstration
2. ✅ Tester sur mobile
3. ✅ Déployer sur Vercel
4. ✅ Partager avec les utilisateurs

---

**Temps estimé** : 5 minutes  
**Prérequis** : Migration SQL exécutée  
**Statut** : Prêt à tester
