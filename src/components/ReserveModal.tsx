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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 flex flex-col relative shadow-2xl border-t sm:border border-zinc-200/80 dark:border-zinc-800 animate-slide-up sm:animate-apple-appear pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        {/* Grab bar indicator on mobile */}
        <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 apple-press bg-zinc-100 dark:bg-zinc-800 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
          <GiftIcon className="w-5 h-5" />
        </div>

        <h3 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight mb-1">
          Réserver ce cadeau
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Pour : <strong className="text-zinc-800 dark:text-zinc-200">{gift.child_name}</strong> • &quot;{gift.title}&quot;
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Votre prénom ou signature *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Papi Jean, Marraine..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-transparent focus:border-blue-500 text-xs sm:text-sm text-zinc-900 dark:text-white outline-none font-normal"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Message ou note privée pour les parents (optionnel)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Je le commande cette semaine..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-transparent focus:border-blue-500 text-xs text-zinc-900 dark:text-white outline-none font-normal resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 apple-press transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 apple-press disabled:opacity-50 transition-colors cursor-pointer"
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
