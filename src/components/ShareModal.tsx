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
    const text = `Coucou ! Voici la liste de cadeaux de la ${familyName} pour Noël et anniversaires. Vous pouvez voir les envies des enfants et choisir facilement ce que vous souhaitez offrir : ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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
          <Share2 className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight mb-2">
          Partager avec la famille
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
          Les grands-parents, oncles et proches peuvent consulter la liste et cliquer sur <strong>&quot;Je m&apos;en occupe&quot;</strong> pour réserver un cadeau sans gâcher la surprise aux enfants.
        </p>

        {/* URL Box */}
        <div className="flex items-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 mb-5">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 outline-none select-all font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 apple-press transition-colors ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copier
              </>
            )}
          </button>
        </div>

        {/* WhatsApp Quick Action */}
        <button
          onClick={handleWhatsApp}
          className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2 apple-press shadow-sm"
        >
          <MessageCircle className="w-5 h-5" />
          Envoyer sur WhatsApp
        </button>
      </div>
    </div>
  );
}
