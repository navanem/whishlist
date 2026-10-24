import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';
import {
  getClientIp,
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  sanitizeHttpUrl,
} from '@/lib/auth-guard';

function verifyPinAuth(req: NextRequest, bodyPin?: string) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);

  if (rateLimit.blocked) {
    const minutes = Math.ceil(rateLimit.remainingSeconds / 60);
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          error: `Trop d'essais infructueux. Accès bloqué pendant encore ${minutes} minute(s).`,
          locked: true,
          remainingSeconds: rateLimit.remainingSeconds,
        },
        { status: 429 }
      ),
    };
  }

  const pin = req.headers.get('x-pin') || bodyPin;
  const storedPin = (db.prepare('SELECT value FROM settings WHERE key = ?').get('parent_pin') as { value: string })?.value;

  if (!pin || pin !== storedPin) {
    const attempt = recordFailedAttempt(ip);
    if (attempt.isBlocked) {
      return {
        authenticated: false,
        response: NextResponse.json(
          {
            error: `Code PIN incorrect. Vous avez atteint le nombre maximal d'essais (5). Accès bloqué pendant ${attempt.lockoutMinutes} minutes.`,
            locked: true,
          },
          { status: 429 }
        ),
      };
    }
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          error: `Code PIN incorrect. Il vous reste ${attempt.remainingAttempts} essai(s).`,
          remainingAttempts: attempt.remainingAttempts,
        },
        { status: 401 }
      ),
    };
  }

  recordSuccessfulAttempt(ip);
  return { authenticated: true };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, pin, data } = body;

    const authCheck = verifyPinAuth(req, pin);
    if (!authCheck.authenticated) {
      return authCheck.response!;
    }

    if (action === 'verify_pin') {
      return NextResponse.json({ success: true });
    }

    // Export full backup
    if (action === 'export_backup') {
      const backupData = db.getBackup();
      return NextResponse.json({
        success: true,
        backup: backupData,
        exported_at: new Date().toISOString(),
      });
    }

    // Restore full backup
    if (action === 'import_backup') {
      if (!data || typeof data !== 'object') {
        return NextResponse.json({ error: 'Fichier de sauvegarde invalide.' }, { status: 400 });
      }
      const restored = db.restoreBackup(data);
      if (!restored) {
        return NextResponse.json({ error: 'Échec de la restauration des données.' }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Sauvegarde restaurée avec succès.' });
    }

    // Apply store preset by country
    if (action === 'apply_store_preset') {
      const { country } = data;
      if (country === 'france' || country === 'suisse' || country === 'international') {
        db.applyStorePreset(country);
        return NextResponse.json({ success: true, message: `Magasins mis à jour pour : ${country}` });
      }
      return NextResponse.json({ error: 'Pays inconnu pour le preset magasins.' }, { status: 400 });
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
      const cleanUrl = sanitizeHttpUrl(search_url) || search_url.trim();
      db.prepare('INSERT INTO stores (id, name, domain, search_url, icon, category, is_enabled) VALUES (?, ?, ?, ?, ?, ?, 1)')
        .run(id, name.trim(), domain.trim(), cleanUrl, icon || '🛒', category || 'Boutique', 1);
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
