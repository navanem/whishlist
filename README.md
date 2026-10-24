# 🎁 Wishlist — Liste au Père Noël & Wishlist Famille

[![Next.js 15](https://img.shields.io/badge/Next.js-15%2B-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-CSS%204-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Wishlist** est une application web moderne et élégante pour créer, gérer et partager la liste de souhaits de Noël et d'anniversaire de vos enfants avec toute la famille.  
> Conçue dans l'esprit **Apple Design** (verre dépoli, typographie SF Pro, retour tactile, animations fluides), elle intègre un **moteur de recherche direct en magasin** pour ajouter n'importe quel jouet en 1 clic sans avoir à chercher ni copier-coller d'URLs.

---

## ✨ Fonctionnalités phares

### 🎅 1. Mode « Lettre au Père Noël » & Mode Enfant
- Ambiance féerique façon **boîte aux lettres du Pôle Nord** (lueur d'ambiance de fête, cachet postal, animations fluides).
- Filtres rapides par enfant avec avatars personnalisés (🚀 *Léo*, 🦄 *Mia*...).
- **Préservation totale de la magie** : les enfants ne voient jamais si un cadeau a été réservé ou acheté par un proche.

### 🛍️ 2. Recherche directe en magasin (1 Clic)
- Moteur de recherche intégré interrogeant en direct les boutiques officielles :
  - 🧱 **Lego Store**
  - 📚 **Fnac**
  - 🧸 **Smyths Toys**
  - 🛍️ **Galaxus / Digitec**
  - 👑 **King Jouet**
  - 🚲 **Decathlon**
  - 📦 **Amazon**
  - 🎨 **Oxybul / IDKIDS**
- Affiche la **photo haute définition**, le **titre officiel**, le **magasin** et le **prix indicatif**.
- **Bouton « ✨ Ajouter » en 1 clic** directement sur la liste de l'enfant sans quitter l'app !
- Possibilité également de coller un lien URL ou de faire une saisie libre.

### 🔒 3. Espace Parents sécurisé (Code PIN iOS)
- Clavier numérique façon pavé PIN iOS avec retour haptique.
- Suivi secret du statut des cadeaux : **Idée** ➜ **Réservé** ➜ **Acheté** ➜ **Reçu / Emballé**.
- Tableau de bord budgétaire (dépenses totales, montants restants, récapitulatif par enfant).
- Gestion des enfants (nom, avatar, date de naissance, couleur).
- Gestion des événements (Noël 2026, Anniversaires...).
- Personnalisation du code PIN, de la devise (CHF, EUR, $) et du nom de famille.

### 💌 4. Espace Partage Famille (Anti-doublons)
- Lien de partage public sécurisé par token (ex: `/partage/notre-famille`).
- Permet aux grands-parents, oncles, tantes et amis de consulter la liste.
- Système de réservation **« 🎁 Je m'en occupe »** en 1 clic avec prénom du proche pour éviter d'acheter le même cadeau deux fois.
- Bouton de partage rapide sur **WhatsApp** et copie directe du lien.

### 💾 5. Zéro dépendance de base de données lourde & Sauvegarde 1-Clic
- Moteur de données JSON typé intégré avec persistance automatique.
- Aucun PostgreSQL, MySQL ou configuration complexe requis.
- Bouton d'**exportation** et d'**importation** de sauvegarde JSON en 1 clic dans l'espace parents.
- Sauvegarde et migration instantanées en copiant simplement le fichier `wishlist.json`.

### 🛡️ 6. Sécurité & Protection de la vie privée
- Protection anti-brute-force sur le code PIN Parents (blocage automatique de 15 minutes après 5 tentatives erronées).
- Sanitisation stricte des URLs produits (blocage des protocoles non sécurisés ou malveillants).
- Aucun cookie tiers ni tracker publicitaire.
- Toutes les données restent privées dans votre dossier local `data/`.
- Les réservations faites par la famille sont masquées aux enfants pour préserver l'effet de surprise de Noël.

---

## 🚀 Démarrage rapide avec Docker Compose

Le moyen le plus simple et rapide de déployer l'application :

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-nom/cadeaux.git
cd cadeaux

# 2. Lancer avec Docker Compose
docker compose up -d
```

L'application est immédiatement accessible sur **http://localhost:3000** !

---

## 🛠️ Installation manuelle pour développement

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

Pour générer le build de production :

```bash
npm run build
npm start
```

---

## ⚙️ Configuration & Variables d'environnement

Vous pouvez créer un fichier `.env` ou `.env.local` pour personnaliser le comportement (voir `.env.example`) :

| Variable | Description | Valeur par défaut |
|---|---|---|
| `PORT` | Port d'écoute du serveur | `3000` |
| `HOSTNAME` | Hôte d'écoute | `0.0.0.0` |
| `DATA_DIR` | Dossier où stocker les données | `/app/data` (Docker) ou `./data` |
| `FAMILY_NAME` | Nom de famille affiché par défaut | `Notre Famille` |
| `CURRENCY` | Devise utilisée | `CHF` (ou `EUR`, `USD`) |
| `PARENT_PIN` | Code PIN d'accès à l'espace parents | `1234` |
| `SHARE_TOKEN` | Token d'URL pour le lien famille | `notre-famille` |
| `NEXT_PUBLIC_APP_URL` | URL publique optionnelle de l'app | Détectée automatiquement |

---

## 📁 Structure du projet

```
├── data/                       # Stockage des données (wishlist.json)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── data/           # Récupération globale des listes & filtres
│   │   │   ├── gifts/          # Ajout, édition, suppression de cadeaux
│   │   │   ├── parent/manage/  # Gestion enfants, occasions, magasins
│   │   │   ├── reserve/        # Réservation de cadeaux par les proches
│   │   │   ├── scrape-url/     # Extraction automatique de métadonnées OpenGraph
│   │   │   └── search-products/# Recherche multi-magasins en temps réel
│   │   ├── partage/[token]/    # Page publique dédiée aux proches
│   │   ├── layout.tsx          # Racine Next.js avec métadonnées
│   │   └── page.tsx            # Accueil interactif (Mode Enfant & Parents)
│   ├── components/             # Composants Apple Glass
│   │   ├── AddGiftModal.tsx    # Modal de recherche & ajout de cadeaux
│   │   ├── GiftCard.tsx        # Carte cadeau avec badges & actions
│   │   ├── ParentDashboard.tsx # Panneau parents, budget & réglages
│   │   ├── PinModal.tsx        # Pavé numérique PIN iOS
│   │   ├── ReserveModal.tsx    # Modal de réservation pour la famille
│   │   └── ShareModal.tsx      # Partage lien & bouton WhatsApp
│   ├── lib/
│   │   └── db.ts               # Moteur de base de données JSON typé
│   └── types/
│       └── index.ts            # Définitions TypeScript
├── Dockerfile                  # Multi-stage build léger Node.js 20 Alpine
├── docker-compose.yml          # Déploiement en 1 commande
└── README.md
```

---

## 🛡️ Confidentialité & Sécurité

- Aucun cookie tiers ni tracker publicitaire.
- Toutes les données restent privées dans votre dossier `data/`.
- Les réservations faites par la famille sont masquées aux enfants pour préserver l'effet de surprise de Noël.

---

## 🎶 Crédits & Ambiance sonore

- Musique de fond de Noël : *Jingle Bells (Calm)* par **Kevin MacLeod** ([incompetech.com](https://incompetech.com)).
- Licence : Creative Commons Attribution 3.0 ([CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)).
- Le fichier audio peut être personnalisé ou désactivé à tout moment selon vos préférences.

---

## 📄 Licence

Ce projet est sous licence **MIT** — vous êtes libre de l'utiliser, le modifier et le déployer pour votre propre famille ou vos projets personnels !
