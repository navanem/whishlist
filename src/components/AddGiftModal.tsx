'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Link2,
  Sparkles,
  Loader2,
  Plus,
  ExternalLink,
  Check,
  Edit3,
  Store as StoreIcon,
} from 'lucide-react';
import { Child, Occasion, Store } from '@/types';

interface AddGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: Child[];
  occasionsList: Occasion[];
  storesList: Store[];
  defaultChildId?: string;
  defaultOccasionId?: string;
  initialStoreId?: string;
  initialQuery?: string;
  onGiftAdded: () => void;
}

interface ProductSearchResult {
  id: string;
  title: string;
  image_url: string;
  product_url: string;
  store_name: string;
  store_icon: string;
  domain: string;
  price: number | null;
  currency: string;
}

const QUICK_SUGGESTIONS = [
  'Lego Ninjago',
  'Pokémon Switch',
  'Jeu Skyjo',
  'Trottinette 3 roues',
  'Playmobil Police',
  'Casque audio enfant',
  'Harry Potter',
  'Voiture télécommandée',
];

export default function AddGiftModal({
  isOpen,
  onClose,
  childrenList,
  occasionsList,
  storesList,
  defaultChildId,
  defaultOccasionId,
  initialStoreId = 'all',
  initialQuery = '',
  onGiftAdded,
}: AddGiftModalProps) {
  const [tab, setTab] = useState<'search' | 'url' | 'manual'>('search');
  const [urlInput, setUrlInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search tab state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedStore, setSelectedStore] = useState<string>(initialStoreId);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [addingGiftId, setAddingGiftId] = useState<string | null>(null);
  const [addedGiftIds, setAddedGiftIds] = useState<Set<string>>(new Set());

  // Form Fields
  const [childId, setChildId] = useState(defaultChildId || childrenList[0]?.id || '');
  const [occasionId, setOccasionId] = useState(defaultOccasionId || occasionsList[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [storeName, setStoreName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [priority, setPriority] = useState<number>(2);

  // Sync defaults when modal opens or defaults change
  useEffect(() => {
    if (defaultChildId) setChildId(defaultChildId);
    if (defaultOccasionId) setOccasionId(defaultOccasionId);
    if (initialStoreId) setSelectedStore(initialStoreId);
    if (initialQuery) {
      setSearchQuery(initialQuery);
      handleSearch(initialQuery, initialStoreId);
    }
  }, [defaultChildId, defaultOccasionId, initialStoreId, initialQuery, isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (queryToSearch?: string, storeToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    const st = storeToSearch !== undefined ? storeToSearch : selectedStore;

    if (!q) return;
    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search-products?q=${encodeURIComponent(q)}&store=${encodeURIComponent(st)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la recherche');
      setSearchResults(data.results || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur de recherche';
      setError(message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickAdd = async (product: ProductSearchResult) => {
    if (!childId || !occasionId) {
      setError("Veuillez sélectionner un enfant et un événement.");
      return;
    }

    setAddingGiftId(product.id);
    setError(null);

    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: childId,
          occasion_id: occasionId,
          title: product.title,
          image_url: product.image_url,
          product_url: product.product_url,
          store_name: product.store_name,
          price: product.price,
          currency: 'CHF',
          priority: 2,
          is_favorite: 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de l'ajout");
      }

      setAddedGiftIds((prev) => new Set(prev).add(product.id));
      onGiftAdded();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur";
      setError(message);
    } finally {
      setAddingGiftId(null);
    }
  };

  const handleCustomizeProduct = (product: ProductSearchResult) => {
    setTitle(product.title);
    setImageUrl(product.image_url);
    setProductUrl(product.product_url);
    setStoreName(product.store_name);
    setPrice(product.price ? product.price.toString() : '');
    setPriority(2);
    setTab('manual');
  };

  const handleScrape = async () => {
    if (!urlInput.trim()) return;
    setIsScraping(true);
    setError(null);

    try {
      const res = await fetch('/api/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Impossible d analyser cette page');

      if (data.title) setTitle(data.title);
      if (data.image_url) setImageUrl(data.image_url);
      if (data.description) setDescription(data.description);
      if (data.store_name) setStoreName(data.store_name);
      if (data.price !== null && data.price !== undefined) setPrice(data.price.toString());
      setProductUrl(data.product_url || urlInput);

      setTab('manual');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur scraping';
      setError(message);
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !childId || !occasionId) {
      setError('Veuillez renseigner au moins le titre, l enfant et l occasion.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: childId,
          occasion_id: occasionId,
          title: title.trim(),
          description: description.trim() || null,
          image_url: imageUrl.trim() || null,
          product_url: productUrl.trim() || null,
          store_name: storeName.trim() || null,
          price: price ? parseFloat(price) : null,
          currency: 'CHF',
          priority,
          is_favorite: priority === 3 ? 1 : 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de l ajout');
      }

      onGiftAdded();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl apple-glass rounded-[2.5rem] p-5 sm:p-8 flex flex-col relative shadow-2xl my-6 max-h-[92vh] overflow-y-auto border border-white/20 dark:border-white/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 apple-press bg-zinc-200/50 dark:bg-zinc-800/50 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pr-10 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-bold mb-2 border border-rose-500/20">
            <span>🎅</span>
            <span>Hotte du Père Noël • Idées</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight">
            Ajouter une envie 🎁
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Recherche directe dans les magasins, extraction de lien ou lettre libre.
          </p>
        </div>

        {/* Global Destination Selector (Child & Occasion) */}
        <div className="p-3.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 mb-5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Pour :</span>
            <select
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
            >
              {childrenList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.avatar} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Événement :</span>
            <select
              value={occasionId}
              onChange={(e) => setOccasionId(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
            >
              {occasionsList.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Segmented Control iOS Tab */}
        <div className="flex p-1 bg-zinc-200/70 dark:bg-zinc-800/80 rounded-2xl mb-5">
          <button
            onClick={() => setTab('search')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 apple-press transition-all ${
              tab === 'search'
                ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-blue-500" />
            Chercher en magasin
          </button>
          <button
            onClick={() => setTab('url')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 apple-press transition-all ${
              tab === 'url'
                ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-indigo-500" />
            Coller un lien URL
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 apple-press transition-all ${
              tab === 'manual'
                ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Saisie manuelle
          </button>
        </div>

        {error && (
          <div className="p-3.5 mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold animate-apple-appear">
            {error}
          </div>
        )}

        {/* Tab 1: Direct Store Search */}
        {tab === 'search' && (
          <div className="space-y-4">
            {/* Search Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Que cherche l'enfant ? (ex: Lego Faucon Millenium, Switch, Vélo...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-3 rounded-2xl bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setHasSearched(false);
                    }}
                    className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 apple-press shadow-md shadow-blue-500/25 shrink-0 cursor-pointer"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Rechercher</span>
              </button>
            </form>

            {/* Store filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedStore('all');
                  if (searchQuery.trim()) handleSearch(searchQuery, 'all');
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap apple-press border transition-all ${
                  selectedStore === 'all'
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-xs'
                    : 'bg-white/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                🌟 Tous les magasins
              </button>
              {storesList.map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => {
                    setSelectedStore(store.id);
                    if (searchQuery.trim()) handleSearch(searchQuery, store.id);
                  }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap apple-press border flex items-center gap-1.5 transition-all ${
                    selectedStore === store.id
                      ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-xs'
                      : 'bg-white/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <span>{store.icon}</span>
                  <span>{store.name}</span>
                </button>
              ))}
            </div>

            {/* Suggestions Chips when no search yet */}
            {!hasSearched && (
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Idées populaires en 1 clic :
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SUGGESTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSearchQuery(item);
                        handleSearch(item, selectedStore);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 apple-press"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isSearching && (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Recherche des articles sur les boutiques officielles...
                </p>
              </div>
            )}

            {/* Results Grid */}
            {!isSearching && hasSearched && searchResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-semibold px-1">
                  <span>{searchResults.length} articles trouvés</span>
                  <span>Ajout immédiat en 1 clic</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
                  {searchResults.map((product) => {
                    const isAdded = addedGiftIds.has(product.id);
                    const isAdding = addingGiftId === product.id;

                    return (
                      <div
                        key={product.id}
                        className="apple-card rounded-2xl p-3 flex flex-col justify-between gap-3 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs hover:shadow-md transition-all group bg-white/60 dark:bg-zinc-900/60"
                      >
                        <div className="flex items-start gap-3">
                          {/* Product Image */}
                          <div className="w-20 h-20 rounded-xl bg-white p-1 border border-zinc-200/60 dark:border-zinc-700/60 shrink-0 flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200';
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                <span>{product.store_icon}</span>
                                <span className="truncate max-w-[90px]">{product.store_name}</span>
                              </span>
                              {product.price && (
                                <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400">
                                  ~{product.price.toFixed(2)} CHF
                                </span>
                              )}
                            </div>

                            <h4
                              className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors"
                              title={product.title}
                            >
                              {product.title}
                            </h4>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                          <a
                            href={product.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 apple-press text-[11px] font-medium flex items-center gap-1"
                            title="Voir la fiche sur la boutique"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden xs:inline">Boutique</span>
                          </a>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCustomizeProduct(product)}
                              className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 apple-press text-[11px] font-medium"
                              title="Personnaliser avant d'ajouter"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickAdd(product)}
                              disabled={isAdding || isAdded}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 apple-press transition-all cursor-pointer ${
                                isAdded
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs shadow-blue-500/30'
                              }`}
                            >
                              {isAdding ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Ajouté !</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Ajouter</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty results state */}
            {!isSearching && hasSearched && searchResults.length === 0 && (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Aucun article trouvé pour cette recherche.
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Essayez avec des mots plus simples (ex: Lego, Pokémon, Pat Patrouille) ou sélectionnez &quot;🌟 Tous les magasins&quot;.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Paste URL */}
        {tab === 'url' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Lien du produit (Lego, Fnac, Smyths, Galaxus, Oxybul, Amazon...)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs font-medium"
                />
                <button
                  type="button"
                  onClick={handleScrape}
                  disabled={isScraping || !urlInput.trim()}
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 apple-press disabled:opacity-50 shadow-md shadow-blue-500/25 shrink-0 cursor-pointer"
                >
                  {isScraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Extraire</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Astuce : Copiez le lien de la fiche article sur votre boutique préférée. L&apos;application récupère automatiquement la photo, le titre et le prix indicatif !
            </p>
          </div>
        )}

        {/* Tab 3: Manual / Review Form */}
        {tab === 'manual' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Nom du cadeau *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Coffret Lego Star Wars..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Prix indicatif (CHF)
                </label>
                <input
                  type="number"
                  step="0.05"
                  placeholder="Ex: 49.90"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Enseigne / Magasin
                </label>
                <input
                  type="text"
                  placeholder="Ex: Lego, Fnac..."
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Lien direct du produit (optionnel)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Lien de la photo / image (optionnel)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Niveau d&apos;envie de l&apos;enfant
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority(1)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold apple-press transition-all ${
                    priority === 1
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  ⭐ Petite idée
                </button>
                <button
                  type="button"
                  onClick={() => setPriority(2)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold apple-press transition-all ${
                    priority === 2
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  ⭐⭐ Super envie
                </button>
                <button
                  type="button"
                  onClick={() => setPriority(3)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold apple-press transition-all ${
                    priority === 3
                      ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  ❤️ Coup de cœur !
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 apple-press shadow-md shadow-blue-500/25 cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  <span>Enregistrer dans la liste</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
