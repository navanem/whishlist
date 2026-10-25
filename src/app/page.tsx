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

      {/* Material 3 Top App Bar */}
      <header className="sticky top-0 z-40 m3-top-app-bar px-4 sm:px-8 py-2.5 sm:py-3 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Context */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-[var(--md-elevation-1)] shrink-0 bg-[var(--md-sys-color-primary)] flex items-center justify-center p-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Wishlist Logo" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-[var(--md-sys-color-on-surface)] tracking-tight truncate">
                  Wishlist
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shrink-0">
                  🎅 Liste au Père Noël
                </span>
              </div>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-normal truncate hidden sm:block">
                {mode === 'parent' ? '🔒 Espace Parents Déverrouillé' : '🎄 Pôle Nord • Liste officielle'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <AudioPlayer />

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors cursor-pointer"
              title="Partager le lien avec la famille"
              aria-label="Partager la liste"
            >
              <Share2 className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
              <span className="hidden sm:inline">Partager</span>
            </button>

            {mode === 'parent' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowParentDashboard(!showParentDashboard)}
                  className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    showParentDashboard
                      ? 'bg-[var(--md-sys-color-primary)] text-white shadow-xs'
                      : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
                  }`}
                  title="Gérer le budget et les réglages"
                >
                  <SlidersHorizontal className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Budget & Réglages</span>
                </button>
                <button
                  onClick={handleLockChildMode}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] hover:text-[var(--md-sys-color-primary)] cursor-pointer transition-colors"
                  title="Verrouiller en mode enfant"
                  aria-label="Verrouiller"
                >
                  <Unlock className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
                  <span className="hidden sm:inline">Verrouiller</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] cursor-pointer transition-colors"
                title="Accéder à l'espace parents"
                aria-label="Espace Parents"
              >
                <Lock className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] shrink-0" />
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

        {/* Hero: La Lettre au Père Noël */}
        <div className="m3-card-filled p-5 sm:p-7 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl relative z-10">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--md-sys-color-on-surface)] tracking-tight">
                La Lettre au Père Noël 🎅
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">
                Notre sélection de cadeaux pour {activeOccasionTitle}. Cliquez sur un magasin pour explorer des idées !
              </p>
            </div>

            {/* Quick Store Exploration Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider mr-1">Magasins :</span>
              {storesList.slice(0, 6).map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => openAddGiftWithStore(store.id)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium cursor-pointer bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary-container)] transition-colors"
                >
                  <span className="text-sm">{store.icon}</span>
                  <span>{store.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary add CTA */}
          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <button
              onClick={() => setIsAddGiftModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold bg-[var(--md-sys-color-primary)] text-white hover:opacity-95 active:scale-98 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Ajouter un cadeau</span>
            </button>
          </div>
        </div>

        {/* Unified Filter & Search Toolbar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Material 3 Filter Chips for Children */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedChildId('all')}
                className={`m3-filter-chip cursor-pointer whitespace-nowrap ${
                  selectedChildId === 'all' ? 'selected' : 'bg-[var(--md-sys-color-surface-container-low)]'
                }`}
              >
                <span>Tous</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] font-bold">
                  {gifts.length}
                </span>
              </button>
              {childrenList.map((child) => {
                const count = gifts.filter((g) => g.child_id === child.id).length;
                return (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`m3-filter-chip cursor-pointer whitespace-nowrap ${
                      selectedChildId === child.id ? 'selected' : 'bg-[var(--md-sys-color-surface-container-low)]'
                    }`}
                  >
                    <span className="text-sm">{child.avatar}</span>
                    <span>{child.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] font-bold">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Material 3 Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-4 top-3 text-[var(--md-sys-color-on-surface-variant)]" />
              <input
                type="text"
                placeholder="Rechercher dans la liste..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-xs sm:text-sm text-[var(--md-sys-color-on-surface)] outline-none border border-transparent focus:border-[var(--md-sys-color-primary)] font-medium placeholder:text-[var(--md-sys-color-on-surface-variant)] transition-all"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-3 top-2.5 p-1 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] cursor-pointer"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-4 h-4" />
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
          <div className="m3-card-filled p-8 text-center max-w-md mx-auto space-y-3.5 border border-[var(--md-sys-color-outline-variant)]">
            <p className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
              Aucun cadeau ne correspond à « {searchFilter} » dans la liste.
            </p>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Souhaitez-vous rechercher cet article dans les boutiques officielles pour l&apos;ajouter ?
            </p>
            <button
              onClick={() => {
                setAddGiftInitialQuery(searchFilter);
                setAddGiftInitialStore('all');
                setIsAddGiftModalOpen(true);
              }}
              className="m3-btn-filled py-2.5 px-5 text-xs font-medium inline-flex items-center gap-2 cursor-pointer shadow-[var(--md-elevation-1)]"
            >
              <Search className="w-4 h-4" />
              <span>Chercher « {searchFilter} » en magasin</span>
            </button>
          </div>
        ) : (
          <div className="m3-card-filled p-10 text-center max-w-md mx-auto space-y-4 border border-[var(--md-sys-color-outline-variant)]">
            <div className="w-14 h-14 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center mx-auto text-2xl">
              🎅
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--md-sys-color-on-surface)] tracking-tight">
              La hotte est encore vide ici !
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
              Ajoutez les premières envies pour garnir la lettre au Père Noël et préparer les surprises sous le sapin.
            </p>
            <button
              onClick={() => setIsAddGiftModalOpen(true)}
              className="m3-btn-filled py-3 px-6 text-xs font-medium inline-flex items-center gap-2 cursor-pointer shadow-[var(--md-elevation-1)]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Écrire au Père Noël</span>
            </button>
          </div>
        )}
      </main>

      {/* Mobile Material 3 Extended FAB */}
      <div className="sm:hidden fixed bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-4">
        <button
          onClick={() => setIsAddGiftModalOpen(true)}
          className="pointer-events-auto m3-fab-extended cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
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
