'use client';

import React, { useEffect, useState, use } from 'react';
import { Gift, Child, Occasion } from '@/types';
import GiftCard from '@/components/GiftCard';
import ReserveModal from '@/components/ReserveModal';
import { Gift as GiftIcon, AlertCircle } from 'lucide-react';

export default function FamilySharePage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [occasionsList, setOccasionsList] = useState<Occasion[]>([]);
  const [familyName, setFamilyName] = useState('Notre Famille');

  // Filter states
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [selectedOccasionId, setSelectedOccasionId] = useState<string>('all');

  // Reserve modal state
  const [selectedGiftToReserve, setSelectedGiftToReserve] = useState<Gift | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/data?mode=family&token=${encodeURIComponent(token)}`);
      if (!res.ok) {
        throw new Error('Lien de partage invalide ou expiré');
      }
      const data = await res.json();
      setGifts(data.gifts || []);
      setChildrenList(data.children || []);
      setOccasionsList(data.occasions || []);
      if (data.settings?.family_name) {
        setFamilyName(data.settings.family_name);
      }
      if (data.occasions && data.occasions.length > 0) {
        setSelectedOccasionId(data.occasions[0].id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur chargement';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleUnreserve = async (giftId: string) => {
    if (!confirm('Voulez-vous vraiment annuler votre réservation sur ce cadeau ?')) return;
    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gift_id: giftId, action: 'unreserve', token }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered gifts
  const filteredGifts = gifts.filter((gift) => {
    const matchChild = selectedChildId === 'all' || gift.child_id === selectedChildId;
    const matchOccasion = selectedOccasionId === 'all' || gift.occasion_id === selectedOccasionId;
    return matchChild && matchOccasion;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-500 font-medium">Chargement de la liste...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-sm border border-zinc-200/80 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Lien introuvable</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Ce lien de partage n&apos;est plus valide ou a été mis à jour.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:pb-28">
      {/* Subtle festive atmosphere */}
      <div className="santa-ambient" />

      {/* Material 3 Top Navigation Bar */}
      <header className="sticky top-0 z-40 m3-top-app-bar px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-xs shrink-0 bg-[var(--md-sys-color-primary)] flex items-center justify-center p-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Wishlist Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-[var(--md-sys-color-on-surface)] tracking-tight">
                  Wishlist
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                  🎅 Lettre au Père Noël • {familyName}
                </span>
              </div>
              <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-normal">
                Espace Famille & Proches (Grands-parents, Oncles, Tantes)
              </p>
            </div>
          </div>

          <div className="text-xs px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-500/20 self-start sm:self-auto flex items-center gap-1.5">
            <span>🎁 Cliquez sur &quot;Je m&apos;en occupe&quot; pour réserver un cadeau</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* Child Filter & Occasion Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setSelectedChildId('all')}
              className={`m3-filter-chip cursor-pointer whitespace-nowrap ${
                selectedChildId === 'all'
                  ? 'selected'
                  : 'bg-[var(--md-sys-color-surface-container-low)]'
              }`}
            >
              Tous les enfants ({gifts.length})
            </button>
            {childrenList.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`m3-filter-chip cursor-pointer whitespace-nowrap ${
                  selectedChildId === child.id
                    ? 'selected'
                    : 'bg-[var(--md-sys-color-surface-container-low)]'
                }`}
              >
                <span className="text-sm">{child.avatar}</span>
                <span>{child.name}</span>
              </button>
            ))}
          </div>

          {/* Occasion Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {occasionsList.map((occ) => (
              <button
                key={occ.id}
                onClick={() => setSelectedOccasionId(occ.id)}
                className={`m3-filter-chip h-8 text-xs cursor-pointer whitespace-nowrap ${
                  selectedOccasionId === occ.id
                    ? 'selected'
                    : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                {occ.title}
              </button>
            ))}
          </div>
        </div>

        {/* Gift Grid */}
        {filteredGifts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGifts.map((gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                mode="family"
                onReserveClick={(g) => setSelectedGiftToReserve(g)}
                onUnreserveClick={handleUnreserve}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <GiftIcon className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">
              Aucun cadeau pour le moment
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Les parents ajouteront bientôt les envies pour cette occasion.
            </p>
          </div>
        )}
      </main>

      {/* Reservation Modal */}
      <ReserveModal
        isOpen={Boolean(selectedGiftToReserve)}
        onClose={() => setSelectedGiftToReserve(null)}
        gift={selectedGiftToReserve}
        shareToken={token}
        onReserved={fetchData}
      />
    </div>
  );
}
