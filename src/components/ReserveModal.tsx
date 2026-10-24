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
      setError('Veuillez indiquer votre prénom ou surnom');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md apple-glass rounded-[2rem] p-7 flex flex-col relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 apple-press"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
          <GiftIcon className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight mb-1">
          Je m&apos;occupe de ce cadeau !
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Pour : <strong className="text-zinc-700 dark:text-zinc-200">{gift.child_name}</strong> • &quot;{gift.title}&quot;
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
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
              autoFocus
              placeholder="Ex: Papi & Mamie, Tonton Marc, Marraine Sophie..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Message secret pour les parents (optionnel)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Commandé sur internet, je l'apporte le 24 au soir !"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] leading-relaxed">
            ✨ Ce cadeau sera marqué comme réservé pour que d&apos;autres membres de la famille ne l&apos;achètent pas en double. Les enfants ne voient pas les réservations pour garder toute la magie !
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 apple-press shadow-sm"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer que je l\'offre 🎁'}
          </button>
        </form>
      </div>
    </div>
  );
}
