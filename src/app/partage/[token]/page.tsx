'use client';

import React, { useEffect, useState, use } from 'react';
import { Gift, Child, Occasion } from '@/types';
import GiftCard from '@/components/GiftCard';
import ReserveModal from '@/components/ReserveModal';
import { Gift as GiftIcon, Sparkles, AlertCircle, Heart } from 'lucide-react';

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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-500 font-medium">Chargement de la liste de cadeaux...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="apple-glass rounded-[2.5rem] p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Lien introuvable</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Ce lien de partage n&apos;est plus valide ou a été mis à jour. Demandez le lien récent aux parents !
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-28">
      {/* Cupertino Atmosphere Glow */}
      <div className="apple-ambient-glow" />

      {/* Translucent Apple Header */}
      <header className="sticky top-0 z-40 apple-glass-header px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25">
              <GiftIcon className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-zinc-950 dark:text-white tracking-tight flex items-center gap-2">
                <span>Cadeaux</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold border border-rose-500/20">
                  🎅 Liste au Père Noël
                </span>
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Espace Famille (Grands-parents, Oncles, Tantes, Proches)
              </p>
            </div>
          </div>

          <div className="text-xs px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-500/20 self-start sm:self-auto flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
            <span>Réservez un cadeau pour éviter les doublons</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* Child Filter Segmented Control */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex p-1.5 bg-zinc-200/70 dark:bg-zinc-800/70 rounded-2xl shadow-inner overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedChildId('all')}
              className={`py-2 px-4 text-xs font-bold rounded-xl apple-press transition-all whitespace-nowrap ${
                selectedChildId === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Tous les enfants ({gifts.length})
            </button>
            {childrenList.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`py-2 px-4 text-xs font-bold rounded-xl apple-press flex items-center gap-2 transition-all whitespace-nowrap ${
                  selectedChildId === child.id
                    ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span className="text-sm">{child.avatar}</span>
                <span>{child.name}</span>
              </button>
            ))}
          </div>

          {/* Occasion Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {occasionsList.map((occ) => (
              <button
                key={occ.id}
                onClick={() => setSelectedOccasionId(occ.id)}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold apple-press border whitespace-nowrap transition-all ${
                  selectedOccasionId === occ.id
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-sm'
                    : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {occ.title}
              </button>
            ))}
          </div>
        </div>

        {/* Gift Grid */}
        {filteredGifts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
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
          <div className="apple-glass rounded-[2.5rem] p-14 text-center max-w-md mx-auto space-y-3 shadow-sm">
            <div className="text-4xl">🎁</div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-base">
              Aucun cadeau pour le moment
            </h3>
            <p className="text-xs text-zinc-500">
              Les enfants ou les parents n&apos;ont pas encore ajouté d&apos;articles dans cette catégorie.
            </p>
          </div>
        )}
      </main>

      {/* Reservation Modal */}
      <ReserveModal
        isOpen={!!selectedGiftToReserve}
        onClose={() => setSelectedGiftToReserve(null)}
        gift={selectedGiftToReserve}
        shareToken={token}
        onReserved={fetchData}
      />
    </div>
  );
}
