import fs from 'fs';
import path from 'path';
import { Child, Occasion, Gift, Store, AppSettings } from '@/types';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'wishlist.json');

interface DatabaseSchema {
  settings: Record<string, string>;
  children: Child[];
  occasions: Occasion[];
  gifts: Gift[];
  stores: Store[];
}

const defaultData: DatabaseSchema = {
  settings: {
    parent_pin: process.env.PARENT_PIN || '1234',
    share_token: process.env.SHARE_TOKEN || 'notre-famille',
    family_name: process.env.FAMILY_NAME || 'Notre Famille',
    currency: process.env.CURRENCY || 'CHF',
  },
  children: [
    {
      id: 'enfant-1',
      name: 'Léo',
      avatar: '🚀',
      color: '#0071e3',
      birthdate: '2016-04-12',
      created_at: new Date().toISOString(),
    },
    {
      id: 'enfant-2',
      name: 'Mia',
      avatar: '🦄',
      color: '#af52de',
      birthdate: '2019-11-20',
      created_at: new Date().toISOString(),
    },
  ],
  occasions: [
    {
      id: 'noel-2026',
      title: 'Noël 2026',
      type: 'christmas',
      year: 2026,
      is_active: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'anniversaire-2026',
      title: 'Anniversaire 2026',
      type: 'birthday',
      year: 2026,
      is_active: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'noel-2027',
      title: 'Noël 2027',
      type: 'christmas',
      year: 2027,
      is_active: 0,
      created_at: new Date().toISOString(),
    },
  ],
  stores: [
    {
      id: 'lego',
      name: 'Lego Store',
      domain: 'lego.com',
      search_url: 'https://www.lego.com/fr-ch/search?q={query}',
      icon: '🧱',
      category: 'Jouets & Construction',
      is_enabled: 1,
    },
    {
      id: 'fnac',
      name: 'Fnac',
      domain: 'fnac.ch',
      search_url: 'https://www.fnac.ch/SearchResult/ResultList.aspx?Search={query}',
      icon: '📚',
      category: 'Culture & High-Tech',
      is_enabled: 1,
    },
    {
      id: 'smyths',
      name: 'Smyths Toys',
      domain: 'smythstoys.com',
      search_url: 'https://www.smythstoys.com/fr/fr-fr/search/?text={query}',
      icon: '🧸',
      category: 'Jouets',
      is_enabled: 1,
    },
    {
      id: 'kingjouet',
      name: 'King Jouet',
      domain: 'king-jouet.ch',
      search_url: 'https://www.king-jouet.ch/recherche.htm?q={query}',
      icon: '👑',
      category: 'Jouets',
      is_enabled: 1,
    },
    {
      id: 'oxybul',
      name: 'Oxybul / IDKIDS',
      domain: 'idkids.fr',
      search_url: 'https://www.idkids.fr/recherche?q={query}',
      icon: '🎨',
      category: 'Éveil & Jeux',
      is_enabled: 1,
    },
    {
      id: 'decathlon',
      name: 'Decathlon',
      domain: 'decathlon.ch',
      search_url: 'https://www.decathlon.ch/fr/search?Ntt={query}',
      icon: '🚲',
      category: 'Sport & Plein air',
      is_enabled: 1,
    },
    {
      id: 'amazon',
      name: 'Amazon',
      domain: 'amazon.fr',
      search_url: 'https://www.amazon.fr/s?k={query}',
      icon: '📦',
      category: 'Généraliste',
      is_enabled: 1,
    },
    {
      id: 'galaxus',
      name: 'Galaxus / Digitec',
      domain: 'galaxus.ch',
      search_url: 'https://www.galaxus.ch/fr/search?q={query}',
      icon: '🇨🇭',
      category: 'Généraliste Suisse',
      is_enabled: 1,
    },
  ],
  gifts: [
    {
      id: 'gift-1',
      child_id: 'enfant-1',
      occasion_id: 'noel-2026',
      title: 'Lego Star Wars - Le Chasseur X-Wing',
      description: 'Le vaisseau iconique avec Luke Skywalker et R2-D2 !',
      image_url: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600&auto=format&fit=crop&q=80',
      product_url: 'https://www.lego.com/fr-ch/product/x-wing-fighter-75301',
      store_name: 'Lego Store',
      price: 64.9,
      currency: 'CHF',
      priority: 3,
      is_favorite: 1,
      status: 'idea',
      created_at: new Date().toISOString(),
    },
    {
      id: 'gift-2',
      child_id: 'enfant-2',
      occasion_id: 'noel-2026',
      title: 'Peluche Licorne Magique Lumineuse',
      description: 'Douce avec des sons magiques pour s endormir.',
      image_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop&q=80',
      product_url: 'https://www.smythstoys.com',
      store_name: 'Smyths Toys',
      price: 29.95,
      currency: 'CHF',
      priority: 2,
      is_favorite: 0,
      status: 'idea',
      created_at: new Date().toISOString(),
    },
  ],
};

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

class JsonDatabase {
  private data: DatabaseSchema;

  constructor() {
    ensureDir(dataDir);
    if (!fs.existsSync(dataFilePath)) {
      this.data = JSON.parse(JSON.stringify(defaultData));
      this.save();
    } else {
      try {
        const raw = fs.readFileSync(dataFilePath, 'utf8');
        this.data = JSON.parse(raw);
        // Ensure all keys exist and have initial values
        if (!this.data.settings) this.data.settings = { ...defaultData.settings };
        if (!this.data.children || this.data.children.length === 0) this.data.children = [...defaultData.children];
        if (!this.data.occasions || this.data.occasions.length === 0) this.data.occasions = [...defaultData.occasions];
        if (!this.data.stores || this.data.stores.length === 0) this.data.stores = [...defaultData.stores];
        if (!this.data.gifts) this.data.gifts = [...defaultData.gifts];
        // Sanitize any malformed status
        const validStatuses = new Set(['idea', 'reserved', 'bought', 'received', 'available']);
        this.data.gifts.forEach((g) => {
          if (!validStatuses.has(g.status)) g.status = 'idea';
        });
        this.save();
      } catch {
        this.data = JSON.parse(JSON.stringify(defaultData));
        this.save();
      }
    }
  }

  private save() {
    try {
      ensureDir(dataDir);
      fs.writeFileSync(dataFilePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save wishlist data:', e);
    }
  }

  // SQLite-like compatible interface
  prepare(sql: string) {
    const trimmed = sql.trim().replace(/\s+/g, ' ');

    return {
      all: (...params: unknown[]) => {
        // SELECT * FROM stores WHERE is_enabled = 1
        if (trimmed.includes('FROM stores')) {
          let res = [...this.data.stores];
          if (trimmed.includes('WHERE is_enabled = 1')) {
            res = res.filter((s) => s.is_enabled === 1);
          }
          if (trimmed.includes('AND id = ?') || trimmed.includes('WHERE id = ?')) {
            const id = params[0] as string;
            res = res.filter((s) => s.id === id);
          }
          return res;
        }

        // SELECT * FROM children
        if (trimmed.includes('FROM children')) {
          return [...this.data.children].sort((a, b) => a.name.localeCompare(b.name));
        }

        // SELECT * FROM occasions
        if (trimmed.includes('FROM occasions')) {
          return [...this.data.occasions].sort((a, b) => b.year - a.year);
        }

        // SELECT key, value FROM settings
        if (trimmed.includes('FROM settings')) {
          return Object.entries(this.data.settings).map(([key, value]) => ({ key, value }));
        }

        // SELECT gifts with joined child and occasion info
        if (trimmed.includes('FROM gifts')) {
          return this.data.gifts
            .map((g) => {
              const child = this.data.children.find((c) => c.id === g.child_id);
              const occ = this.data.occasions.find((o) => o.id === g.occasion_id);
              return {
                ...g,
                child_name: child?.name || 'Enfant',
                child_avatar: child?.avatar || '🌟',
                child_color: child?.color || '#0071e3',
                occasion_title: occ?.title || 'Événement',
              };
            })
            .sort((a, b) => {
              if (b.is_favorite !== a.is_favorite) return b.is_favorite - a.is_favorite;
              if (b.priority !== a.priority) return b.priority - a.priority;
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
        }

        return [];
      },

      get: (...params: unknown[]) => {
        // SELECT value FROM settings WHERE key = ?
        if (trimmed.includes('FROM settings WHERE key = ?')) {
          const key = params[0] as string;
          return { value: this.data.settings[key] || '' };
        }

        // SELECT * FROM gifts WHERE id = ?
        if (trimmed.includes('FROM gifts WHERE id = ?')) {
          const id = params[0] as string;
          const gift = this.data.gifts.find((g) => g.id === id);
          if (!gift) return undefined;
          const child = this.data.children.find((c) => c.id === gift.child_id);
          const occ = this.data.occasions.find((o) => o.id === gift.occasion_id);
          return {
            ...gift,
            child_name: child?.name || 'Enfant',
            child_avatar: child?.avatar || '🌟',
            child_color: child?.color || '#0071e3',
            occasion_title: occ?.title || 'Événement',
          };
        }

        return undefined;
      },

      run: (...params: unknown[]) => {
        // INSERT INTO gifts
        if (trimmed.startsWith('INSERT INTO gifts') || trimmed.startsWith('INSERT OR IGNORE INTO gifts')) {
          const [
            id,
            child_id,
            occasion_id,
            title,
            description,
            image_url,
            product_url,
            store_name,
            price,
            currency,
            priority,
            is_favorite,
            status,
            created_at,
          ] = params as [
            string,
            string,
            string,
            string,
            string | null,
            string | null,
            string | null,
            string | null,
            number | null,
            string,
            number,
            number,
            Gift['status'],
            string
          ];

          if (!this.data.gifts.some((g) => g.id === id)) {
            this.data.gifts.push({
              id,
              child_id,
              occasion_id,
              title,
              description,
              image_url,
              product_url,
              store_name,
              price,
              currency,
              priority,
              is_favorite,
              status: status || 'idea',
              created_at,
            });
            this.save();
          }
          return { changes: 1 };
        }

        // UPDATE gifts SET ... WHERE id = ?
        if (trimmed.startsWith('UPDATE gifts SET')) {
          // Check for reservation update
          if (trimmed.includes('status = \'reserved\'') || trimmed.includes("status = 'reserved'")) {
            const [reserved_by, reserved_at, private_note, gift_id] = params as [string, string, string | null, string];
            const g = this.data.gifts.find((item) => item.id === gift_id);
            if (g) {
              g.status = 'reserved';
              g.reserved_by = reserved_by;
              g.reserved_at = reserved_at;
              g.private_note = private_note;
              this.save();
            }
            return { changes: 1 };
          }

          if (trimmed.includes('status = \'idea\'') || trimmed.includes("status = 'idea'")) {
            const [gift_id] = params as [string];
            const g = this.data.gifts.find((item) => item.id === gift_id);
            if (g) {
              g.status = 'idea';
              g.reserved_by = null;
              g.reserved_at = null;
              g.private_note = null;
              this.save();
            }
            return { changes: 1 };
          }

          // Generic update
          const gift_id = params[params.length - 1] as string;
          const g = this.data.gifts.find((item) => item.id === gift_id);
          if (g) {
            // parse set fields
            const setPart = trimmed.replace('UPDATE gifts SET ', '').split(' WHERE id = ?')[0];
            const fields = setPart.split(',').map((f) => f.trim().split(' =')[0]);
            fields.forEach((field, idx) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (g as any)[field] = params[idx];
            });
            this.save();
          }
          return { changes: 1 };
        }

        // DELETE FROM gifts WHERE id = ?
        if (trimmed.startsWith('DELETE FROM gifts WHERE id = ?')) {
          const id = params[0] as string;
          this.data.gifts = this.data.gifts.filter((g) => g.id !== id);
          this.save();
          return { changes: 1 };
        }

        if (trimmed.startsWith('DELETE FROM gifts WHERE child_id = ?')) {
          const child_id = params[0] as string;
          this.data.gifts = this.data.gifts.filter((g) => g.child_id !== child_id);
          this.save();
          return { changes: 1 };
        }

        if (trimmed.startsWith('DELETE FROM gifts WHERE occasion_id = ?')) {
          const occ_id = params[0] as string;
          this.data.gifts = this.data.gifts.filter((g) => g.occasion_id !== occ_id);
          this.save();
          return { changes: 1 };
        }

        // Children management
        if (trimmed.startsWith('INSERT INTO children')) {
          const [id, name, avatar, color, birthdate, created_at] = params as [
            string,
            string,
            string,
            string,
            string | null,
            string
          ];
          this.data.children.push({ id, name, avatar, color, birthdate, created_at });
          this.save();
          return { changes: 1 };
        }

        if (trimmed.startsWith('DELETE FROM children WHERE id = ?')) {
          const id = params[0] as string;
          this.data.children = this.data.children.filter((c) => c.id !== id);
          this.save();
          return { changes: 1 };
        }

        // Occasions management
        if (trimmed.startsWith('INSERT INTO occasions')) {
          const [id, title, type, year, is_active, created_at] = params as [
            string,
            string,
            Occasion['type'],
            number,
            number,
            string
          ];
          this.data.occasions.push({ id, title, type, year, is_active, created_at });
          this.save();
          return { changes: 1 };
        }

        if (trimmed.startsWith('DELETE FROM occasions WHERE id = ?')) {
          const id = params[0] as string;
          this.data.occasions = this.data.occasions.filter((o) => o.id !== id);
          this.save();
          return { changes: 1 };
        }

        // Stores management
        if (trimmed.startsWith('UPDATE stores SET is_enabled = CASE WHEN is_enabled = 1 THEN 0 ELSE 1 END WHERE id = ?')) {
          const id = params[0] as string;
          const store = this.data.stores.find((s) => s.id === id);
          if (store) {
            store.is_enabled = store.is_enabled === 1 ? 0 : 1;
            this.save();
          }
          return { changes: 1 };
        }

        if (trimmed.startsWith('INSERT INTO stores')) {
          const [id, name, domain, search_url, icon, category, is_enabled] = params as [
            string,
            string,
            string,
            string,
            string,
            string,
            number
          ];
          this.data.stores.push({ id, name, domain, search_url, icon, category, is_enabled });
          this.save();
          return { changes: 1 };
        }

        // Settings update
        if (trimmed.startsWith('UPDATE settings SET value = ? WHERE key = ?')) {
          const [value, key] = params as [string, string];
          this.data.settings[key] = value;
          this.save();
          return { changes: 1 };
        }

        return { changes: 0 };
      },
    };
  }
}

// Global singleton instance
const globalDb = new JsonDatabase();
export default globalDb;
