import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: 'Format d URL invalide' }, { status: 400 });
    }

    const domain = parsedUrl.hostname.replace(/^www\./, '');

    // Protection anti-bot : Certains marchands (King Jouet avec DataDome, etc.)
    // bloquent les requêtes non-navigateur et bannissent temporairement l'IP du serveur/foyer.
    // Pour ces domaines, on évite le fetch direct côté serveur pour protéger l'IP publique.
    if (domain.includes('king-jouet')) {
      return NextResponse.json({
        title: 'Article King Jouet',
        image_url: '',
        description: '',
        price: null,
        store_name: 'King Jouet',
        product_url: parsedUrl.toString(),
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    }).catch(() => null);

    clearTimeout(timeout);

    if (!response || !response.ok) {
      // Fallback: return domain info
      const domain = parsedUrl.hostname.replace(/^www\./, '');
      return NextResponse.json({
        title: domain,
        image_url: '',
        description: '',
        price: null,
        store_name: domain.charAt(0).toUpperCase() + domain.slice(1),
        product_url: parsedUrl.toString(),
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Title extraction
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').first().text() ||
      '';

    // Image extraction
    let image_url =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[property="og:image:secure_url"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      '';

    if (image_url && !image_url.startsWith('http')) {
      image_url = new URL(image_url, parsedUrl.origin).toString();
    }

    // Description extraction
    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    // Store name extraction
    const site_name =
      $('meta[property="og:site_name"]').attr('content') ||
      parsedUrl.hostname.replace(/^www\./, '');

    // Price extraction
    let price: number | null = null;
    const priceMeta =
      $('meta[property="product:price:amount"]').attr('content') ||
      $('meta[property="og:price:amount"]').attr('content') ||
      $('meta[itemprop="price"]').attr('content');

    if (priceMeta) {
      const parsed = parseFloat(priceMeta.replace(',', '.'));
      if (!isNaN(parsed)) price = parsed;
    } else {
      // Fallback regex search for price pattern in text (e.g. "49.90 CHF" or "49,99 €")
      const priceMatch = html.match(/(\d+[\.,]\d{2})\s*(?:CHF|€|\$|EUR)/i);
      if (priceMatch && priceMatch[1]) {
        const parsed = parseFloat(priceMatch[1].replace(',', '.'));
        if (!isNaN(parsed)) price = parsed;
      }
    }

    return NextResponse.json({
      title: title.trim().replace(/\s+/g, ' '),
      image_url: image_url.trim(),
      description: description.trim().slice(0, 300),
      price: price,
      store_name: site_name.trim(),
      product_url: parsedUrl.toString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur scraping';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
