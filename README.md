<div align="center">

  <img src="public/logo.svg" alt="Wishlist Logo" width="120" height="120" />

  # 🎁 Wishlist

  <p><strong>A modern, magical, and self-hosted web app to create and share your kids' Christmas and birthday wishlists with family effortlessly.</strong></p>

  <p>
    <a href="#-interface-preview">Preview</a> •
    <a href="#-key-features">Features</a> •
    <a href="#-quick-start-docker">Quick Start</a> •
    <a href="#-self-hosting--nas">Self-Hosting</a> •
    <a href="#️-configuration">Configuration</a> •
    <a href="#-backup--restore">Backup & Restore</a> •
    <a href="#-privacy--security">Security</a> •
    <a href="#-contributing">Contributing</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Material_Design-3-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Material Design 3" />
    <img src="https://img.shields.io/badge/Next.js-15%2B-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Ready" />
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License MIT" />
  </p>

</div>

---

## 📸 Interface Preview

<div align="center">
  <img src="https://raw.githubusercontent.com/navanem/whishlist/main/docs/screenshots/desktop-home.png" alt="Wishlist Desktop View" width="100%" />
  <p><em>Desktop View: Google Material 3 UI with festive Crimson tonal palette, M3 filter chips, and outlined gift cards.</em></p>
</div>

<br />

<div align="center">
  <img src="https://raw.githubusercontent.com/navanem/whishlist/main/docs/screenshots/family-sharing.png" alt="Family Sharing View" width="100%" />
  <p><em>Family Sharing View: Anti-duplicate reservations for relatives ("Je m'en occupe"), prominent store pricing, and reserved gifts section neatly positioned below.</em></p>
</div>

<br />

<div align="center">
  <table border="0">
    <tr>
      <td width="65%" valign="top">
        <img src="https://raw.githubusercontent.com/navanem/whishlist/main/docs/screenshots/parent-dashboard.png" alt="Parent Dashboard View" width="100%" />
        <p align="center"><em>Parent Space & Budget Tracking: Secret PIN protection, budget monitoring, and gift lifecycle management.</em></p>
      </td>
      <td width="35%" valign="top" align="center">
        <img src="https://raw.githubusercontent.com/navanem/whishlist/main/docs/screenshots/mobile-view.png" alt="Mobile-First View" width="85%" />
        <p align="center"><em>Mobile View: Responsive touch-first UI with M3 Extended FAB.</em></p>
      </td>
    </tr>
  </table>
</div>

---

## 🌟 Why Wishlist?

Every holiday season and birthday brings the same headache: grandparents ask for gift ideas, relatives accidentally buy the exact same toy twice, and kids risk spoiling their surprises by peeking at shared documents.

**Wishlist** was crafted to solve this with care and simplicity:

- 🧙 **Preserve the Magic**: Kids browse a delightful, festive Santa letter interface without **ever** seeing what has been reserved or bought by relatives.
- 🛍️ **1-Click Direct Store Search**: No more juggling dozens of browser tabs to copy and paste product links. Search for *"Lego X-Wing"* or *"Unicorn Plush"* and add the item with its official photo and price in **1 click**.
- 🤝 **Anti-Duplicate Family Sharing**: A clean, token-protected public link lets relatives secretly claim *"I'll take care of this"* without creating an account or downloading an app.
- 🏡 **100% Private & Self-Hosted**: Zero third-party clouds, zero trackers, zero ads. Your family data stays entirely on your machine in a single lightweight JSON file.

---

## ✨ Key Features

### 🎅 1. « Letter to Santa » & Kid Mode
- Warm, handcrafted paper letter design paired with clean editorial typography.
- Fast child filtering with custom avatars (🚀 *Leo*, 🦄 *Mia*...).
- Minimalist gift cards featuring discreet favorite hearts ❤️ and indicative prices.
- Gentle acoustic holiday background audio (*Jingle Bells Calm*), toggled with one click in the header.

### 🛍️ 2. Built-in 1-Click Store Search
- Integrated live search engine querying top official toy and retail stores:
  - 🧱 **Lego Store**
  - 📚 **Fnac**
  - 🧸 **Smyths Toys**
  - 🇨🇭 **Galaxus / Digitec**
  - 👑 **King Jouet**
  - 🎨 **Oxybul / IDKIDS**
  - 🚲 **Decathlon**
  - 📦 **Amazon**
- Automatically fetches high-definition product images, official titles, stores, and prices.
- Supports **URL scraping** (paste any link to extract OpenGraph metadata) and custom manual entries.

### 🔒 3. Protected Parents Space & Budget Tracker
- iOS-inspired PIN keypad with smooth animations and tactile feedback.
- **Built-in brute-force protection**: 15-minute IP lockout after 5 consecutive failed attempts to thwart intrusion scripts.
- Secret gift lifecycle tracking: **Idea** ➜ **Reserved** ➜ **Bought** ➜ **Received / Wrapped**.
- Financial dashboard: estimated total budget, spent amount, and remaining costs per child.
- Full management for children, occasions (Christmas, Birthdays, etc.), and retail stores.

### 💌 4. Family Sharing Space (Anti-Duplicate)
- Dedicated public link secured via a unique token (e.g. `/partage/notre-famille`).
- Relatives can claim a gift by entering their first name and an optional private note.
- One-tap sharing to **WhatsApp**, SMS, or direct clipboard copy.
- Guests can release a reservation if their plans change.

### 🌍 5. Regional Store Packs & Multi-Currency
- Flexible currency selector: `CHF`, `EUR (€)`, `USD ($)`, `CAD ($)`, `GBP (£)`.
- 1-Click regional store presets ready in Parent Settings:
  - 🇫🇷 **France Pack**: Fnac, Amazon FR, Lego, Smyths France, King Jouet, Oxybul, Cultura, Decathlon.
  - 🇨🇭 **Switzerland Pack**: Galaxus, Fnac Switzerland, Lego CH, King Jouet CH, Smyths CH, Decathlon CH, Amazon.
  - 🌍 **International / US Pack**: Amazon US, Lego US, Target, Walmart, Barnes & Noble, Best Buy.

### 💾 6. Zero-Maintenance JSON Engine & 1-Click Backups
- High-performance, typed JSON engine with atomic disk persistence.
- No heavy PostgreSQL, MySQL, or native C SQLite compilation required.
- **Export** (`wishlist-backup.json`) and **Import** right from the Parent Settings UI.
- Move servers in seconds by simply copying a single file.

---

## 🚀 Quick Start (Docker)

### With Docker Compose (Recommended)

1. Create a directory and download `docker-compose.yml`:

```bash
mkdir -p wishlist && cd wishlist
curl -sO https://raw.githubusercontent.com/navanem/whishlist/main/docker-compose.yml
```

2. Start the container in the background:

```bash
docker compose up -d
```

3. Open **`http://localhost:3000`** in your browser!

#### `docker-compose.yml` Example

```yaml
version: "3.8"

services:
  wishlist:
    image: ghcr.io/navanem/whishlist:latest
    container_name: wishlist
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
      - DATA_DIR=/app/data
      - FAMILY_NAME="Our Family"
      - CURRENCY=CHF
      - PARENT_PIN=1234
      - SHARE_TOKEN=our-family
    volumes:
      - ./data:/app/data
```

---

## 🏡 Self-Hosting & NAS

### 🐳 Synology NAS (Container Manager)
1. Open **Container Manager** on Synology DSM.
2. Go to **Project** > **Create**.
3. Name the project `wishlist`, pick a storage path (e.g. `/docker/wishlist`), and paste the `docker-compose.yml` content above.
4. Mount your local directory `/volume1/docker/wishlist/data` to `/app/data` inside the container.
5. Start the project. For external HTTPS access, set up a reverse proxy rule in **Control Panel** > **Login Portal** > **Advanced** > **Reverse Proxy**.

### 🐧 Unraid / CasaOS / TrueNAS
- Deploy using the standard `docker-compose.yml`.
- Ensure the `/app/data` volume is persistent on your storage array.

---

## 🛠️ Local Development

To run or modify the source code locally:

```bash
# 1. Clone the repository
git clone https://github.com/navanem/whishlist.git
cd whishlist

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The application will be live at [http://localhost:3000](http://localhost:3000).

To create an optimized production standalone build:

```bash
npm run build
npm start
```

---

## ⚙️ Configuration

Customize the application via environment variables or a `.env.local` file:

| Variable | Description | Default Value |
|---|---|---|
| `PORT` | Internal HTTP port | `3000` |
| `HOSTNAME` | Network listening host | `0.0.0.0` |
| `DATA_DIR` | Storage folder for JSON data | `/app/data` (Docker) or `./data` |
| `FAMILY_NAME` | Displayed family header title | `Notre Famille` |
| `CURRENCY` | Default currency (`CHF`, `EUR`, `USD`, `CAD`, `GBP`) | `CHF` |
| `PARENT_PIN` | Initial PIN for Parent Space (4 digits) | `1234` |
| `SHARE_TOKEN` | Secret URL token for public sharing | `notre-famille` |
| `NEXT_PUBLIC_APP_URL` | Optional public domain (e.g. `https://wishlist.myfamily.com`) | *Auto-detected* |

> [!TIP]
> All parameters (PIN, family name, currency, store lists) can also be updated directly from the **Parent Space** within the app without restarting the container.

---

## 💾 Backup & Restore

### Via the Web Interface (1-Click)
1. Open the **Parent Space** (padlock icon).
2. Go to the **Security & Settings** tab.
3. Click **Export (.json)** to download an instant, complete timestamped backup of your lists and reservations.
4. Use **Import (.json)** to restore your data anytime on a fresh install.

### Manual Backup (Terminal)
Since all data is consolidated in a single file, backup is as simple as copying `data/wishlist.json`:

```bash
cp data/wishlist.json /path/to/my-backups/wishlist-$(date +%F).json
```

---

## 🛡️ Privacy & Security

- **Zero Tracking**: No analytics, no advertising beacons, no third-party cookies.
- **PIN Brute-Force Rate Limiting**: After 5 consecutive failed attempts, access is locked for 15 minutes per IP address.
- **Strict URL Sanitization**: All product links must use safe protocols (`https://` or `http://`) to prevent XSS exploits.
- **100% Local Storage**: Children names, gift ideas, and photos stay exclusively on your hardware.

---

## 📁 Repository Structure

```
wishlist/
├── data/                       # Persistent storage (wishlist.json)
├── public/                     # Vector logo, icons, royalty-free audio
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── data/           # Global data fetching & filtering
│   │   │   ├── gifts/          # CRUD gift operations with sanitization
│   │   │   ├── parent/manage/  # Parent dashboard, backups & presets
│   │   │   ├── reserve/        # Secret anti-duplicate reservations
│   │   │   ├── scrape-url/     # OpenGraph metadata extraction
│   │   │   └── search-products/# Live multi-store search
│   │   ├── partage/[token]/    # Public family view
│   │   ├── layout.tsx          # Root layout, PWA metadata & Geist font
│   │   └── page.tsx            # Main interactive view (Kids & Parents)
│   ├── components/             # Apple Design UI components
│   │   ├── AddGiftModal.tsx    # 1-click product search & add modal
│   │   ├── AudioPlayer.tsx     # Ambient Christmas background player
│   │   ├── GiftCard.tsx        # Responsive gift card with status badges
│   │   ├── ParentDashboard.tsx # Budget tracking, store management & backups
│   │   ├── PinModal.tsx        # iOS numeric PIN keypad with rate-limiting
│   │   ├── ReserveModal.tsx    # Family reservation modal
│   │   └── ShareModal.tsx      # WhatsApp & link sharing modal
│   ├── lib/
│   │   ├── auth-guard.ts       # PIN rate limiting & URL sanitization
│   │   └── db.ts               # Typed JSON database engine
│   └── types/
│       └── index.ts            # TypeScript definitions
├── Dockerfile                  # Lightweight multi-stage Node.js 20 Alpine build
├── docker-compose.yml          # 1-command deployment configuration
└── README.md
```

---

## 🎶 Credits & Attribution

- **Christmas Music**: *Jingle Bells (Calm)* by **Kevin MacLeod** ([incompetech.com](https://incompetech.com)).  
  Licensed under [Creative Commons Attribution 3.0 (CC BY 3.0)](https://creativecommons.org/licenses/by/3.0/).
- **Icons**: [Lucide Icons](https://lucide.dev).
- **Typography**: [Geist](https://vercel.com/font) by Vercel.

---

## 🤝 Contributing

Contributions are welcome! To add a new store parser or propose an enhancement:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/new-store`).
3. Commit your changes (`git commit -m 'feat: add support for Target store'`).
4. Push to the branch (`git push origin feature/new-store`).
5. Open a **Pull Request**.

---

## 📄 License

This project is open-source under the **MIT License**. Feel free to use, modify, and deploy it for your own family or personal projects!
