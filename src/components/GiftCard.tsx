'use client';

import React, { useState } from 'react';
import { ExternalLink, Trash2, Heart, CheckCircle2, Clock3, Gift as GiftIcon, Pencil } from 'lucide-react';
import { Gift } from '@/types';

interface GiftCardProps {
  gift: Gift;
  mode: 'child' | 'parent' | 'family';
  parentPin?: string;
  onStatusChange?: (giftId: string, status: string) => void;
  onDelete?: (giftId: string) => void;
  onEdit?: (gift: Gift) => void;
  onReserveClick?: (gift: Gift) => void;
  onUnreserveClick?: (giftId: string) => void;
}

export default function GiftCard({
  gift,
  mode,
  onStatusChange,
  onDelete,
  onEdit,
  onReserveClick,
  onUnreserveClick,
}: GiftCardProps) {
  const [imageError, setImageError] = useState(false);

  // Safe price calculation (handles number, string, null, undefined)
  const rawPrice = gift.price;
  let numericPrice: number | null = null;
  if (typeof rawPrice === 'number' && !isNaN(rawPrice)) {
    numericPrice = rawPrice;
  } else if (typeof rawPrice === 'string' && (rawPrice as string).trim() !== '') {
    const p = parseFloat((rawPrice as string).replace(',', '.').replace(/[^0-9.]/g, ''));
    if (!isNaN(p)) numericPrice = p;
  }
  const currency = gift.currency || 'CHF';
  const formattedPrice = numericPrice !== null && numericPrice > 0
    ? `${numericPrice.toFixed(2)} ${currency}`
    : null;

  const statusBadge = () => {
    switch (gift.status) {
      case 'bought':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
            Acheté
          </span>
        );
      case 'received':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] border border-[var(--md-sys-color-tertiary)]/20">
            <GiftIcon className="w-3.5 h-3.5" />
            Reçu / Emballé
          </span>
        );
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)]/20">
            <Clock3 className="w-3.5 h-3.5" />
            Réservé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
            Idée
          </span>
        );
    }
  };

  return (
    <div className="m3-card-outlined overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Card Media Header */}
        <div className="relative aspect-[16/10] sm:aspect-4/3 w-full bg-[var(--md-sys-color-surface-container-high)] overflow-hidden flex items-center justify-center">
          {gift.image_url && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gift.image_url}
              alt={gift.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[var(--md-sys-color-on-surface-variant)] p-8 text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center">
                <GiftIcon className="w-7 h-7 stroke-[1.5] text-[var(--md-sys-color-primary)]" />
              </div>
              <span className="text-xs font-medium">{gift.store_name || 'Cadeau'}</span>
            </div>
          )}

          {/* Child & Occasion Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10 max-w-[70%]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--md-sys-color-surface)]/95 text-[var(--md-sys-color-on-surface)] text-xs font-semibold shadow-xs border border-[var(--md-sys-color-outline-variant)]">
              <span className="text-sm">{gift.child_avatar}</span>
              <span>{gift.child_name}</span>
            </div>
            {gift.occasion_title && (
              <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--md-sys-color-surface-container)]/95 text-[var(--md-sys-color-on-surface-variant)] text-[11px] font-medium shadow-xs border border-[var(--md-sys-color-outline-variant)]">
                <span>{gift.occasion_title}</span>
              </div>
            )}
          </div>

          {/* Priority Favorite Icon */}
          {gift.priority === 3 && (
            <div
              className="absolute top-3 right-3 p-2 rounded-full bg-[var(--md-sys-color-surface)]/95 text-[var(--md-sys-color-primary)] shadow-[var(--md-elevation-1)] border border-[var(--md-sys-color-outline-variant)]"
              title="Coup de cœur"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
            </div>
          )}

          {/* Price Tag Chip on Image */}
          {formattedPrice && (
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-[var(--md-sys-color-surface-container-lowest)]/95 text-[var(--md-sys-color-on-surface)] text-xs font-bold shadow-[var(--md-elevation-1)] border border-[var(--md-sys-color-outline-variant)]">
              {formattedPrice}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5 space-y-2.5">
          <div>
            <h4 className="font-semibold text-base text-[var(--md-sys-color-on-surface)] leading-snug">
              {gift.title}
            </h4>

            {/* Prominent Price & Store Row */}
            <div className="flex items-center justify-between gap-2 pt-1.5 pb-0.5">
              {formattedPrice ? (
                <div className="inline-flex items-baseline gap-1">
                  <span className="text-base font-extrabold text-[var(--md-sys-color-primary)]">
                    {formattedPrice}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs text-[var(--md-sys-color-on-surface-variant)] italic">
                  <span>Prix non renseigné</span>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(gift)}
                      className="text-[11px] font-semibold text-[var(--md-sys-color-primary)] hover:underline not-italic cursor-pointer"
                    >
                      + Ajouter
                    </button>
                  )}
                </div>
              )}

              {gift.store_name && (
                <span className="text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)] px-2.5 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] truncate max-w-[140px]">
                  {gift.store_name}
                </span>
              )}
            </div>

            {gift.description && (
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] line-clamp-2 leading-relaxed mt-1">
                {gift.description}
              </p>
            )}
          </div>

          {/* PARENT MODE SECRET STATS */}
          {mode === 'parent' && (
            <div className="pt-3 border-t border-[var(--md-sys-color-outline-variant)] space-y-2 animate-m3-appear">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)]">Suivi secret :</span>
                {statusBadge()}
              </div>

              {gift.reserved_by && (
                <div className="p-2.5 rounded-xl bg-[var(--md-sys-color-primary-container)]/50 border border-[var(--md-sys-color-primary)]/20 text-xs text-[var(--md-sys-color-on-primary-container)] space-y-0.5">
                  <div className="font-medium">
                    Réservé par : {gift.reserved_by}
                  </div>
                  {gift.private_note && (
                    <div className="text-[11px] opacity-80 italic">
                      &quot;{gift.private_note}&quot;
                    </div>
                  )}
                </div>
              )}

              {/* Status Action Buttons for Parents (M3 Segmented Button) */}
              <div className="grid grid-cols-4 gap-1 pt-1 p-0.5 bg-[var(--md-sys-color-surface-container)] rounded-xl border border-[var(--md-sys-color-outline-variant)]">
                {(['idea', 'reserved', 'bought', 'received'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => onStatusChange && onStatusChange(gift.id, st)}
                    className={`py-1.5 text-[11px] font-medium rounded-lg transition-colors cursor-pointer ${
                      gift.status === st
                        ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-[var(--md-elevation-1)]'
                        : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                    }`}
                  >
                    {st === 'idea' && 'Idée'}
                    {st === 'reserved' && 'Réservé'}
                    {st === 'bought' && 'Acheté'}
                    {st === 'received' && 'Reçu'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FAMILY MODE STATUS INFO */}
          {mode === 'family' && (
            <div className="pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
              {gift.status === 'reserved' ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">Réservé {gift.reserved_by ? `par ${gift.reserved_by}` : ''}</span>
                  </div>
                  {onUnreserveClick && (
                    <button
                      onClick={() => onUnreserveClick(gift.id)}
                      className="text-[11px] text-[var(--md-sys-color-primary)] hover:underline ml-2 shrink-0 font-medium cursor-pointer"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onReserveClick && onReserveClick(gift)}
                  className="w-full py-2.5 px-4 rounded-full bg-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/90 text-[var(--md-sys-color-on-primary)] font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-[var(--md-elevation-1)] cursor-pointer"
                >
                  <GiftIcon className="w-4 h-4" />
                  Je m&apos;en occupe
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 pt-0 flex items-center justify-between gap-2">
        {gift.product_url ? (
          <a
            href={gift.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 rounded-full border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/8 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Voir l&apos;article</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <div className="flex-1" />
        )}

        {onEdit && (
          <button
            onClick={() => onEdit(gift)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer"
            aria-label="Modifier"
            title="Modifier ce cadeau (enfant, liste, prix...)"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        {mode === 'parent' && onDelete && (
          <button
            onClick={() => onDelete(gift.id)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] transition-colors cursor-pointer"
            aria-label="Supprimer"
            title="Supprimer ce cadeau"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
