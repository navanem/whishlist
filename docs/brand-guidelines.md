# Brand Guidelines — Wishlist (Liste au Père Noël)

> **Version:** 1.0.0  
> **Date:** Octobre 2026  
> **Statut:** Officiel  
> **Application:** Wishlist • Liste de souhaits & Lettre au Père Noël

---

## 1. Synthèse de la Marque & Vision

### 1.1 Le Concept
**Wishlist** réinvente la traditionnelle lettre au Père Noël et la liste de souhaits familiale pour l'ère moderne.  
Elle allie la poésie, la chaleur et l'émerveillement de la papeterie festive à la rigueur, la fluidité et le minimalisme d'**Apple Human Interface Guidelines (WWDC)**.

### 1.2 La Promesse
* **Pour les enfants** : Une expérience magique, tactile et immersive pour composer leur lettre au Père Noël en cherchant directement leurs jouets préférés en 1 clic.
* **Pour les parents & la famille** : Une coordination fluide, discrète et sans doublons grâce aux réservations secrètes préservant intacte la magie de Noël.

### 1.3 Piliers de la Marque (Brand Pillars)
1. **Émerveillement authentique (No AI Slop)** : Aucun artifice de mauvais goût (dégradés néons criards, étincelles à foison, clichés marketing creux). Une papeterie de Noël chaleureuse, un cachet postal du Pôle Nord et une typographie soignée.
2. **Artisanat & Fluidité Apple (Craft & Fluidity)** : Verre dépoli translucide, retour haptique et tactile immédiat (`active:scale-[0.98]`), typographie optique SF Pro & Serif élégante.
3. **Simplicité universelle** : Une ergonomie pensée "mobile-first", accessible en 1 pouce, utilisable par les petits comme par les grands-parents.

---

## 2. Voix & Tonalité (Tone of Voice Framework)

### 2.1 Dimensions de la Voix
| Dimension | Positionnement | Explication |
| :--- | :--- | :--- |
| **Ton** | Chaleureux & Complice | Comme un conte de Noël raconté au coin du feu. |
| **Langage** | Simple & Naturel | Vocabulaire direct, évocateur, sans jargon ni lourdeur. |
| **Caractère** | Féerique mais digne | Enchanteur sans tomber dans l'enfantin béat ou la surenchère commerciale. |
| **Émotion** | Réconfortant & Festif | Inspire la générosité, le partage et l'esprit des fêtes. |

### 2.2 Table de Correspondance (Do vs Don't)
| Situation | Ce que Wishlist dit (Do) | Ce qu'on évite absolument (Don't) |
| :--- | :--- | :--- |
| **En-tête de lettre** | _« Cher Père Noël, pour cette année voici ma liste de souhaits 🎄 »_ | _« Écris ta liste magique et génère tes cadeaux instantanément ! »_ |
| **Bouton d'action** | _« Écrire au Père Noël »_ ou _« Ajouter à ma lettre »_ | _« Créer un item »_ ou _« Générer avec l'IA ✨ »_ |
| **Partage familial** | _« Transmettre la lettre aux proches »_ | _« Partagez votre lien de parrainage »_ |
| **Réservation proche** | _« Je m'occupe de ce cadeau ! »_ | _« Marquer comme réservé / checkout »_ |
| **Hotte vide** | _« La hotte est encore vide ! Glisse tes premières envies... »_ | _« Aucun enregistrement trouvé dans la base de données. »_ |

---

## 3. Identité Visuelle & Système de Design

### 3.1 Palette Chromatique

#### Couleurs Principales (Festives & Nobles)
* **Rouge Carmin Festif (Santa Crimson)** : `#DC2626` (Hover: `#B91C1C`)
  * *Usage* : Actions primaires ("Écrire au Père Noël"), coups de cœur, sceau postal.
  * *Contraste* : 4.8:1 sur fond blanc/crème (Conforme WCAG AA).
* **Vert Sapin Nordique (Evergreen)** : `#15803D` (Dark: `#22C55E`)
  * *Usage* : Statuts réservés/achetés, badges secondaires, accents d'emballage.
* **Or Ambré Chaleureux (Warm Gold)** : `#D97706` (Dark: `#FBBF24`)
  * *Usage* : Niveau de priorité "Super envie", étoiles de souhaits, finitions dorées.

#### Neutres & Matériaux (Papeterie & Verre Dépoli)
* **Papier Velin / Ivoire Chaud (Stationery Paper)** : `#FAF7F2`
  * *Usage* : Toile de fond en mode clair (évite le blanc hôpital froid, évoque le papier à lettre).
* **Noir Nuit Polaire (Midnight)** : `#12100E`
  * *Usage* : Fond en mode sombre (teinte noire réchauffée d'un soupçon de terre d'ombre).
* **Surface Carte & Verre Dépoli** : `#FFFFFF` (Clair) / `#1C1815` (Sombre)
  * *Usage* : Cartes de souhaits, modales tiroirs (*Bottom Sheets*).
  * *Effet* : `backdrop-filter: blur(20px) saturate(180%)`, bordures capillaires `border: 1px solid rgba(180, 83, 9, 0.12)`.

---

## 4. Typographie & Hiérarchie

* **Titre Émotionnel (Salutation)** : Font Serif Italique (*New York / Georgia / Garamond*)  
  * _« Cher Père Noël, »_ — évoque l'écriture soignée d'une vraie lettre.
* **Typographie Système & UI** : `-apple-system`, `SF Pro Display`, `SF Pro Text`  
  * Titre d'app : **Wishlist** (Semibold, tracking `-0.025em`)
  * Libellés, boutons et prix : Proportions nettes, lisibilité parfaite à toutes les échelles.

---

## 5. Signature Visuelle : Le Cachet Postal du Pôle Nord

L'identité Wishlist intègre en signature un **timbre postal vintage stylisé** :
* Anneau double perforé/pointillé teinté en carmin doux (`border: 2px dashed rgba(220, 38, 38, 0.3)`).
* Inscription circulaire : `SERVICE POSTAL DU PÔLE NORD • NOËL 2026`.
* Flocon ou sapin gravé central `❄️`.
* Inclinaison naturelle de `-10°` symbolisant le tamponnage manuel sur l'enveloppe.

---

## 6. Spécifications Tokens (`design-tokens.json`)

```json
{
  "brand": {
    "name": "Wishlist",
    "theme": "Santa Letter & Holiday Stationery",
    "colors": {
      "primary": { "name": "Santa Crimson", "hex": "#DC2626" },
      "secondary": { "name": "Evergreen", "hex": "#15803D" },
      "accent": { "name": "Warm Gold", "hex": "#D97706" },
      "backgroundLight": { "name": "Stationery Ivory", "hex": "#FAF7F2" },
      "backgroundDark": { "name": "Midnight Warmth", "hex": "#12100E" }
    },
    "typography": {
      "salutation": "Serif Italic (Garamond / Georgia / New York)",
      "ui": "-apple-system, SF Pro Text, sans-serif"
    }
  }
}
```
