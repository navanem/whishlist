import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { sanitizeHttpUrl } from '@/lib/auth-guard';

function extractStoreName(hostname: string): string {
  const h = hostname.toLowerCase().replace(/^www\./, '');
  if (h.includes('king-jouet')) return 'King Jouet';
  if (h.includes('galaxus')) return 'Galaxus';
  if (h.includes('digitec')) return 'Digitec';
  if (h.includes('fnac')) return 'Fnac';
  if (h.includes('smythstoys') || h.includes('smyths')) return 'Smyths Toys';
  if (h.includes('decathlon')) return 'Decathlon';
  if (h.includes('lego')) return 'Lego Store';
  if (h.includes('amazon')) return 'Amazon';
  if (h.includes('idkids') || h.includes('oxybul')) return 'Oxybul';
  if (h.includes('manor')) return 'Manor';
  if (h.includes('melectronics')) return 'melectronics';
  if (h.includes('interdiscount')) return 'Interdiscount';
  if (h.includes('brack')) return 'Brack.ch';
  const clean = h.split('.')[0];
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function extractKeywordsFromUrl(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    const parts = u.pathname.split('/').filter(Boolean);
    const candidates = parts.filter(
      (p) =>
        p.length > 3 &&
        !/^[0-9]+$/.test(p) &&
        !/^(p|ref|article|product|item|dp|_|fr|de|en|ch|es|it|r-p-\d+)$/i.test(p)
    );
    const best = candidates.pop() || parts.pop() || '';
    const clean = best
      .replace(/\.(html?|php|aspx?)$/i, '')
      .replace(/^ref-\d+-/i, '')
      .replace(/^R-p-\d+/i, '')
      .replace(/-\d+$/i, '')
      .replace(/[_\/-]+/g, ' ')
      .trim();

    return clean
      .split(' ')
      .filter((w) => w.length > 1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  } catch {
    return '';
  }
}

function extractPriceFromHtml(html: string, $: cheerio.CheerioAPI): number | null {
  // 1. JSON-LD scripts
  try {
    const scripts = $('script[type="application/ld+json"]');
    for (let i = 0; i < scripts.length; i++) {
      const raw = $(scripts[i]).html();
      if (!raw) continue;
      try {
        const data = JSON.parse(raw);
        const items = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data];
        for (const item of items) {
          if (item['@type'] === 'Product' || item.offers) {
            const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers;
            if (offers) {
              const val = offers.price ?? offers.lowPrice ?? offers.priceSpecification?.price;
              if (val !== undefined && val !== null) {
                const p = parseFloat(String(val).replace(',', '.').replace(/[^0-9.]/g, ''));
                if (!isNaN(p) && p > 0 && p < 10000) return p;
              }
            }
          }
        }
      } catch {
        // continue
      }
    }
  } catch {
    // continue
  }

  // 2. OpenGraph & Microdata meta tags
  const metaPrice =
    $('meta[property="product:price:amount"]').attr('content') ||
    $('meta[property="og:price:amount"]').attr('content') ||
    $('meta[itemprop="price"]').attr('content') ||
    $('[itemprop="price"]').attr('content') ||
    $('[itemprop="price"]').first().text() ||
    $('[data-price]').attr('data-price') ||
    $('[data-product-price]').attr('data-product-price');

  if (metaPrice) {
    const clean = metaPrice.replace(/[^0-9.,]/g, '').replace(',', '.');
    const p = parseFloat(clean);
    if (!isNaN(p) && p > 0 && p < 10000) return p;
  }

  // 3. Known e-commerce CSS selectors
  const selectors = [
    '.a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    'span.a-price-whole',
    '.f-priceBox__price',
    '.userPrice',
    '.f-price',
    '.price_point',
    '.js-product-price',
    '[data-test="product-price"]',
    '.prc__active-price',
    '.product-price',
    '.fiche-produit-prix',
    '.price',
  ];

  for (const sel of selectors) {
    const el = $(sel).first();
    const txt = el.text() || el.attr('content') || '';
    if (txt) {
      const m = txt.match(/(\d+([.,]\d{1,2})?)/);
      if (m && m[1]) {
        const p = parseFloat(m[1].replace(',', '.'));
        if (!isNaN(p) && p > 0 && p < 10000) return p;
      }
    }
  }

  // 4. Regex patterns for text (CHF, €, EUR)
  const patterns = [
    /(?:CHF|€|\$|EUR)\s*(\d+([.,]\d{1,2})?)/i,
    /(\d+([.,]\d{1,2})?)\s*(?:CHF|€|\$|EUR)/i,
    /(\d+)\.-\s*(?:CHF)?/i,
    /(\d+)\s*(?:CHF|€)/i,
  ];

  for (const pat of patterns) {
    const m = html.match(pat);
    if (m && m[1]) {
      const p = parseFloat(m[1].replace(',', '.'));
      if (!isNaN(p) && p > 0 && p < 10000) return p;
    }
  }

  return null;
}

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
    const storeName = extractStoreName(parsedUrl.hostname);
    const slugTitle = extractKeywordsFromUrl(parsedUrl.toString());

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Cache-Control': 'no-cache',
      },
    }).catch(() => null);

    clearTimeout(timeout);

    // If direct fetch was blocked by anti-bot or returned 403 / captcha:
    if (!response || !response.ok) {
      return NextResponse.json({
        title: slugTitle || storeName,
        image_url: '',
        description: '',
        price: null,
        store_name: storeName,
        product_url: parsedUrl.toString(),
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Title extraction
    const ogTitle =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('#productTitle').first().text() ||
      $('h1').first().text() ||
      $('title').first().text() ||
      '';

    const cleanTitle = (ogTitle || slugTitle || storeName)
      .replace(/\s+/g, ' ')
      .replace(/\|.*$/g, '')
      .replace(/- Achat.*$/gi, '')
      .replace(/- Fnac.*$/gi, '')
      .trim();

    // Image extraction
    let image_url =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[property="og:image:secure_url"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('#landingImage').attr('src') ||
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

    // Robust Price extraction
    const price = extractPriceFromHtml(html, $);

    return NextResponse.json({
      title: cleanTitle,
      image_url: sanitizeHttpUrl(image_url.trim()),
      description: description.trim().slice(0, 300),
      price: price,
      store_name: storeName,
      product_url: parsedUrl.toString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur scraping';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
