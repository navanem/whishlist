import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

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

const STORE_DOMAINS: Record<string, { query: string; name: string; icon: string }> = {
  lego: { query: 'site:lego.com', name: 'Lego Store', icon: '🧱' },
  fnac: { query: '(site:fnac.ch OR site:fnac.com)', name: 'Fnac', icon: '📚' },
  smyths: { query: 'site:smythstoys.com', name: 'Smyths Toys', icon: '🧸' },
  galaxus: { query: '(site:galaxus.ch OR site:digitec.ch)', name: 'Galaxus', icon: '🛍️' },
  kingjouet: { query: '(site:king-jouet.ch OR site:king-jouet.com)', name: 'King Jouet', icon: '👑' },
  oxybul: { query: '(site:idkids.fr OR site:oxybul.com)', name: 'Oxybul', icon: '🎨' },
  decathlon: { query: '(site:decathlon.ch OR site:decathlon.fr)', name: 'Decathlon', icon: '🚲' },
  amazon: { query: '(site:amazon.fr OR site:amazon.de)', name: 'Amazon', icon: '📦' },
};

const ALL_STORES_FILTER =
  '(site:lego.com OR site:fnac.com OR site:fnac.ch OR site:smythstoys.com OR site:galaxus.ch OR site:king-jouet.com OR site:king-jouet.ch OR site:idkids.fr OR site:oxybul.com OR site:decathlon.ch OR site:amazon.fr)';

function identifyStore(url: string, title: string): { name: string; icon: string; domain: string } {
  const u = (url || '').toLowerCase();
  const t = (title || '').toLowerCase();

  if (u.includes('lego.com') || t.includes('boutique lego')) {
    return { name: 'Lego Store', icon: '🧱', domain: 'lego.com' };
  }
  if (u.includes('fnac.')) {
    return { name: 'Fnac', icon: '📚', domain: 'fnac.com' };
  }
  if (u.includes('smythstoys.')) {
    return { name: 'Smyths Toys', icon: '🧸', domain: 'smythstoys.com' };
  }
  if (u.includes('galaxus.') || u.includes('digitec.')) {
    return { name: 'Galaxus', icon: '🛍️', domain: 'galaxus.ch' };
  }
  if (u.includes('king-jouet.')) {
    return { name: 'King Jouet', icon: '👑', domain: 'king-jouet.com' };
  }
  if (u.includes('idkids.') || u.includes('oxybul.')) {
    return { name: 'Oxybul', icon: '🎨', domain: 'idkids.fr' };
  }
  if (u.includes('decathlon.')) {
    return { name: 'Decathlon', icon: '🚲', domain: 'decathlon.ch' };
  }
  if (u.includes('amazon.')) {
    return { name: 'Amazon', icon: '📦', domain: 'amazon.fr' };
  }

  return { name: 'Boutique en ligne', icon: '🎁', domain: '' };
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
    .replace(/: Amazon\.fr.*$/gi, '')
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
      return NextResponse.json({ results: [] });
    }

    // Determine domain filter
    let siteFilter = ALL_STORES_FILTER;
    if (storeKey && storeKey !== 'all' && STORE_DOMAINS[storeKey]) {
      siteFilter = STORE_DOMAINS[storeKey].query;
    }

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
      return NextResponse.json({ results: [] });
    }

    const tokenHtml = await tokenRes.text();
    const vqdMatch = tokenHtml.match(/vqd=([0-9-]+)/) || tokenHtml.match(/vqd="([0-9-]+)"/);
    if (!vqdMatch) {
      return NextResponse.json({ results: [] });
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
      return NextResponse.json({ results: [] });
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
      seenUrls.add(productUrl);

      const store = identifyStore(productUrl, rawTitle);
      const title = cleanTitle(rawTitle);
      const price = extractPrice(rawTitle);

      results.push({
        id: `search-${i}-${Date.now()}`,
        title: title || rawTitle,
        image_url: imageUrl,
        product_url: productUrl,
        store_name: storeKey !== 'all' && STORE_DOMAINS[storeKey] ? STORE_DOMAINS[storeKey].name : store.name,
        store_icon: storeKey !== 'all' && STORE_DOMAINS[storeKey] ? STORE_DOMAINS[storeKey].icon : store.icon,
        domain: store.domain,
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
