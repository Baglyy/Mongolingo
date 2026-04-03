# Mongolingo

Application web permettant d'apprendre les requêtes MongoDB à travers un système de quiz inspiré de Duolingo. L'application contient plus de 45 questions de niveaux variés (débutant, intermédiaire, avancé) avec explications et exécution des requêtes sur une base de données réelle.

---

## Prérequis

- Node.js (v18+)
- MongoDB

---

## Installation

### Backend

```bash
cd mongolingo-back
npm install
```

### Frontend

```bash
cd mongolingo-front
npm install
```

---

## Lancement

### Terminal 1 - Backend

```bash
cd mongolingo-back
node init.js
node server.js
```

> **Attention** : `node init.js` vide toutes les collections pour initialiser les données de base.

### Terminal 2 - Frontend

```bash
cd mongolingo-front
npm run dev
```

---

## Accès

Ouvrir http://localhost:5173 dans votre navigateur.

---

## Fichiers

| Dossier | Description |
|---------|-------------|
| `mongolingo-back/saves` | Sauvegardes de progression |
| `mongolingo-back/data` | Données de démonstration |

---

## Démo

[Vidéo de démonstration (2min max)](https://www.youtube.com/watch?v=VIDEO_ID_ICI)
