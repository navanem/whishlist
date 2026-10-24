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
    <div className="relative min-h-screen pb-28">
      {/* Translucent Apple Navigation Header */}
      <header className="sticky top-0 z-40 apple-glass-header px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-xs">
              <GiftIcon className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white tracking-tight">
                  Cadeaux
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80">
                  {familyName}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                Espace Famille & Proches
              </p>
            </div>
          </div>

          <div className="text-xs px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-900/40 self-start sm:self-auto flex items-center gap-1.5">
            <span>Cliquez sur &quot;Je m&apos;en occupe&quot; pour réserver un cadeau</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* Child Filter Segmented Control & Occasion Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex p-1 bg-zinc-200/70 dark:bg-zinc-800/70 rounded-2xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedChildId('all')}
              className={`py-1.5 px-3.5 text-xs font-semibold rounded-xl apple-press transition-all whitespace-nowrap ${
                selectedChildId === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Tous les enfants ({gifts.length})
            </button>
            {childrenList.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`py-1.5 px-3.5 text-xs font-semibold rounded-xl apple-press flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  selectedChildId === child.id
                    ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span className="text-sm">{child.avatar}</span>
                <span>{child.name}</span>
              </button>
            ))}
          </div>

          {/* Occasion Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {occasionsList.map((occ) => (
              <button
                key={occ.id}
                onClick={() => setSelectedOccasionId(occ.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold apple-press border whitespace-nowrap transition-colors ${
                  selectedOccasionId === occ.id
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
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
