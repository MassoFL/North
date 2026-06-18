# Icônes du site LokedIn — à remplacer

Chaque fichier `.svg` de ce dossier est une **icône de référence** (l'emoji actuel) montrant
ce qui est utilisé aujourd'hui et **où**. Remplace chaque fichier par l'icône dessinée par
ton styliste **en gardant le même nom de fichier** (format carré conseillé : 128×128, fond transparent).

Le nom suit le schéma : `section__fonction.svg`.

| Fichier | Icône actuelle | Section | Rôle | Emplacement(s) dans le code |
|---|:---:|---|---|---|
| `onboarding-step1__welcome-rocket.svg` | 🚀 | Onboarding – écran 1 | Icône d'en-tête « Bienvenue » | `index.html:103` |
| `onboarding-step2__learning-books.svg` | 📚 | Onboarding – écran 2 | Icône d'en-tête « L'apprentissage » | `index.html:111` |
| `onboarding-step3__consistency-bolt.svg` | ⚡ | Onboarding – écran 3 | Icône d'en-tête « La consistance » | `index.html:119` |
| `onboarding-step4__how-it-works-target.svg` | 🎯 | Onboarding – écran 4 | Icône d'en-tête « Comment ça marche » | `index.html:127` |
| `personal-space__open-whiteboard.svg` | 📋 | Personal Space – carte objectif | Bouton ouvrir le tableau blanc d'un objectif | `script.js:885` |
| `whiteboard__save.svg` | 💾 | Tableau blanc | Bouton Sauvegarder | `index.html:290`, `script.js:1756`, `script.js:2096`, `script.js:2440` |
| `thoughts-card__view-count.svg` | 👁 | Thoughts – carte | Compteur de vues | `script.js:1992`, `script.js:2028` |
| `thoughts-card__date.svg` | 📅 | Thoughts – carte | Date de création | `script.js:1993`, `script.js:2029` |
| `thoughts-card__share-link.svg` | 🔗 | Thoughts – carte | Bouton Partager le lien | `script.js:1986`, `script.js:2019` |
| `thoughts-card__edit.svg` | ✏ | Thoughts – carte (Mes Thoughts) | Bouton Modifier | `script.js:2020` |
| `thoughts-card__delete.svg` | 🗑 | Thoughts – carte (Mes Thoughts) | Bouton Supprimer | `script.js:2021` |
| `thoughts-card__make-public.svg` | 🌍 | Thoughts – carte (Mes Thoughts) | Bouton/badge Rendre public | `script.js:2018`, `script.js:2026` |
| `thoughts-card__make-private.svg` | 🔒 | Thoughts – carte (Mes Thoughts) | Bouton/badge Rendre privé | `script.js:2018`, `script.js:2026` |
| `thoughts-viewer__read-only-badge.svg` | 👁 | Thoughts – visionneuse | Badge « Lecture seule » | `index.html:276` |
| `thoughts-share__copy-link.svg` | 📋 | Thoughts – modale de partage | Bouton Copier le lien | `script.js:2593` |
| `thoughts-prompt__shared-thought.svg` | 📖 | Écran de connexion (lien partagé) | Icône message « Thought partagé » | `script.js:275` |
| `auth__login.svg` | 🔐 | Authentification | Bouton Se connecter | `script.js:2689` |
| `hyppoproof-card__hypothesis.svg` | 💡 | Hyppoproof – carte hypothèse | Icône de l'hypothèse | `script.js:2782` |
| `hyppoproof-card__proof-count.svg` | 🔎 | Hyppoproof – carte hypothèse | Compteur de preuves | `script.js:2786`, `script.js:2894` |
| `hyppoproof-card__delete-hypothesis.svg` | 🗑 | Hyppoproof – carte hypothèse | Bouton Supprimer l'hypothèse | `script.js:2787` |
| `hyppoproof-proof__delete-proof.svg` | 🗑 | Hyppoproof – preuve | Bouton Supprimer la preuve | `script.js:2856` |
| `hyppoproof-proof__date.svg` | 📅 | Hyppoproof – preuve | Date de la preuve | `script.js:2855` |

## Notes
- Ces emojis apparaissent **aussi** dans des messages `alert()`/`console.log` (ex. ✅, ❌, 🧪) : ce ne sont **pas** des icônes d'interface, donc non inclus ici.
- Certaines icônes utilisent le même emoji dans des endroits différents (ex. 🗑 suppression, 📅 date, 👁 vues) : un fichier distinct par emplacement te permet de les remplacer indépendamment, ou de réutiliser le même dessin.
- Une fois les icônes prêtes, je pourrai brancher chaque image dans le code à la place de l'emoji correspondant.