import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import db from '@/lib/db';
import { Store } from '@/types';

// Bypass Azure routing blackhole for duckduckgo.com (40.114.177.156) by using active resilient IP 52.142.124.215
try {
  const origLookup = dns.lookup;
  // @ts-expect-error monkeypatching dns.lookup
  dns.lookup = (hostname: string, options: any, callback: any) => {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    if (hostname === 'duckduckgo.com') {
      if (options && options.all) {
        return callback(null, [{ address: '52.142.124.215', family: 4 }]);
      }
      return callback(null, '52.142.124.215', 4);
    }
    return origLookup(hostname, options, callback);
  };
} catch {
  // Ignore in environments where dns cannot be patched
}

interface SearchResultItem {
  id: string;
  title: string;
  image_url: string;
  product_url: string;
  store_name: string;
  store_icon: string;
  domain: string;
  price: number | null;
  currency: string;
}

// In-memory search cache (1 hour TTL) to prevent repeated calls and anti-bot bans
const searchCache = new Map<string, { timestamp: number; data: SearchResultItem[] }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function getStoreDomainPatterns(store: Store): string[] {
  const d = (store.domain || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim();
  const id = (store.id || '').toLowerCase();

  if (!d) return [];

  // Strictly Swiss domain (.ch) or Swiss store ID
  if (d.endsWith('.ch') || id.endsWith('-ch')) {
    if (d.includes('galaxus') || d.includes('digitec')) {
      return ['galaxus.ch', 'digitec.ch'];
    }
    // Strictly preserve the .ch domain (e.g. king-jouet.ch, fnac.ch, decathlon.ch)
    return [d];
  }

  // Strictly French domain (.fr)
  if (d.endsWith('.fr') || id.endsWith('-fr')) {
    if (d.includes('idkids') || d.includes('oxybul')) {
      return ['idkids.fr', 'oxybul.com'];
    }
    return [d];
  }

  // General multi-domain brands
  if (id === 'galaxus' || d.includes('galaxus') || d.includes('digitec')) {
    return ['galaxus.ch', 'digitec.ch'];
  }
  if (id.startsWith('lego') || d.includes('lego')) {
    return ['lego.com'];
  }
  if (id.startsWith('smyths') || d.includes('smythstoys')) {
    return ['smythstoys.com'];
  }
  if (id.startsWith('amazon') || d.includes('amazon')) {
    return [d || 'amazon.fr'];
  }

  return [d];
}

function matchStore(url: string, allowedStores: Store[]): Store | null {
  if (!url) return null;
  let hostname = '';
  try {
    const parsed = new URL(url);
    hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    hostname = url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim();
  }

  for (const store of allowedStores) {
    const patterns = getStoreDomainPatterns(store);
    for (const pattern of patterns) {
      const cleanPattern = pattern.toLowerCase().replace(/^www\./, '');
      if (hostname === cleanPattern || hostname.endsWith('.' + cleanPattern)) {
        return store;
      }
    }
  }

  return null;
}

function cleanTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/\|.*$/g, '')
    .replace(/- Achat.*$/gi, '')
    .replace(/- Fnac.*$/gi, '')
    .replace(/Boutique LEGO.*$/gi, '')
    .replace(/kaufen bei.*$/gi, '')
    .replace(/au meilleur prix.*$/gi, '')
    .replace(/: Amazon\.(fr|com|de|it|es).*$/gi, '')
    .replace(/chez Smyths Toys.*$/gi, '')
    .replace(/sur Decathlon.*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPrice(text: string): number | null {
  if (!text) return null;
  const match = text.match(/(\d+([.,]\d{1,2})?)\s*(€|CHF|\$|EUR)/i) || text.match(/(€|CHF|\$|EUR)\s*(\d+([.,]\d{1,2})?)/i);
  if (match) {
    const numStr = (match[1] || match[2]).replace(',', '.');
    const val = parseFloat(numStr);
    if (!isNaN(val) && val > 0 && val < 5000) return val;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const storeKey = (searchParams.get('store') || 'all').toLowerCase();

    if (!query.trim()) {
      return NextResponse.json({ results: [], query, store: storeKey, total: 0 });
    }

    // Check in-memory cache first
    const cacheKey = `${storeKey}:${query.trim().toLowerCase()}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        query,
        store: storeKey,
        total: cached.data.length,
        results: cached.data,
      });
    }

    // Read only currently enabled stores from database
    const activeStores = db.prepare('SELECT * FROM stores WHERE is_enabled = 1').all() as Store[];

    if (!activeStores || activeStores.length === 0) {
      return NextResponse.json({ results: [], query, store: storeKey, total: 0 });
    }

    // Determine targeted store(s)
    let targetStores: Store[] = [];
    if (storeKey !== 'all') {
      const found = activeStores.find(
        (s) =>
          s.id.toLowerCase() === storeKey ||
          s.name.toLowerCase().includes(storeKey) ||
          s.domain.toLowerCase().includes(storeKey)
      );
      if (found) {
        targetStores = [found];
      } else {
        // The requested store is disabled or does not exist
        return NextResponse.json({ results: [], query, store: storeKey, total: 0 });
      }
    } else {
      targetStores = activeStores;
    }

    // Build search query based strictly on enabled stores
    const allSiteClauses: string[] = [];
    for (const store of targetStores) {
      const patterns = getStoreDomainPatterns(store);
      for (const p of patterns) {
        allSiteClauses.push(`site:${p}`);
      }
    }

    if (allSiteClauses.length === 0) {
      return NextResponse.json({ results: [], query, store: storeKey, total: 0 });
    }

    const siteFilter = `(${allSiteClauses.join(' OR ')})`;
    const fullQuery = `${query.trim()} ${siteFilter}`;

    // Query DuckDuckGo via POST form submission (official standard token acquisition)
    const postBody = `q=${encodeURIComponent(fullQuery)}`;
    const tokenRes = await fetch('https://duckduckgo.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': String(Buffer.byteLength(postBody)),
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      body: postBody,
      signal: AbortSignal.timeout(9000),
    }).catch(() => null);

    if (!tokenRes || !tokenRes.ok) {
      return NextResponse.json({ results: [], query, store: storeKey, total: 0 });
    }

    const tokenHtml = await tokenRes.text();
    const vqdMatch = tokenHtml.match(/vqd=([0-9-]+)/) || tokenHtml.match(/vqd="([0-9-]+)"/) || tokenHtml.match(/vqd='([0-9-]+)'/);
    if (!vqdMatch) {
      return NextResponse.json({ results: [], query, store: storeKey, total: 0 });
    }

    const vqd = vqdMatch[1];
    const imgUrl = `https://duckduckgo.com/i.js?l=fr-fr&o=json&q=${encodeURIComponent(fullQuery)}&vqd=${vqd}&f=,,,&p=1`;

    const imgRes = await fetch(imgUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: '*/*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        Referer: 'https://duckduckgo.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
      },
      signal: AbortSignal.timeout(9000),
    }).catch(() => null);

    if (!imgRes || !imgRes.ok) {
      return NextResponse.json({ results: [], query, store: storeKey, total: 0 });
    }

    interface DDGResult {
      title?: string;
      image?: string;
      thumbnail?: string;
      url?: string;
      source?: string;
    }

    const data = await imgRes.json().catch(() => ({ results: [] }));
    const rawItems: DDGResult[] = data.results || [];

    const results: SearchResultItem[] = [];
    const seenUrls = new Set<string>();

    for (let i = 0; i < rawItems.length && results.length < 24; i++) {
      const item = rawItems[i];
      const productUrl = item.url || '';
      const imageUrl = item.image || item.thumbnail || '';
      const rawTitle = item.title || '';

      if (!productUrl || !imageUrl || seenUrls.has(productUrl)) continue;

      // Strictly verify if product URL belongs to one of the enabled targetStores
      const matchedStore = matchStore(productUrl, targetStores);
      if (!matchedStore) {
        // Skip any store that is disabled or not in targetStores (e.g. Amazon or king-jouet.com when Swiss is active)
        continue;
      }

      seenUrls.add(productUrl);

      const title = cleanTitle(rawTitle);
      const price = extractPrice(rawTitle);

      results.push({
        id: `search-${i}-${Date.now()}`,
        title: title || rawTitle,
        image_url: imageUrl,
        product_url: productUrl,
        store_name: matchedStore.name,
        store_icon: matchedStore.icon,
        domain: matchedStore.domain,
        price,
        currency: 'CHF',
      });
    }

    // Cache successful search results
    if (results.length > 0) {
      searchCache.set(cacheKey, { timestamp: Date.now(), data: results });
    }

    return NextResponse.json({
      query,
      store: storeKey,
      total: results.length,
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de recherche';
    return NextResponse.json({ error: message, results: [], total: 0 });
  }
}
