import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'child';
    const pin = req.headers.get('x-pin') || searchParams.get('pin');
    const token = searchParams.get('token');

    // Retrieve settings
    const settingsRows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
    const settings: Record<string, string> = {};
    for (const r of settingsRows) {
      settings[r.key] = r.value;
    }

    const isParentAuthenticated = mode === 'parent' && pin === settings.parent_pin;
    const isFamilyAuthenticated = mode === 'family' && token === settings.share_token;

    // Children
    const children = db.prepare('SELECT * FROM children ORDER BY name ASC').all();

    // Occasions
    const occasions = db.prepare('SELECT * FROM occasions ORDER BY year DESC, title ASC').all();

    // Stores
    const stores = db.prepare('SELECT * FROM stores WHERE is_enabled = 1 ORDER BY name ASC').all();

    // Gifts
    const rawGifts = db.prepare(`
      SELECT g.*, c.name as child_name, c.avatar as child_avatar, c.color as child_color, o.title as occasion_title
      FROM gifts g
      JOIN children c ON g.child_id = c.id
      JOIN occasions o ON g.occasion_id = o.id
      ORDER BY g.is_favorite DESC, g.priority DESC, g.created_at DESC
    `).all() as Array<Record<string, unknown>>;

    // Sanitize gifts according to viewer mode
    const gifts = rawGifts.map((gift) => {
      if (isParentAuthenticated) {
        // Full access to status, reserved_by, private notes
        return gift;
      }

      if (isFamilyAuthenticated) {
        // Family members can see if it's available or reserved
        return {
          ...gift,
          // They can see who reserved it so relatives coordinate
          status: gift.status === 'idea' ? 'available' : 'reserved',
          reserved_by: gift.reserved_by || null,
          private_note: undefined, // keep private notes hidden
        };
      }

      // Default: Child Mode
      // Never reveal reservation or purchase status to preserve Christmas & birthday magic!
      return {
        ...gift,
        status: 'idea',
        reserved_by: undefined,
        reserved_at: undefined,
        private_note: undefined,
      };
    });

    // Public settings to return (never return actual parent_pin in payload)
    const publicSettings = {
      family_name: settings.family_name || 'Notre Famille',
      currency: settings.currency || 'CHF',
      share_token: isParentAuthenticated ? settings.share_token : undefined,
    };

    return NextResponse.json({
      authenticatedAs: isParentAuthenticated ? 'parent' : isFamilyAuthenticated ? 'family' : 'child',
      children,
      occasions,
      stores,
      gifts,
      settings: publicSettings,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur chargement données';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
