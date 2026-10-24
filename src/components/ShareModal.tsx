'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareToken: string;
  familyName: string;
}

export default function ShareModal({ isOpen, onClose, shareToken, familyName }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || '');
  const shareUrl = `${origin}/partage/${shareToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = `Bonjour ! Voici la liste de souhaits de cadeaux pour ${familyName} : ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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

        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
          <Share2 className="w-5 h-5" />
        </div>

        <h3 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight mb-1">
          Partager la liste
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
          Les proches peuvent consulter la liste et réserver un cadeau pour éviter les doublons.
        </p>

        {/* URL Box */}
        <div className="flex items-center gap-2 p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200/70 dark:border-zinc-700/70 mb-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs text-zinc-800 dark:text-zinc-200 outline-none select-all font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 apple-press transition-colors cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copié</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>

        {/* WhatsApp Quick Action */}
        <button
          onClick={handleWhatsApp}
          className="w-full py-2.5 px-4 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 apple-press transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Partager sur WhatsApp</span>
        </button>
      </div>
    </div>
  );
}
