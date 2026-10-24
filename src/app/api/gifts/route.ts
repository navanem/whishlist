import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';
import { sanitizeHttpUrl } from '@/lib/auth-guard';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
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
    } = body;

    if (!child_id || !occasion_id || !title?.trim()) {
      return NextResponse.json({ error: 'Champs obligatoires manquants (enfant, occasion, titre)' }, { status: 400 });
    }

    const id = `gift-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO gifts (
        id, child_id, occasion_id, title, description, image_url, product_url, store_name, price, currency, priority, is_favorite, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const cleanImageUrl = sanitizeHttpUrl(image_url);
    const cleanProductUrl = sanitizeHttpUrl(product_url);

    stmt.run(
      id,
      child_id,
      occasion_id,
      title.trim(),
      description?.trim() || null,
      cleanImageUrl,
      cleanProductUrl,
      store_name?.trim() || null,
      typeof price === 'number' ? price : price ? parseFloat(price) : null,
      currency || 'CHF',
      priority || 2,
      is_favorite ? 1 : 0,
      'idea',
      now
    );

    const created = db.prepare('SELECT * FROM gifts WHERE id = ?').get(id);
    return NextResponse.json({ gift: created }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur ajout cadeau';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, pin, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID du cadeau manquant' }, { status: 400 });
    }

    const current = db.prepare('SELECT * FROM gifts WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!current) {
      return NextResponse.json({ error: 'Cadeau introuvable' }, { status: 404 });
    }

    // Verify if updating parent-protected fields (status, reserved_by, price)
    const storedPin = (db.prepare('SELECT value FROM settings WHERE key = ?').get('parent_pin') as { value: string })?.value;
    const isParent = pin === storedPin;

    const allowedFields = isParent
      ? ['title', 'description', 'image_url', 'product_url', 'store_name', 'price', 'currency', 'priority', 'is_favorite', 'status', 'reserved_by', 'private_note', 'child_id', 'occasion_id']
      : ['priority', 'is_favorite']; // children can change priority and favorite on their wishes

    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const field of allowedFields) {
      if (field in updates) {
        setClauses.push(`${field} = ?`);
        let val = updates[field];
        if (field === 'is_favorite') val = val ? 1 : 0;
        if (field === 'price') val = val ? parseFloat(val) : null;
        if (field === 'product_url' || field === 'image_url') val = sanitizeHttpUrl(val as string);
        values.push(val);
      }
    }

    if (setClauses.length > 0) {
      values.push(id);
      db.prepare(`UPDATE gifts SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM gifts WHERE id = ?').get(id);
    return NextResponse.json({ gift: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur modification cadeau';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const pin = req.headers.get('x-pin') || searchParams.get('pin');

    const storedPin = (db.prepare('SELECT value FROM settings WHERE key = ?').get('parent_pin') as { value: string })?.value;
    if (pin !== storedPin) {
      return NextResponse.json({ error: 'Code PIN parent requis pour supprimer un cadeau' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    db.prepare('DELETE FROM gifts WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur suppression cadeau';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
