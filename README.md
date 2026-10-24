<div align="center">

  <img src="public/logo.svg" alt="Wishlist Logo" width="120" height="120" />

  # 🎁 Wishlist

  <p><strong>L'application web moderne, féerique et auto-hébergée pour créer et partager la liste de souhaits de Noël et d'anniversaire de vos enfants en toute simplicité.</strong></p>

  <p>
    <a href="#-fonctionnalités-phares">Fonctionnalités</a> •
    <a href="#-déploiement-rapide-docker">Déploiement Docker</a> •
    <a href="#-auto-hébergement--nas">Auto-Hébergement</a> •
    <a href="#️-configuration">Configuration</a> •
    <a href="#-sauvegarde--restauration">Sauvegardes</a> •
    <a href="#-sécurité--vie-privée">Sécurité</a> •
    <a href="#-contribuer">Contribuer</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15%2B-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Ready" />
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License MIT" />
  </p>

</div>

---

## 🌟 Pourquoi Wishlist ?

Chaque fin d'année ou anniversaire apporte le même casse-tête : les grands-parents demandent des idées, les parrains et marraines achètent les mêmes cadeaux en double, et les enfants risquent de découvrir leurs surprises à l'avance.

**Wishlist** a été conçue pour résoudre ce problème avec élégance :

- 🧙 **La magie de Noël préservée** : Les enfants parcourent leur belle lettre festive sans **jamais** voir ce qui a été réservé ou acheté par les proches.
- 🛍️ **Recherche directe en magasin** : Plus besoin d'ouvrir 15 onglets pour copier des liens. Tapez *« Lego X-Wing »* ou *« Peluche Licorne »* et ajoutez le jouet avec sa photo officielle en **1 clic**.
- 🤝 **Partage familial anti-doublons** : Un simple lien public sécurisé permet aux proches d'indiquer discrètement *« Je m'en occupe »* sans créer de compte ni installer d'application.
- 🏡 **100% Souverain & Privé** : Zéro cloud externe, zéro compte tiers, zéro publicité. Vos données restent chez vous dans un simple fichier JSON.

---

## ✨ Fonctionnalités phares

### 🎅 1. Mode « Lettre au Père Noël » & Expérience Enfant
- Design chaleureux et féerique façon **papier à lettres artisanal** et typographie éditoriale soignée.
- Sélecteur rapide par enfant avec avatars personnalisés (🚀 *Léo*, 🦄 *Mia*...).
- Cartes cadeaux épurées avec indicateur discret de coup de cœur ❤️ et prix indicatif.
- Ambiance sonore douce (*Jingle Bells Calm* acoustique) activable d'un clic dans l'en-tête.

### 🛍️ 2. Moteur de recherche direct en magasin (1 Clic)
- Moteur de recherche intégré interrogeant en direct les boutiques partenaires :
  - 🧱 **Lego Store**
  - 📚 **Fnac**
  - 🧸 **Smyths Toys**
  - 🇨🇭 **Galaxus / Digitec**
  - 👑 **King Jouet**
  - 🎨 **Oxybul / IDKIDS**
  - 🚲 **Decathlon**
  - 📦 **Amazon**
- Importe automatiquement l'image haute définition, le titre officiel, le magasin et le prix.
- **Saisie libre & scraping d'URL** également pris en charge (collez un lien pour extraire la photo et le titre).

### 🔒 3. Espace Parents protégé & Suivi budgétaire
- Clavier numérique inspiré du pavé PIN iOS avec animations fluides.
- **Protection anti-brute-force intégrée** : verrouillage automatique de 15 minutes après 5 tentatives erronées pour bloquer toute tentative d'intrusion.
- Suivi secret du cycle de vie des cadeaux : **Idée** ➜ **Réservé** ➜ **Acheté** ➜ **Reçu / Emballé**.
- Tableau de bord financier : budget total estimé, total déjà dépensé, et reste à charge.
- Gestion complète des enfants, des occasions (Noël, Anniversaires...) et des magasins.

### 💌 4. Espace Partage Famille (Anti-doublons)
- Lien public dédié protégé par un jeton d'accès (ex. `/partage/notre-famille`).
- Permet aux proches de réserver un cadeau en saisissant simplement leur prénom et un mot doux facultatif.
- Bouton de partage instantané sur **WhatsApp**, par SMS ou copie directe dans le presse-papier.
- Annulation possible de réservation en cas de changement d'avis.

### 🌍 5. Packs régionaux & Devises
- Sélecteur de devises souple : `CHF`, `EUR (€)`, `USD ($)`, `CAD ($)`, `GBP (£)`.
- Packs de magasins préconfigurés applicables en 1 clic dans l'Espace Parents :
  - 🇫🇷 **Pack France** : Fnac, Amazon FR, Lego, Smyths France, King Jouet, Oxybul, Cultura, Decathlon.
  - 🇨🇭 **Pack Suisse** : Galaxus, Fnac Suisse, Lego CH, King Jouet CH, Smyths CH, Decathlon CH, Amazon.
  - 🌍 **Pack International (EN)** : Amazon US, Lego US, Target, Walmart, Barnes & Noble, Best Buy.

### 💾 6. Base de données zéro-maintenance & Sauvegardes 1-Clic
- Moteur de données JSON typé haute performance avec persistance atomique sur disque.
- Aucun moteur PostgreSQL, MySQL ou SQLite natif à compiler.
- Bouton d'**exportation** (`wishlist-backup.json`) et d'**importation** directe depuis l'interface parents.
- Migration de serveur instantanée en déplaçant un seul fichier.

---

## 🚀 Déploiement rapide (Docker)

### Avec Docker Compose (Recommandé)

1. Créez un dossier pour votre projet et téléchargez le fichier `docker-compose.yml` :

```bash
mkdir -p wishlist && cd wishlist
curl -sO https://raw.githubusercontent.com/votre-nom/wishlist/main/docker-compose.yml
```

2. Lancez le conteneur en arrière-plan :

```bash
docker compose up -d
```

3. Rendez-vous sur **`http://localhost:3000`** (ou l'adresse IP de votre machine) !

#### Exemple de `docker-compose.yml`

```yaml
version: "3.8"

services:
  wishlist:
    image: ghcr.io/votre-nom/wishlist:latest
    container_name: wishlist
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
      - DATA_DIR=/app/data
      - FAMILY_NAME="Notre Famille"
      - CURRENCY=CHF
      - PARENT_PIN=1234
      - SHARE_TOKEN=notre-famille
    volumes:
      - ./data:/app/data
```

---

## 🏡 Auto-Hébergement & NAS

### 🐳 Synology NAS (Container Manager)
1. Ouvrez **Container Manager** sur votre Synology DSM.
2. Allez dans **Projet** > **Créer**.
3. Nommez le projet `wishlist`, choisissez un chemin sur votre volume (ex. `/docker/wishlist`), et collez le contenu du `docker-compose.yml` ci-dessus.
4. Mappez le dossier local `/volume1/docker/wishlist/data` vers `/app/data` dans le conteneur.
5. Démarrez le projet. Pour un accès HTTPS depuis l'extérieur, ajoutez une entrée dans le **Proxy inversé** (Panneau de configuration > Portail de connexion > Avancé > Proxy inversé).

### 🐧 Unraid / CasaOS / TrueNAS
- Déployez simplement la stack en utilisant le `docker-compose.yml` standard.
- Assurez-vous de faire persister le montage du volume `/app/data`.

---

## 🛠️ Installation locale pour développement

Pour tester ou modifier le code source :

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-nom/wishlist.git
cd wishlist

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

L'application tourne sur [http://localhost:3000](http://localhost:3000).

Pour compiler l'application en standalone pour la production :

```bash
npm run build
npm start
```

---

## ⚙️ Configuration

Vous pouvez personnaliser l'application via les variables d'environnement (ou via un fichier `.env.local`) :

| Variable | Description | Valeur par défaut |
|---|---|---|
| `PORT` | Port d'écoute interne du serveur | `3000` |
| `HOSTNAME` | Hôte d'écoute réseau | `0.0.0.0` |
| `DATA_DIR` | Répertoire de stockage du fichier JSON | `/app/data` (Docker) ou `./data` |
| `FAMILY_NAME` | Nom affiché sur l'en-tête de la lettre | `Notre Famille` |
| `CURRENCY` | Devise par défaut (`CHF`, `EUR`, `USD`, `CAD`, `GBP`) | `CHF` |
| `PARENT_PIN` | Code PIN initial pour l'espace parents (4 chiffres) | `1234` |
| `SHARE_TOKEN` | Jeton d'accès de l'URL publique de partage | `notre-famille` |
| `NEXT_PUBLIC_APP_URL` | URL publique optionnelle (ex. `https://cadeaux.famille.com`) | *Auto-détectée* |

> [!TIP]
> Tous ces réglages (PIN, nom de famille, devise, magasins) peuvent être modifiés directement depuis l'**Espace Parents** de l'application sans redémarrer le serveur.

---

## 💾 Sauvegarde & Restauration

### Via l'Interface Graphique (1 Clic)
1. Rendez-vous dans l'**Espace Parents** (icône cadenas).
2. Ouvrez l'onglet **Sécurité & Paramètres**.
3. Cliquez sur **Exporter (.json)** pour télécharger instantanément une copie complète datée de votre liste.
4. Le bouton **Importer (.json)** vous permet de restaurer votre fichier à tout moment sur une nouvelle installation.

### Sauvegarde manuelle (Terminal)
Puisque toutes les données sont regroupées dans un unique fichier, il vous suffit de copier `data/wishlist.json` :

```bash
cp data/wishlist.json /chemin/vers/ma-sauvegarde/wishlist-$(date +%F).json
```

---

## 🛡️ Sécurité & Vie Privée

- **Zéro tracking** : Aucun cookie publicitaire, aucun service d'analyse tiers.
- **Protection Anti-Brute-Force** : Après 5 codes PIN incorrects, l'accès est bloqué pendant 15 minutes au niveau de l'IP cliente.
- **Sanitisation stricte des URLs** : Les liens externes sont validés (`https://` ou `http://` obligatoires) et échappés pour prévenir les attaques de type XSS.
- **Données 100% locales** : Les noms de vos enfants, photos de cadeaux et souhaits restent exclusivement sur votre machine ou NAS.

---

## 📁 Structure du projet

```
wishlist/
├── data/                       # Stockage persistant (wishlist.json)
├── public/                     # Logo SVG, icônes, musique libre de droits
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── data/           # Récupération globale et filtrage
│   │   │   ├── gifts/          # CRUD cadeaux avec sanitisation
│   │   │   ├── parent/manage/  # Espace parent, backups & presets
│   │   │   ├── reserve/        # Réservation familiale anti-doublon
│   │   │   ├── scrape-url/     # Extraction OpenGraph des fiches produits
│   │   │   └── search-products/# Recherche multi-magasins en temps réel
│   │   ├── partage/[token]/    # Vue publique dédiée aux proches
│   │   ├── layout.tsx          # Layout racine, PWA & police Geist
│   │   └── page.tsx            # Vue interactive (Enfant & Parents)
│   ├── components/             # Composants d'interface Apple Design
│   │   ├── AddGiftModal.tsx    # Modale de recherche et ajout 1-clic
│   │   ├── AudioPlayer.tsx     # Lecteur d'ambiance de Noël
│   │   ├── GiftCard.tsx        # Carte cadeau avec statut et coup de cœur
│   │   ├── ParentDashboard.tsx # Tableau de bord, budget & sauvegardes
│   │   ├── PinModal.tsx        # Clavier numérique PIN avec rate-limit
│   │   ├── ReserveModal.tsx    # Réservation discrète pour proches
│   │   └── ShareModal.tsx      # Partage lien et bouton WhatsApp
│   ├── lib/
│   │   ├── auth-guard.ts       # Rate limiting PIN & sanitisation d'URLs
│   │   └── db.ts               # Moteur de base de données JSON typé
│   └── types/
│       └── index.ts            # Définitions TypeScript
├── Dockerfile                  # Multi-stage build léger Node.js 20 Alpine
├── docker-compose.yml          # Déploiement en 1 commande
└── README.md
```

---

## 🎶 Crédits & Mentions

- **Musique de Noël** : *Jingle Bells (Calm)* par **Kevin MacLeod** ([incompetech.com](https://incompetech.com)).  
  Licencié sous [Creative Commons Attribution 3.0 (CC BY 3.0)](https://creativecommons.org/licenses/by/3.0/).
- **Icônes** : [Lucide Icons](https://lucide.dev).
- **Typographie** : [Geist](https://vercel.com/font) par Vercel.

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Pour proposer une amélioration ou ajouter une boutique partenaire :

1. Forkez le projet.
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-boutique`).
3. Commitez vos modifications (`git commit -m 'feat: ajout support magasin JouéClub'`).
4. Poussez sur votre branche (`git push origin feature/nouvelle-boutique`).
5. Ouvrez une **Pull Request**.

---

## 📄 Licence

Ce projet est distribué sous licence **MIT**. Vous êtes libre de l'utiliser, le copier, le modifier et l'adapter à vos besoins personnels ou familiaux.
