'use client';

import React, { useState } from 'react';
import { ExternalLink, Trash2, Heart, Star, CheckCircle2, Clock3, Gift as GiftIcon, Tag, Sparkles } from 'lucide-react';
import { Gift } from '@/types';

interface GiftCardProps {
  gift: Gift;
  mode: 'child' | 'parent' | 'family';
  parentPin?: string;
  onStatusChange?: (giftId: string, status: string) => void;
  onDelete?: (giftId: string) => void;
  onReserveClick?: (gift: Gift) => void;
  onUnreserveClick?: (giftId: string) => void;
}

export default function GiftCard({
  gift,
  mode,
  onStatusChange,
  onDelete,
  onReserveClick,
  onUnreserveClick,
}: GiftCardProps) {
  const [imageError, setImageError] = useState(false);

  const priorityBadge = () => {
    if (gift.priority === 3) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 backdrop-blur-md border border-rose-500/25 shadow-xs">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>❤️ Coup de cœur !</span>
        </span>
      );
    }
    if (gift.priority === 2) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 backdrop-blur-md border border-amber-500/25 shadow-xs">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>Super envie</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 backdrop-blur-md border border-emerald-500/25 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Petite idée</span>
      </span>
    );
  };

  const statusBadge = () => {
    switch (gift.status) {
      case 'bought':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Acheté
          </span>
        );
      case 'received':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20">
            <GiftIcon className="w-3.5 h-3.5 text-purple-500" />
            Emballé / Reçu
          </span>
        );
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20">
            <Clock3 className="w-3.5 h-3.5 text-blue-500" />
            Réservé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            Idée
          </span>
        );
    }
  };

  return (
    <div className="apple-card overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Card Image Header */}
        <div className="relative aspect-4/3 w-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden flex items-center justify-center">
          {gift.image_url && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gift.image_url}
              alt={gift.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-400 p-8 text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-zinc-200/50 dark:bg-zinc-700/50 flex items-center justify-center">
                <GiftIcon className="w-8 h-8 text-zinc-400 stroke-[1.5]" />
              </div>
              <span className="text-xs font-medium text-zinc-400">{gift.store_name || 'Cadeau'}</span>
            </div>
          )}

          {/* Child pill top left */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-sm border border-white/40 dark:border-white/10 text-xs font-bold text-zinc-900 dark:text-white">
            <span className="text-sm">{gift.child_avatar || '🌟'}</span>
            <span>{gift.child_name}</span>
          </div>

          {/* Priority pill top right */}
          <div className="absolute top-3.5 right-3.5 shadow-sm">
            {priorityBadge()}
          </div>

          {/* Price badge bottom right */}
          {gift.price !== null && gift.price !== undefined && (
            <div className="absolute bottom-3.5 right-3.5 px-3 py-1 rounded-full bg-zinc-950/80 dark:bg-white/95 backdrop-blur-md text-white dark:text-zinc-900 text-xs font-bold shadow-md tracking-tight">
              {gift.price.toFixed(2)} {gift.currency}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-3.5">
          <div>
            <h4 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white leading-snug tracking-tight">
              {gift.title}
            </h4>

            {gift.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mt-1.5">
                {gift.description}
              </p>
            )}
          </div>

          {/* Store reference & occasion */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {gift.store_name && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 font-medium">
                <Tag className="w-3 h-3 text-zinc-400" />
                {gift.store_name}
              </span>
            )}
            {gift.occasion_title && (
              <span className="text-zinc-400 dark:text-zinc-500 font-medium">
                • {gift.occasion_title}
              </span>
            )}
          </div>

          {/* PARENT MODE SECRET STATS */}
          {mode === 'parent' && (
            <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80 space-y-2.5 animate-apple-appear">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Suivi secret :</span>
                {statusBadge()}
              </div>

              {gift.reserved_by && (
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/15 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Pris par : {gift.reserved_by}</span>
                  </div>
                  {gift.private_note && (
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-400 italic">
                      &quot;{gift.private_note}&quot;
                    </div>
                  )}
                </div>
              )}

              {/* Status Action Buttons for Parents */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {(['idea', 'reserved', 'bought', 'received'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => onStatusChange && onStatusChange(gift.id, st)}
                    className={`py-1.5 text-[11px] font-semibold rounded-xl apple-press transition-all ${
                      gift.status === st
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
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
            <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80">
              {gift.status === 'reserved' ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">Réservé {gift.reserved_by ? `par ${gift.reserved_by}` : ''}</span>
                  </div>
                  {onUnreserveClick && (
                    <button
                      onClick={() => onUnreserveClick(gift.id)}
                      className="text-[11px] text-zinc-400 hover:text-rose-500 underline ml-2 shrink-0 font-medium"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onReserveClick && onReserveClick(gift)}
                  className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 apple-press shadow-md shadow-blue-500/25 transition-all"
                >
                  <GiftIcon className="w-4 h-4" />
                  Je m&apos;en occupe !
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-5 pt-0 flex items-center justify-between gap-2.5">
        {gift.product_url ? (
          <a
            href={gift.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 apple-press border border-zinc-200/60 dark:border-zinc-700/60 transition-colors shadow-2xs"
          >
            <span>Voir l&apos;article</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>
        ) : (
          <div className="flex-1" />
        )}

        {mode === 'parent' && onDelete && (
          <button
            onClick={() => onDelete(gift.id)}
            className="p-2.5 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 apple-press transition-colors"
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
