import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

function checkParentAuth(req: NextRequest, bodyPin?: string) {
  const pin = req.headers.get('x-pin') || bodyPin;
  const storedPin = (db.prepare('SELECT value FROM settings WHERE key = ?').get('parent_pin') as { value: string })?.value;
  return pin && pin === storedPin;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, pin, data } = body;

    if (!checkParentAuth(req, pin)) {
      return NextResponse.json({ error: 'Code PIN parent invalide' }, { status: 401 });
    }

    if (action === 'verify_pin') {
      return NextResponse.json({ success: true });
    }

    // Children management
    if (action === 'add_child') {
      const { name, avatar, color, birthdate } = data;
      const id = `child-${crypto.randomUUID()}`;
      db.prepare('INSERT INTO children (id, name, avatar, color, birthdate, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, name.trim(), avatar || '🌟', color || '#0071e3', birthdate || null, new Date().toISOString());
      return NextResponse.json({ success: true, id });
    }

    if (action === 'delete_child') {
      db.prepare('DELETE FROM children WHERE id = ?').run(data.id);
      db.prepare('DELETE FROM gifts WHERE child_id = ?').run(data.id);
      return NextResponse.json({ success: true });
    }

    // Occasions management
    if (action === 'add_occasion') {
      const { title, type, year } = data;
      const id = `occ-${crypto.randomUUID()}`;
      db.prepare('INSERT INTO occasions (id, title, type, year, is_active, created_at) VALUES (?, ?, ?, ?, 1, ?)')
        .run(id, title.trim(), type || 'christmas', parseInt(year) || new Date().getFullYear(), new Date().toISOString());
      return NextResponse.json({ success: true, id });
    }

    if (action === 'delete_occasion') {
      db.prepare('DELETE FROM occasions WHERE id = ?').run(data.id);
      db.prepare('DELETE FROM gifts WHERE occasion_id = ?').run(data.id);
      return NextResponse.json({ success: true });
    }

    // Stores management
    if (action === 'toggle_store') {
      db.prepare('UPDATE stores SET is_enabled = CASE WHEN is_enabled = 1 THEN 0 ELSE 1 END WHERE id = ?').run(data.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'add_store') {
      const { name, domain, search_url, icon, category } = data;
      const id = `store-${crypto.randomUUID()}`;
      db.prepare('INSERT INTO stores (id, name, domain, search_url, icon, category, is_enabled) VALUES (?, ?, ?, ?, ?, ?, 1)')
        .run(id, name.trim(), domain.trim(), search_url.trim(), icon || '🛒', category || 'Boutique', 1);
      return NextResponse.json({ success: true, id });
    }

    // General settings
    if (action === 'update_settings') {
      const { parent_pin, family_name, currency, share_token } = data;
      if (parent_pin) db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(parent_pin, 'parent_pin');
      if (family_name) db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(family_name, 'family_name');
      if (currency) db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(currency, 'currency');
      if (share_token) db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(share_token, 'share_token');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur gestion parent';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
