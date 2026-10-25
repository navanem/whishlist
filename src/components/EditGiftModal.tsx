'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Trash2, Heart } from 'lucide-react';
import { Gift, Child, Occasion } from '@/types';

interface EditGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  gift: Gift | null;
  childrenList: Child[];
  occasionsList: Occasion[];
  parentPin?: string;
  onGiftUpdated: () => void;
  onDelete?: (giftId: string) => void;
}

export default function EditGiftModal({
  isOpen,
  onClose,
  gift,
  childrenList,
  occasionsList,
  parentPin,
  onGiftUpdated,
  onDelete,
}: EditGiftModalProps) {
  const [childId, setChildId] = useState('');
  const [occasionId, setOccasionId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priority, setPriority] = useState<number>(2);
  const [storeName, setStoreName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (gift && isOpen) {
      setChildId(gift.child_id);
      setOccasionId(gift.occasion_id);
      setTitle(gift.title || '');
      setDescription(gift.description || '');
      setPrice(gift.price !== null && gift.price !== undefined ? String(gift.price) : '');
      setPriority(gift.priority || 2);
      setStoreName(gift.store_name || '');
      setProductUrl(gift.product_url || '');
      setImageUrl(gift.image_url || '');
      setError(null);
    }
  }, [gift, isOpen]);

  if (!isOpen || !gift) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !childId || !occasionId) {
      setError("Veuillez renseigner le titre, l'enfant et l'événement.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const parsedPrice = price.trim() ? parseFloat(price.replace(',', '.')) : null;

      const res = await fetch('/api/gifts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: gift.id,
          child_id: childId,
          occasion_id: occasionId,
          title: title.trim(),
          description: description.trim() || null,
          price: !isNaN(parsedPrice as number) ? parsedPrice : null,
          priority,
          is_favorite: priority === 3 ? 1 : 0,
          store_name: storeName.trim() || null,
          product_url: productUrl.trim() || null,
          image_url: imageUrl.trim() || null,
          pin: parentPin || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      onGiftUpdated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de mise à jour';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && gift) {
      onClose();
      onDelete(gift.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl m3-dialog rounded-t-[28px] sm:rounded-[28px] p-5 sm:p-7 flex flex-col relative max-h-[92dvh] overflow-y-auto border border-[var(--md-sys-color-outline-variant)] animate-slide-up sm:animate-m3-appear pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        {/* Grab bar indicator on mobile */}
        <div className="m3-drag-handle sm:hidden" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 m3-icon-btn cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pr-10 mb-4">
          <h3 className="text-xl font-bold text-[var(--md-sys-color-on-surface)] tracking-tight">
            Modifier le cadeau
          </h3>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Réaffectez l&apos;enfant, la liste ou modifiez le prix et les détails.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Destination: Enfant & Événement */}
          <div className="p-3.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
                Pour l&apos;enfant :
              </label>
              <select
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer min-h-[38px]"
              >
                {childrenList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.avatar} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--md-sys-color-on-surface)]">
                Liste / Événement :
              </label>
              <select
                value={occasionId}
                onChange={(e) => setOccasionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-xs font-semibold text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer min-h-[38px]"
              >
                {occasionsList.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Titre */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--md-sys-color-on-surface)]">
              Titre du cadeau *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-xs sm:text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)] font-medium"
            />
          </div>

          {/* Prix & Magasin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--md-sys-color-on-surface)]">
                Prix estimé (CHF)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  placeholder="29.90"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-xs sm:text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)] font-medium"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-[var(--md-sys-color-on-surface-variant)] font-semibold">
                  CHF
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--md-sys-color-on-surface)]">
                Boutique / Enseigne
              </label>
              <input
                type="text"
                placeholder="Galaxus, Fnac, King Jouet..."
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-xs sm:text-sm text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)] font-medium"
              />
            </div>
          </div>

          {/* Envie / Priorité */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--md-sys-color-on-surface)]">
              Niveau d&apos;envie
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority(1)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  priority === 1
                    ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                    : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                <span>💡</span>
                <span>Petite idée</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority(2)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  priority === 2
                    ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                    : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                <span>⭐</span>
                <span>Super envie</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority(3)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  priority === 3
                    ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                    : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-current text-[var(--md-sys-color-primary)]" />
                <span>Coup de cœur</span>
              </button>
            </div>
          </div>

          {/* Lien du produit */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--md-sys-color-on-surface)]">
              Lien vers le site marchand (URL)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)] font-medium font-mono"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--md-sys-color-on-surface)]">
              Remarque ou précision (taille, couleur...)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-xs text-[var(--md-sys-color-on-surface)] outline-none focus:border-[var(--md-sys-color-primary)] font-medium resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--md-sys-color-outline-variant)] gap-3">
            {onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-primary)] text-white hover:opacity-95 shadow-xs cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
