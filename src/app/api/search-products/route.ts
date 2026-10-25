import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Store } from '@/types';

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

function getStoreDomainPatterns(store: Store): string[] {
  const d = (store.domain || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim();
  const id = (store.id || '').toLowerCase();

  if (id === 'galaxus' || d.includes('galaxus') || d.includes('digitec')) {
    return ['galaxus.ch', 'galaxus.de', 'digitec.ch'];
  }
  if (id.startsWith('fnac') || d.includes('fnac')) {
    return ['fnac.ch', 'fnac.com'];
  }
  if (id.startsWith('kingjouet') || d.includes('king-jouet')) {
    return ['king-jouet.ch', 'king-jouet.com'];
  }
  if (id.startsWith('oxybul') || d.includes('idkids') || d.includes('oxybul')) {
    return ['idkids.fr', 'oxybul.com'];
  }
  if (id.startsWith('decathlon') || d.includes('decathlon')) {
    return ['decathlon.ch', 'decathlon.fr'];
  }
  if (id.startsWith('amazon') || d.includes('amazon')) {
    return ['amazon.fr', 'amazon.de', 'amazon.com', 'amazon.it', 'amazon.es'];
  }
  if (id.startsWith('lego') || d.includes('lego')) {
    return ['lego.com'];
  }
  if (id.startsWith('smyths') || d.includes('smythstoys')) {
    return ['smythstoys.com'];
  }

  return d ? [d] : [];
}

function getStoreSearchQuery(store: Store): string {
  const patterns = getStoreDomainPatterns(store);
  if (patterns.length === 0) return '';
  if (patterns.length === 1) return `site:${patterns[0]}`;
  return `(${patterns.map((p) => `site:${p}`).join(' OR ')})`;
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
    const siteQueries = targetStores.map(getStoreSearchQuery).filter(Boolean);
    if (siteQueries.length === 0) {
      return NextResponse.json({ results: [], query, store: storeKey, total: 0 });
    }

    const siteFilter = siteQueries.length > 1 ? `(${siteQueries.join(' OR ')})` : siteQueries[0];
    const fullQuery = `${query.trim()} ${siteFilter}`;

    // Query DuckDuckGo Images
    const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(fullQuery)}&t=h_&iar=images&iax=images&ia=images`;
    const tokenRes = await fetch(tokenUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ results: [], query, store: storeKey, total: 0 });
    }

    const tokenHtml = await tokenRes.text();
    const vqdMatch = tokenHtml.match(/vqd=([0-9-]+)/) || tokenHtml.match(/vqd="([0-9-]+)"/);
    if (!vqdMatch) {
      return NextResponse.json({ results: [], query, store: storeKey, total: 0 });
    }

    const vqd = vqdMatch[1];
    const imgUrl = `https://duckduckgo.com/i.js?l=fr-fr&o=json&q=${encodeURIComponent(fullQuery)}&vqd=${vqd}&f=,,,`;

    const imgRes = await fetch(imgUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!imgRes.ok) {
      return NextResponse.json({ results: [], query, store: storeKey, total: 0 });
    }

    interface DDGResult {
      title?: string;
      image?: string;
      thumbnail?: string;
      url?: string;
      source?: string;
    }

    const data = await imgRes.json();
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
        // Skip any store that is disabled or not in targetStores (e.g. Amazon when disabled)
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

    return NextResponse.json({
      query,
      store: storeKey,
      total: results.length,
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur de recherche';
    return NextResponse.json({ error: message, results: [] }, { status: 500 });
  }
}
