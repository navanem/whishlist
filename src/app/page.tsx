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
  Lock,
  Unlock,
  Share2,
  Plus,
  SlidersHorizontal,
  Search,
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

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearchInput.trim()) return;
    setAddGiftInitialStore('all');
    setAddGiftInitialQuery(heroSearchInput.trim());
    setIsAddGiftModalOpen(true);
  };

  return (
    <div className="relative min-h-screen pb-28">
      {/* Apple Translucent Navigation Bar */}
      <header className="sticky top-0 z-40 apple-glass-header px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Context */}
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
                  Noël 2026
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                {mode === 'parent' ? 'Espace Parents actif' : 'Liste de souhaits'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 apple-press border border-zinc-200/60 dark:border-zinc-700/60 transition-colors"
              title="Partager le lien avec la famille"
            >
              <Share2 className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
              <span className="hidden sm:inline">Partager</span>
            </button>

            {mode === 'parent' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowParentDashboard(!showParentDashboard)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 apple-press transition-colors ${
                    showParentDashboard
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Gestion & Budget</span>
                </button>
                <button
                  onClick={handleLockChildMode}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 apple-press transition-colors"
                  title="Verrouiller en mode public"
                >
                  <Unlock className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="hidden sm:inline">Verrouiller</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 apple-press border border-zinc-200/60 dark:border-zinc-700/60 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Parents</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
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

        {/* Hero Spotlight Search & Actions */}
        <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <span>Liste de souhaits</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight apple-display">
              Idées et envies de cadeaux
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              Recherchez directement un jouet ou un article en magasin, collez un lien ou notez une idée personnalisée pour la liste.
            </p>

            {/* In-app live product search bar */}
            <form onSubmit={handleHeroSearch} className="pt-1 flex items-center gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Rechercher un cadeau (Lego, livre, Switch, puzzle...)"
                  value={heroSearchInput}
                  onChange={(e) => setHeroSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-transparent focus:border-blue-500 text-xs sm:text-sm text-zinc-900 dark:text-white outline-none transition-all font-normal placeholder:text-zinc-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 apple-press transition-colors shrink-0 cursor-pointer"
              >
                <span>Rechercher</span>
              </button>
            </form>

            {/* Direct Store launcher chips with in-app search */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Rechercher par enseigne :
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {storesList.slice(0, 7).map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => openAddGiftWithStore(store.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium border border-zinc-200/60 dark:border-zinc-700/60 apple-press transition-colors cursor-pointer"
                  >
                    <span>{store.icon}</span>
                    <span>{store.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setIsAddGiftModalOpen(true)}
              className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 apple-press shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Ajouter un cadeau</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="py-2.5 px-5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center gap-2 apple-press border border-zinc-200/80 dark:border-zinc-700/80 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>Partager avec les proches</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation Bar: Children Segmented Control & Search */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* iOS Segmented Control for Children */}
          <div className="flex p-1 bg-zinc-200/70 dark:bg-zinc-800/70 rounded-2xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedChildId('all')}
              className={`py-1.5 px-3.5 text-xs font-semibold rounded-xl apple-press whitespace-nowrap transition-all ${
                selectedChildId === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
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
                  className={`py-1.5 px-3.5 text-xs font-semibold rounded-xl apple-press flex items-center gap-2 whitespace-nowrap transition-all ${
                    selectedChildId === child.id
                      ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <span className="text-sm">{child.avatar}</span>
                  <span>{child.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Occasion Tags & In-page Filter */}
          <div className="flex items-center gap-2.5 flex-1 justify-end min-w-[280px]">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Filtrer la liste..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500 font-normal placeholder:text-zinc-400"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedOccasionId('all')}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold apple-press border whitespace-nowrap transition-colors ${
                  selectedOccasionId === 'all'
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                Tous
              </button>
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
        </div>

        {/* Gift Cards Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-500 font-medium">Chargement des cadeaux...</p>
          </div>
        ) : filteredGifts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
              <GiftIcon className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight">
              Aucun cadeau pour le moment
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Ajoutez les premières envies pour préparer la liste de cadeaux et partager avec la famille.
            </p>
            <button
              onClick={() => setIsAddGiftModalOpen(true)}
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center gap-2 apple-press transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
              <span>Ajouter un cadeau</span>
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
