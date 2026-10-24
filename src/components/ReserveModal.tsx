'use client';

import React, { useState } from 'react';
import { X, Gift as GiftIcon, Loader2 } from 'lucide-react';
import { Gift } from '@/types';

interface ReserveModalProps {
  isOpen: boolean;
  onClose: () => void;
  gift: Gift | null;
  shareToken: string;
  onReserved: () => void;
}

export default function ReserveModal({
  isOpen,
  onClose,
  gift,
  shareToken,
  onReserved,
}: ReserveModalProps) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !gift) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Veuillez indiquer votre prénom ou signature');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gift_id: gift.id,
          action: 'reserve',
          name: name.trim(),
          note: note.trim() || null,
          token: shareToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la réservation');
      }

      onReserved();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md m3-dialog rounded-t-[28px] sm:rounded-[28px] p-6 sm:p-7 flex flex-col relative border border-[var(--md-sys-color-outline-variant)] animate-slide-up sm:animate-m3-appear pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        {/* Grab bar indicator on mobile */}
        <div className="m3-drag-handle sm:hidden" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 m3-icon-btn cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-on-primary-container)] mb-3">
          <GiftIcon className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-medium text-[var(--md-sys-color-on-surface)] tracking-tight mb-1">
          Réserver ce cadeau
        </h3>
        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-4">
          Pour : <strong className="text-[var(--md-sys-color-on-surface)]">{gift.child_name}</strong> • &quot;{gift.title}&quot;
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--md-sys-color-on-surface)] block mb-1">
              Votre prénom ou signature *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Papi Jean, Marraine..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] focus:border-[var(--md-sys-color-primary)] text-xs sm:text-sm text-[var(--md-sys-color-on-surface)] outline-none font-normal"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--md-sys-color-on-surface)] block mb-1">
              Message ou note privée pour les parents (optionnel)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Je le commande cette semaine..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] focus:border-[var(--md-sys-color-primary)] text-xs text-[var(--md-sys-color-on-surface)] outline-none font-normal resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="m3-btn-filled px-5 py-2.5 text-xs font-medium gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shadow-[var(--md-elevation-1)]"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Confirmer la réservation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
