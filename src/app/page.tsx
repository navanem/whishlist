'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Gift, Child, Occasion, Store, AppSettings } from '@/types';
import GiftCard from '@/components/GiftCard';
import PinModal from '@/components/PinModal';
import ShareModal from '@/components/ShareModal';
import AddGiftModal from '@/components/AddGiftModal';
import ParentDashboard from '@/components/ParentDashboard';
import {
  Gift as GiftIcon,
  Sparkles,
  Lock,
  Unlock,
  Share2,
  Plus,
  SlidersHorizontal,
  Search,
  ExternalLink,
  HeartHandshake,
} from 'lucide-react';

export default function HomePage() {
  const [mode, setMode] = useState<'child' | 'parent'>('child');
  const [parentPin, setParentPin] = useState<string>('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddGiftModalOpen, setIsAddGiftModalOpen] = useState(false);
  const [addGiftInitialStore, setAddGiftInitialStore] = useState('all');
  const [addGiftInitialQuery, setAddGiftInitialQuery] = useState('');
  const [heroSearchInput, setHeroSearchInput] = useState('');
  const [showParentDashboard, setShowParentDashboard] = useState(false);

  // App data
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [occasionsList, setOccasionsList] = useState<Occasion[]>([]);
  const [storesList, setStoresList] = useState<Store[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    family_name: 'Notre Famille',
    currency: 'CHF',
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [selectedOccasionId, setSelectedOccasionId] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const loadData = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (mode === 'parent' && parentPin) {
        headers['x-pin'] = parentPin;
      }
      const res = await fetch(`/api/data?mode=${mode}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setGifts(data.gifts || []);
        setChildrenList(data.children || []);
        setOccasionsList(data.occasions || []);
        setStoresList(data.stores || []);
        if (data.settings) setSettings(data.settings);
        if (selectedOccasionId === 'all' && data.occasions && data.occasions.length > 0) {
          setSelectedOccasionId(data.occasions[0].id);
        }
      }
    } catch (err) {
      console.error('Erreur chargement données', err);
    } finally {
      setLoading(false);
    }
  }, [mode, parentPin, selectedOccasionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Parent authentication
  const handlePinSuccess = (pin: string) => {
    setParentPin(pin);
    setMode('parent');
  };

  const handleLockChildMode = () => {
    setMode('child');
    setParentPin('');
    setShowParentDashboard(false);
  };

  // Gift status change (Parent only)
  const handleStatusChange = async (giftId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/gifts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: giftId, status: newStatus, pin: parentPin }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Gift delete (Parent only)
  const handleDeleteGift = async (giftId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce cadeau de la liste ?')) return;
    try {
      const res = await fetch(`/api/gifts?id=${giftId}`, {
        method: 'DELETE',
        headers: { 'x-pin': parentPin },
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered gifts list
  const filteredGifts = gifts.filter((gift) => {
    const matchChild = selectedChildId === 'all' || gift.child_id === selectedChildId;
    const matchOccasion = selectedOccasionId === 'all' || gift.occasion_id === selectedOccasionId;
    const matchSearch =
      !searchFilter.trim() ||
      gift.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (gift.store_name && gift.store_name.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchChild && matchOccasion && matchSearch;
  });

  const openAddGiftWithStore = (storeId: string) => {
    setAddGiftInitialStore(storeId);
    setAddGiftInitialQuery('');
    setIsAddGiftModalOpen(true);
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearchInput.trim()) return;
    setAddGiftInitialStore('all');
    setAddGiftInitialQuery(heroSearchInput.trim());
    setIsAddGiftModalOpen(true);
  };

  return (
    <div className="relative min-h-screen pb-28">
      {/* Ambient Cupertino Atmosphere Glow */}
      <div className="apple-ambient-glow" />

      {/* Floating Apple Glass Header */}
      <header className="sticky top-0 z-40 apple-glass-header px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Christmas App Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 animate-festive-float">
              <GiftIcon className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white tracking-tight">
                  Cadeaux
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                  🎅 Liste au Père Noël
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {mode === 'parent' ? '🔒 Espace Parents Déverrouillé' : '🎄 Pôle Nord • Liste officielle des enfants'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 text-xs font-semibold flex items-center gap-2 apple-press border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs"
              title="Partager le lien avec la famille"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span className="hidden sm:inline">Partager la liste</span>
            </button>

            {mode === 'parent' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowParentDashboard(!showParentDashboard)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 apple-press shadow-xs transition-all ${
                    showParentDashboard
                      ? 'bg-rose-600 text-white shadow-rose-500/25'
                      : 'bg-white/80 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Budget & Réglages</span>
                </button>
                <button
                  onClick={handleLockChildMode}
                  className="px-3.5 py-2 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 text-xs font-semibold flex items-center gap-1.5 apple-press"
                  title="Verrouiller en mode enfant"
                >
                  <Unlock className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Verrouiller</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 text-xs font-semibold flex items-center gap-2 apple-press border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Espace Parents</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* Parent Dashboard View */}
        {mode === 'parent' && showParentDashboard && (
          <div className="animate-apple-appear">
            <ParentDashboard
              childrenList={childrenList}
              occasionsList={occasionsList}
              storesList={storesList}
              giftsList={gifts}
              parentPin={parentPin}
              shareToken={settings.share_token}
              familyName={settings.family_name}
              currency={settings.currency}
              onRefresh={loadData}
            />
          </div>
        )}

        {/* Hero Interactive Christmas Letter Showcase */}
        <div className="apple-glass rounded-[2.5rem] p-7 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-sm border border-rose-500/20 relative overflow-hidden">
          {/* Subtle North Pole Stamp Watermark */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full border-2 border-dashed border-rose-500/15 pointer-events-none flex items-center justify-center -rotate-12 select-none">
            <span className="text-[9px] font-black uppercase tracking-widest text-rose-500/20 text-center px-4">
              📮 Pôle Nord • Service Officiel du Père Noël • 2026
            </span>
          </div>

          <div className="space-y-3.5 max-w-xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-bold border border-rose-500/20">
              <span>🎅</span>
              <span>Ma Lettre au Père Noël</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight leading-none apple-display">
              Cher Père Noël, pour cette année j&apos;aimerais... 🎄
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              Écris ta liste magique ! Cherche directement tes jouets dans les ateliers et boutiques en ligne, colle un lien ou note tes envies les plus secrètes.
            </p>

            {/* In-app live product search bar */}
            <form onSubmit={handleHeroSearch} className="pt-1 flex items-center gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Rechercher une envie pour le Père Noël (Lego, Pokémon, jeux...)"
                  value={heroSearchInput}
                  onChange={(e) => setHeroSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 dark:bg-zinc-800/90 border border-zinc-200/90 dark:border-zinc-700/90 text-xs sm:text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center gap-1.5 apple-press shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trouver</span>
              </button>
            </form>

            {/* Direct Store launcher chips with in-app search */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Ateliers de jouets & Magasins officiels :
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {storesList.slice(0, 7).map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => openAddGiftWithStore(store.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-rose-200/60 dark:border-rose-900/40 apple-press shadow-2xs group cursor-pointer"
                  >
                    <span>{store.icon}</span>
                    <span>{store.name}</span>
                    <Search className="w-3 h-3 text-zinc-400 group-hover:text-rose-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0 relative z-10">
            <button
              onClick={() => setIsAddGiftModalOpen(true)}
              className="py-4 px-8 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-500 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm flex items-center justify-center gap-3 apple-press shadow-xl shadow-rose-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Écrire au Père Noël</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="py-3 px-6 rounded-2xl bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 apple-press border border-zinc-200 dark:border-zinc-700"
            >
              <HeartHandshake className="w-4 h-4 text-rose-500" />
              <span>💌 Partager avec la famille</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation Bar: Children Segmented Control & Occasions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* iOS Segmented Control for Children */}
          <div className="flex p-1.5 bg-zinc-200/70 dark:bg-zinc-800/70 rounded-2xl overflow-x-auto no-scrollbar shadow-inner">
            <button
              onClick={() => setSelectedChildId('all')}
              className={`py-2 px-4 text-xs font-bold rounded-xl apple-press whitespace-nowrap transition-all ${
                selectedChildId === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Tous ({gifts.length})
            </button>
            {childrenList.map((child) => {
              const count = gifts.filter((g) => g.child_id === child.id).length;
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`py-2 px-4 text-xs font-bold rounded-xl apple-press flex items-center gap-2 whitespace-nowrap transition-all ${
                    selectedChildId === child.id
                      ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <span className="text-sm">{child.avatar}</span>
                  <span>{child.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Occasion Tags & Search Filter */}
          <div className="flex items-center gap-2.5 flex-1 justify-end min-w-[280px]">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-zinc-400" />
              <input
                type="text"
                placeholder="Rechercher un cadeau..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-white/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedOccasionId('all')}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold apple-press border whitespace-nowrap transition-all ${
                  selectedOccasionId === 'all'
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-sm'
                    : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                Tous
              </button>
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
        </div>

        {/* Gift Cards Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-500 font-medium">Chargement des cadeaux...</p>
          </div>
        ) : filteredGifts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredGifts.map((gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                mode={mode}
                parentPin={parentPin}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteGift}
              />
            ))}
          </div>
        ) : (
          <div className="apple-glass rounded-[2.5rem] p-14 text-center max-w-md mx-auto space-y-4 shadow-sm border border-rose-500/20">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto text-3xl">
              🎅
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight">
              La hotte est encore vide ici !
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Glisse les premières envies pour garnir la lettre au Père Noël et préparer les surprises sous le sapin.
            </p>
            <button
              onClick={() => setIsAddGiftModalOpen(true)}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-500 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs inline-flex items-center gap-2 apple-press shadow-md shadow-rose-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Ajouter une envie au Père Noël</span>
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareToken={settings.share_token || 'notre-famille'}
        familyName={settings.family_name || 'Notre Famille'}
      />

      <AddGiftModal
        isOpen={isAddGiftModalOpen}
        onClose={() => {
          setIsAddGiftModalOpen(false);
          setAddGiftInitialQuery('');
          setAddGiftInitialStore('all');
        }}
        childrenList={childrenList}
        occasionsList={occasionsList}
        storesList={storesList}
        defaultChildId={selectedChildId !== 'all' ? selectedChildId : undefined}
        defaultOccasionId={selectedOccasionId !== 'all' ? selectedOccasionId : undefined}
        initialStoreId={addGiftInitialStore}
        initialQuery={addGiftInitialQuery}
        onGiftAdded={loadData}
      />
    </div>
  );
}
