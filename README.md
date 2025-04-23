# 📰 SephyLeaks – README

## 🎯 Objectif du projet
SephyLeaks est un site communautaire non commercial autour de Final Fantasy XIV, pensé comme une source libre et qualitative d’informations : guides, chroniques, astuces. L’objectif est d’offrir une expérience agréable à la fois pour les lecteurs et les contributeurs.

## ✅ Fonctionnalités actuellement en place

### 🎨 Front-end général
- Thème sombre esthétique avec une palette violet/argenté.
- Mise en page responsive (desktop / mobile).
- Logo dans l’en-tête (personnalisé et arrondi).
- Section "Héro" avec lien d’ancre fluide vers les articles.

### 📄 Page d’accueil (`index.html`)
- **À la une** : affiche automatiquement l’article le plus récent.
- **Derniers articles** : 4 articles récents exclus l'article vedette.
- **Filtres** : générés dynamiquement à partir des tags utilisés.
- **Cartes d'articles** : uniformisées avec un ratio 16:9 commun à la bannière article.
- **Sidebar** : section "Contribution" et "Guides" statiques.

### 📑 Page article (`article.html`)
- Affichage d’un article unique avec :
  - Bannière 16:9 harmonisée avec les cartes.
  - Contenu HTML enrichi, styles et blocs spéciaux (`tip-box`, `carousel`, etc).
  - Bloc auteur dynamique via `authors.json`.
  - Section commentaires placeholder (future fonctionnalité).

### 🛠️ CMS éditeur (`editor.html`)
- Interface en local avec preview live.
- Outils de formatage : police, couleurs, citations, encadrés, images, carrousels…
- **Sélecteur de tags** unifié avec ceux de l’index.
- Ajout du champ Résumé pour les cartes.
- Bouton Export JSON prêt pour ajout manuel dans `articles.json`.
- Sauvegarde du brouillon dans `localStorage`.

## 🔄 Roadmap en cours

### 🧱 Étape 7 – Responsive & Polish CSS
- Repasser sur chaque composant pour affiner les espacements et le responsive mobile.
- Uniformiser davantage les tailles de polices et paddings dans toutes les zones.

### 🔐 Étapes suivantes prévues
- **Système de comptes** (visiteur, auteur, admin).
- **Interface d’administration** pour gérer les articles (publication, suppression, modification).
- **Connexion** avec page dédiée.
- **Ajout d’un module de commentaires** (lié aux comptes).
- **Possibilité de proposer un article via formulaire côté public**.

## 🧪 Test et debug
- Chargement dynamique des articles vérifié ✅
- Filtrage des tags fonctionnel ✅
- Affichage des dates FR/ISO géré ✅
- Derniers articles : exclusion correcte de l'article vedette ✅

## 🖼 Ratio recommandé pour bannières
> **Ratio :** 16:9 (ex. 1600x900, 1280x720, etc.)
>
> Utilisé pour :
> - les cartes d’articles sur l’index
> - les bannières d’articles détaillés
> - l’article "À la une"

## 📁 Organisation des fichiers
```
📁 assets/
├── icons/ (favicons)
├── icotheque/ (icônes custom)
├── logoSL.webp (logo officiel SephyLeaks)

📁 css/
├── style.css (global)
├── article.css (page article uniquement)
├── editor.css (CMS uniquement)

📁 js/
├── main.js (chargement index)
├── article.js (chargement page article)
├── admin/editor.js (éditeur CMS)

📁 data/
├── articles.json
├── authors.json
```

---
