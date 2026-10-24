'use client';

import React, { useState } from 'react';
import { ExternalLink, Trash2, Heart, CheckCircle2, Clock3, Gift as GiftIcon, Tag } from 'lucide-react';
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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200/60 dark:border-red-900/40">
          <Heart className="w-3 h-3 fill-current" />
          <span>Coup de cœur</span>
        </span>
      );
    }
    if (gift.priority === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
          <span>Très souhaité</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
        <span>Idée</span>
      </span>
    );
  };

  const statusBadge = () => {
    switch (gift.status) {
      case 'bought':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Acheté
          </span>
        );
      case 'received':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/40">
            <GiftIcon className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            Reçu
          </span>
        );
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
            <Clock3 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Réservé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
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
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-400 p-8 text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-zinc-200/60 dark:bg-zinc-700/60 flex items-center justify-center">
                <GiftIcon className="w-7 h-7 text-zinc-400 stroke-[1.5]" />
              </div>
              <span className="text-xs font-medium text-zinc-400">{gift.store_name || 'Cadeau'}</span>
            </div>
          )}

          {/* Child pill top left */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-2xs border border-white/60 dark:border-white/10 text-xs font-bold text-zinc-900 dark:text-white">
            <span className="text-xs">{gift.child_avatar || '👤'}</span>
            <span>{gift.child_name}</span>
          </div>

          {/* Priority pill top right */}
          <div className="absolute top-3 right-3 shadow-2xs">
            {priorityBadge()}
          </div>

          {/* Price badge bottom right */}
          {gift.price !== null && gift.price !== undefined && (
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-zinc-950/80 dark:bg-white/95 backdrop-blur-md text-white dark:text-zinc-900 text-xs font-semibold shadow-xs tracking-tight">
              {gift.price.toFixed(2)} {gift.currency}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <div>
            <h4 className="font-semibold text-base text-zinc-900 dark:text-white leading-snug tracking-tight">
              {gift.title}
            </h4>

            {gift.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mt-1">
                {gift.description}
              </p>
            )}
          </div>

          {/* Store reference & occasion */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {gift.store_name && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px]">
                <Tag className="w-3 h-3 text-zinc-400" />
                {gift.store_name}
              </span>
            )}
            {gift.occasion_title && (
              <span className="text-zinc-400 dark:text-zinc-500 font-normal text-[11px]">
                • {gift.occasion_title}
              </span>
            )}
          </div>

          {/* PARENT MODE SECRET STATS */}
          {mode === 'parent' && (
            <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80 space-y-2 animate-apple-appear">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Suivi :</span>
                {statusBadge()}
              </div>

              {gift.reserved_by && (
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 space-y-0.5">
                  <div className="font-semibold">
                    Réservé par : {gift.reserved_by}
                  </div>
                  {gift.private_note && (
                    <div className="text-[11px] text-zinc-600 dark:text-zinc-400 italic">
                      &quot;{gift.private_note}&quot;
                    </div>
                  )}
                </div>
              )}

              {/* Status Action Buttons for Parents */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {(['idea', 'reserved', 'bought', 'received'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => onStatusChange && onStatusChange(gift.id, st)}
                    className={`py-1 text-[11px] font-semibold rounded-lg apple-press transition-colors ${
                      gift.status === st
                        ? 'bg-blue-600 text-white'
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
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">Réservé {gift.reserved_by ? `par ${gift.reserved_by}` : ''}</span>
                  </div>
                  {onUnreserveClick && (
                    <button
                      onClick={() => onUnreserveClick(gift.id)}
                      className="text-[11px] text-zinc-400 hover:text-red-500 underline ml-2 shrink-0 font-medium"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onReserveClick && onReserveClick(gift)}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 apple-press transition-colors"
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
      <div className="p-5 pt-0 flex items-center justify-between gap-2">
        {gift.product_url ? (
          <a
            href={gift.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 apple-press transition-colors"
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
            className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 apple-press transition-colors"
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
