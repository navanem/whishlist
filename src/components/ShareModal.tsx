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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md m3-dialog rounded-t-[28px] sm:rounded-[28px] p-6 sm:p-7 flex flex-col relative border border-[var(--md-sys-color-outline-variant)] transition-transform animate-slide-up sm:animate-m3-appear pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        {/* Drag handle on mobile */}
        <div className="m3-drag-handle sm:hidden" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 m3-icon-btn cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-on-primary-container)] mb-4">
          <Share2 className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-medium text-[var(--md-sys-color-on-surface)] tracking-tight mb-1">
          Partager la liste
        </h3>
        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-5 leading-relaxed">
          Les proches peuvent consulter la liste et réserver un cadeau pour éviter les doublons.
        </p>

        {/* URL Box */}
        <div className="flex items-center gap-2 p-2 bg-[var(--md-sys-color-surface-container)] rounded-full border border-[var(--md-sys-color-outline-variant)] mb-4 pl-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs text-[var(--md-sys-color-on-surface)] outline-none select-all font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'm3-btn-filled'
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
          className="w-full py-3 px-4 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-medium text-xs flex items-center justify-center gap-2 hover:bg-[var(--md-sys-color-secondary-container)]/80 transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Partager sur WhatsApp</span>
        </button>
      </div>
    </div>
  );
}
