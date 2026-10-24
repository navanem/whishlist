'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Gift, Child, Occasion, Store, AppSettings } from '@/types';
import GiftCard from '@/components/GiftCard';
import PinModal from '@/components/PinModal';
import ShareModal from '@/components/ShareModal';
import AddGiftModal from '@/components/AddGiftModal';
import ParentDashboard from '@/components/ParentDashboard';
import AudioPlayer from '@/components/AudioPlayer';
import {
  Lock,
  Unlock,
  Share2,
  Plus,
  SlidersHorizontal,
  Search,
  X,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const [mode, setMode] = useState<'child' | 'parent'>('child');
  const [parentPin, setParentPin] = useState<string>('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddGiftModalOpen, setIsAddGiftModalOpen] = useState(false);
  const [addGiftInitialStore, setAddGiftInitialStore] = useState('all');
  const [addGiftInitialQuery, setAddGiftInitialQuery] = useState('');
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

  // Single unified search & filter
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

  const handlePinSuccess = (pin: string) => {
    setParentPin(pin);
    setMode('parent');
  };

  const handleLockChildMode = () => {
    setMode('child');
    setParentPin('');
    setShowParentDashboard(false);
  };

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

  const activeOccasionTitle = occasionsList.find((o) => o.id === selectedOccasionId)?.title || 'Noël';

  return (
    <div className="relative min-h-screen pb-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:pb-20">
      {/* Subtle festive atmosphere */}
      <div className="santa-ambient" />

      {/* Apple Translucent Navigation Bar */}
      <header className="sticky top-0 z-40 apple-glass-header px-4 sm:px-8 py-2.5 sm:py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Context */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden shadow-2xs shrink-0 bg-red-600 flex items-center justify-center p-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Wishlist Logo" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white tracking-tight font-serif italic truncate">
                  Wishlist
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 shrink-0">
                  🎅 Liste au Père Noël
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate hidden sm:block">
                {mode === 'parent' ? '🔒 Espace Parents Déverrouillé' : '🎄 Pôle Nord • Liste officielle'}
              </p>
            </div>
          </div>

          {/* Action buttons (Clean touch-friendly row) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <AudioPlayer />

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 sm:px-3.5 sm:py-1.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 apple-press border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs transition-colors shrink-0 min-w-[36px] min-h-[36px] sm:min-w-0 justify-center"
              title="Partager le lien avec la famille"
              aria-label="Partager la liste"
            >
              <Share2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-red-600 dark:text-red-400" />
              <span className="hidden md:inline">Partager</span>
            </button>

            {mode === 'parent' ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowParentDashboard(!showParentDashboard)}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 apple-press transition-colors shrink-0 min-w-[36px] min-h-[36px] sm:min-w-0 justify-center ${
                    showParentDashboard
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white/90 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs'
                  }`}
                  title="Gérer le budget et les réglages"
                >
                  <SlidersHorizontal className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden md:inline">Budget & Réglages</span>
                </button>
                <button
                  onClick={handleLockChildMode}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 apple-press transition-colors shrink-0 min-w-[36px] min-h-[36px] sm:min-w-0 justify-center"
                  title="Verrouiller en mode enfant"
                  aria-label="Verrouiller"
                >
                  <Unlock className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-red-500" />
                  <span className="hidden md:inline">Verrouiller</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="p-2 sm:px-3.5 sm:py-1.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 apple-press border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs transition-colors shrink-0 min-w-[36px] min-h-[36px] sm:min-w-0 justify-center"
                title="Accéder à l'espace parents"
                aria-label="Espace Parents"
              >
                <Lock className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-zinc-500" />
                <span className="hidden sm:inline">Espace Parents</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6 space-y-6 relative z-10">
        {/* Parent Dashboard View */}
        {mode === 'parent' && showParentDashboard && (
          <div className="animate-apple-appear mb-6">
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

        {/* Hero: La Lettre au Père Noël (Streamlined & Ergonomic) */}
        <div className="santa-letter-card p-4 sm:p-7 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border border-amber-900/10 dark:border-amber-500/15">
          <div className="space-y-1.5 max-w-xl relative z-10">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-serif italic text-zinc-950 dark:text-white tracking-tight">
                Cher Père Noël,
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                voici notre liste pour {activeOccasionTitle}
              </span>
            </div>

            {/* Quick Store Exploration Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline">Idées rapides :</span>
              {storesList.slice(0, 6).map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => openAddGiftWithStore(store.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-zinc-800/90 hover:bg-white text-zinc-700 dark:text-zinc-300 text-[11px] font-medium border border-zinc-200/80 dark:border-zinc-700/80 apple-press shadow-2xs transition-colors cursor-pointer"
                >
                  <span>{store.icon}</span>
                  <span>{store.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop primary add CTA (Mobile uses floating thumb FAB) */}
          <div className="hidden sm:flex items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => setIsAddGiftModalOpen(true)}
              className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 apple-press shadow-sm shadow-red-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Écrire au Père Noël</span>
            </button>
          </div>
        </div>

        {/* Unified Filter & Search Toolbar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* iOS Segmented Control for Children */}
            <div className="flex p-1 bg-zinc-200/70 dark:bg-zinc-800/70 rounded-2xl overflow-x-auto no-scrollbar shadow-inner w-full sm:w-auto">
              <button
                onClick={() => setSelectedChildId('all')}
                className={`py-2 px-3.5 text-xs font-bold rounded-xl apple-press whitespace-nowrap transition-all min-h-[38px] flex items-center gap-1.5 ${
                  selectedChildId === 'all'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span>Tous</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {gifts.length}
                </span>
              </button>
              {childrenList.map((child) => {
                const count = gifts.filter((g) => g.child_id === child.id).length;
                return (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`py-2 px-3.5 text-xs font-bold rounded-xl apple-press flex items-center gap-1.5 whitespace-nowrap transition-all min-h-[38px] ${
                      selectedChildId === child.id
                        ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="text-sm">{child.avatar}</span>
                    <span>{child.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Single Unified Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Rechercher dans la liste..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 font-medium placeholder:text-zinc-400 shadow-2xs"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-2.5 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Gift Cards Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-500 font-medium">Lecture de la lettre au Père Noël...</p>
          </div>
        ) : filteredGifts.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

            {/* Smart search helper if filtering */}
            {searchFilter.trim() && (
              <div className="p-4 rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <span className="text-xs text-zinc-600 dark:text-zinc-300">
                  Pas trouvé votre bonheur ? Vous pouvez chercher « <strong>{searchFilter}</strong> » directement dans les magasins officiels.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAddGiftInitialQuery(searchFilter);
                    setAddGiftInitialStore('all');
                    setIsAddGiftModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-semibold text-xs apple-press shrink-0 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Chercher en magasin</span>
                </button>
              </div>
            )}
          </div>
        ) : searchFilter.trim() ? (
          <div className="santa-letter-card p-8 text-center max-w-md mx-auto space-y-3.5 border border-amber-900/10 dark:border-amber-500/15">
            <p className="text-sm font-semibold text-zinc-950 dark:text-white">
              Aucun cadeau ne correspond à « {searchFilter} » dans la liste.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Souhaitez-vous rechercher cet article dans les boutiques officielles pour l&apos;ajouter ?
            </p>
            <button
              onClick={() => {
                setAddGiftInitialQuery(searchFilter);
                setAddGiftInitialStore('all');
                setIsAddGiftModalOpen(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold text-xs inline-flex items-center gap-2 apple-press shadow-sm shadow-red-500/25 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Chercher « {searchFilter} » en magasin</span>
            </button>
          </div>
        ) : (
          <div className="santa-letter-card p-10 text-center max-w-md mx-auto space-y-4 border border-amber-900/10 dark:border-amber-500/15">
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto text-2xl">
              🎅
            </div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white tracking-tight">
              La hotte est encore vide ici !
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Ajoutez les premières envies pour garnir la lettre au Père Noël et préparer les surprises sous le sapin.
            </p>
            <button
              onClick={() => setIsAddGiftModalOpen(true)}
              className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs inline-flex items-center gap-2 apple-press transition-colors cursor-pointer shadow-sm shadow-red-500/25"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Écrire au Père Noël</span>
            </button>
          </div>
        )}
      </main>

      {/* Mobile Floating Action Capsule (Thumb-friendly & Unobtrusive) */}
      <div className="sm:hidden fixed bottom-4 inset-x-0 z-40 flex justify-center pointer-events-none px-4">
        <button
          onClick={() => setIsAddGiftModalOpen(true)}
          className="pointer-events-auto py-3 px-6 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/35 border border-red-500/30 apple-press active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Écrire au Père Noël</span>
        </button>
      </div>

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
