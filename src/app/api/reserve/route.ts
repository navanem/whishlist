import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gift_id, action, name, note, token, pin } = body;

    if (!gift_id) {
      return NextResponse.json({ error: 'ID du cadeau requis' }, { status: 400 });
    }

    // Check token or pin
    const settings = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
    const shareToken = settings.find((s) => s.key === 'share_token')?.value;
    const parentPin = settings.find((s) => s.key === 'parent_pin')?.value;

    const isAuthorized = token === shareToken || pin === parentPin;
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Lien ou autorisation invalide' }, { status: 403 });
    }

    const gift = db.prepare('SELECT * FROM gifts WHERE id = ?').get(gift_id) as Record<string, unknown> | undefined;
    if (!gift) {
      return NextResponse.json({ error: 'Cadeau introuvable' }, { status: 404 });
    }

    if (action === 'reserve') {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Veuillez indiquer votre prénom ou surnom (ex: Papi & Mamie)' }, { status: 400 });
      }

      db.prepare(`
        UPDATE gifts
        SET status = 'reserved', reserved_by = ?, reserved_at = ?, private_note = ?
        WHERE id = ?
      `).run(name.trim(), new Date().toISOString(), note?.trim() || null, gift_id);

      const updated = db.prepare('SELECT * FROM gifts WHERE id = ?').get(gift_id);
      return NextResponse.json({ success: true, message: `Merci ! Le cadeau est maintenant réservé pour ${name.trim()}.`, gift: updated });
    } else if (action === 'unreserve') {
      db.prepare(`
        UPDATE gifts
        SET status = 'idea', reserved_by = NULL, reserved_at = NULL, private_note = NULL
        WHERE id = ?
      `).run(gift_id);

      const updated = db.prepare('SELECT * FROM gifts WHERE id = ?').get(gift_id);
      return NextResponse.json({ success: true, message: 'La réservation a été annulée.', gift: updated });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur réservation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
