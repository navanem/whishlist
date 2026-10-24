'use client';

import React, { useState } from 'react';
import { Child, Occasion, Store, Gift } from '@/types';
import { Plus, Trash2, Check, DollarSign, Users, Calendar, ShoppingBag, Key, RefreshCw } from 'lucide-react';

interface ParentDashboardProps {
  childrenList: Child[];
  occasionsList: Occasion[];
  storesList: Store[];
  giftsList: Gift[];
  parentPin: string;
  shareToken?: string;
  familyName: string;
  currency: string;
  onRefresh: () => void;
}

export default function ParentDashboard({
  childrenList,
  occasionsList,
  storesList,
  giftsList,
  parentPin,
  shareToken,
  familyName,
  currency,
  onRefresh,
}: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'budget' | 'children' | 'occasions' | 'stores' | 'security'>('budget');

  // Form states for additions
  const [newChildName, setNewChildName] = useState('');
  const [newChildAvatar, setNewChildAvatar] = useState('⭐');
  const [newChildColor, setNewChildColor] = useState('#0071e3');

  const [newOccasionTitle, setNewOccasionTitle] = useState('');
  const [newOccasionType, setNewOccasionType] = useState<'christmas' | 'birthday' | 'custom'>('christmas');
  const [newOccasionYear, setNewOccasionYear] = useState(new Date().getFullYear().toString());

  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreDomain, setNewStoreDomain] = useState('');
  const [newStoreSearchUrl, setNewStoreSearchUrl] = useState('');
  const [newStoreIcon, setNewStoreIcon] = useState('🛍️');

  const [newPin, setNewPin] = useState(parentPin);
  const [newFamilyName, setNewFamilyName] = useState(familyName);
  const [newCurrency, setNewCurrency] = useState(currency);
  const [message, setMessage] = useState<string | null>(null);

  // Budget calculations
  const totalEstimated = giftsList.reduce((acc, g) => acc + (g.price || 0), 0);
  const totalBought = giftsList
    .filter((g) => g.status === 'bought' || g.status === 'received')
    .reduce((acc, g) => acc + (g.price || 0), 0);
  const totalReserved = giftsList
    .filter((g) => g.status === 'reserved')
    .reduce((acc, g) => acc + (g.price || 0), 0);

  const handleAction = async (action: string, data: Record<string, unknown>) => {
    setMessage(null);
    try {
      const res = await fetch('/api/parent/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, pin: parentPin, data }),
      });
      if (res.ok) {
        setMessage('Modification enregistrée avec succès !');
        setTimeout(() => setMessage(null), 3000);
        onRefresh();
      } else {
        const err = await res.json();
        setMessage(`Erreur: ${err.error}`);
      }
    } catch {
      setMessage('Erreur réseau');
    }
  };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;
    handleAction('add_child', {
      name: newChildName,
      avatar: newChildAvatar,
      color: newChildColor,
    });
    setNewChildName('');
  };

  const handleAddOccasion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOccasionTitle.trim()) return;
    handleAction('add_occasion', {
      title: newOccasionTitle,
      type: newOccasionType,
      year: parseInt(newOccasionYear) || new Date().getFullYear(),
    });
    setNewOccasionTitle('');
  };

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newStoreSearchUrl.trim()) return;
    handleAction('add_store', {
      name: newStoreName,
      domain: newStoreDomain || 'web',
      search_url: newStoreSearchUrl,
      icon: newStoreIcon,
    });
    setNewStoreName('');
    setNewStoreDomain('');
    setNewStoreSearchUrl('');
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction('update_settings', {
      parent_pin: newPin,
      family_name: newFamilyName,
      currency: newCurrency,
    });
  };

  return (
    <div className="space-y-6">
      {/* Sub-nav Tabs */}
      <div className="flex flex-wrap p-1.5 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('budget')}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 apple-press ${
            activeTab === 'budget'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Budget & Suivi
        </button>
        <button
          onClick={() => setActiveTab('children')}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 apple-press ${
            activeTab === 'children'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Enfants ({childrenList.length})
        </button>
        <button
          onClick={() => setActiveTab('occasions')}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 apple-press ${
            activeTab === 'occasions'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Événements
        </button>
        <button
          onClick={() => setActiveTab('stores')}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 apple-press ${
            activeTab === 'stores'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Magasins
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 apple-press ${
            activeTab === 'security'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Sécurité & PIN
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4" />
          {message}
        </div>
      )}

      {/* Tab: Budget */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="apple-glass rounded-2xl p-5">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                Total Estimé (Toutes envies)
              </span>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totalEstimated.toFixed(2)} {currency}
              </div>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                {giftsList.length} cadeaux listés
              </span>
            </div>

            <div className="apple-glass rounded-2xl p-5">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                Acheté / Emballé
              </span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalBought.toFixed(2)} {currency}
              </div>
              <span className="text-[11px] text-emerald-600/70 mt-1 block">
                {giftsList.filter((g) => g.status === 'bought' || g.status === 'received').length} articles prêts
              </span>
            </div>

            <div className="apple-glass rounded-2xl p-5">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                Réservé par les proches
              </span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalReserved.toFixed(2)} {currency}
              </div>
              <span className="text-[11px] text-blue-600/70 mt-1 block">
                {giftsList.filter((g) => g.status === 'reserved').length} réservations famille
              </span>
            </div>
          </div>

          {/* Breakdown per child */}
          <div className="apple-glass rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Répartition par enfant
            </h4>
            <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
              {childrenList.map((child) => {
                const childGifts = giftsList.filter((g) => g.child_id === child.id);
                const childTotal = childGifts.reduce((acc, g) => acc + (g.price || 0), 0);
                const childBought = childGifts
                  .filter((g) => g.status === 'bought' || g.status === 'received')
                  .reduce((acc, g) => acc + (g.price || 0), 0);

                return (
                  <div key={child.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{child.avatar}</span>
                      <div>
                        <div className="font-semibold text-sm text-zinc-900 dark:text-white">
                          {child.name}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {childGifts.length} souhaits ({childBought.toFixed(2)} {currency} déjà achetés)
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-zinc-900 dark:text-white">
                        {childTotal.toFixed(2)} {currency}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Children */}
      {activeTab === 'children' && (
        <div className="space-y-6">
          <div className="apple-glass rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Ajouter un profil enfant
            </h4>
            <form onSubmit={handleAddChild} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs text-zinc-500 block mb-1">Prénom</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Arthur"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none border border-zinc-200 dark:border-zinc-700"
                />
              </div>
              <div className="w-24">
                <label className="text-xs text-zinc-500 block mb-1">Avatar</label>
                <input
                  type="text"
                  value={newChildAvatar}
                  onChange={(e) => setNewChildAvatar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm text-center outline-none border border-zinc-200 dark:border-zinc-700"
                />
              </div>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 apple-press shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </form>
          </div>

          <div className="apple-glass rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Profils existants
            </h4>
            <div className="space-y-2">
              {childrenList.map((child) => (
                <div
                  key={child.id}
                  className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/70 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{child.avatar}</span>
                    <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                      {child.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAction('delete_child', { id: child.id })}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 apple-press"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Occasions */}
      {activeTab === 'occasions' && (
        <div className="space-y-6">
          <div className="apple-glass rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Ajouter un événement
            </h4>
            <form onSubmit={handleAddOccasion} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs text-zinc-500 block mb-1">Titre de l&apos;événement</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Noël 2026, Anniversaire Chloé"
                  value={newOccasionTitle}
                  onChange={(e) => setNewOccasionTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none border border-zinc-200 dark:border-zinc-700"
                />
              </div>
              <div className="w-32">
                <label className="text-xs text-zinc-500 block mb-1">Type</label>
                <select
                  value={newOccasionType}
                  onChange={(e) => setNewOccasionType(e.target.value as 'christmas' | 'birthday' | 'custom')}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none border border-zinc-200 dark:border-zinc-700"
                >
                  <option value="christmas">🎅 Noël</option>
                  <option value="birthday">🎂 Anniversaire</option>
                  <option value="custom">✨ Personnalisé</option>
                </select>
              </div>
              <div className="w-24">
                <label className="text-xs text-zinc-500 block mb-1">Année</label>
                <input
                  type="number"
                  value={newOccasionYear}
                  onChange={(e) => setNewOccasionYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none border border-zinc-200 dark:border-zinc-700"
                />
              </div>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 apple-press shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </form>
          </div>

          <div className="apple-glass rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Événements existants
            </h4>
            <div className="space-y-2">
              {occasionsList.map((occ) => (
                <div
                  key={occ.id}
                  className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/70 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                      {occ.title}
                    </span>
                    <span className="text-xs text-zinc-400">({occ.year})</span>
                  </div>
                  <button
                    onClick={() => handleAction('delete_occasion', { id: occ.id })}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 apple-press"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Stores */}
      {activeTab === 'stores' && (
        <div className="space-y-6">
          <div className="apple-glass rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Ajouter une boutique personnalisée
            </h4>
            <form onSubmit={handleAddStore} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: King Jouet"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none border border-zinc-200 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Domaine</label>
                  <input
                    type="text"
                    placeholder="Ex: king-jouet.ch"
                    value={newStoreDomain}
                    onChange={(e) => setNewStoreDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none border border-zinc-200 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Icône / Emoji</label>
                  <input
                    type="text"
                    value={newStoreIcon}
                    onChange={(e) => setNewStoreIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none border border-zinc-200 dark:border-zinc-700"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">
                  URL de recherche (utiliser <code className="text-blue-500">{"{query}"}</code> pour le terme de recherche)
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://mon-magasin.ch/search?q={query}"
                  value={newStoreSearchUrl}
                  onChange={(e) => setNewStoreSearchUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none border border-zinc-200 dark:border-zinc-700 font-mono text-xs"
                />
              </div>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 apple-press shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Ajouter la boutique
              </button>
            </form>
          </div>

          <div className="apple-glass rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Boutiques actives
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {storesList.map((store) => (
                <div
                  key={store.id}
                  className="p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/70 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-lg">{store.icon}</span>
                    <div className="truncate">
                      <div className="font-semibold text-xs text-zinc-900 dark:text-white truncate">
                        {store.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">{store.domain}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAction('toggle_store', { id: store.id })}
                    className={`px-3 py-1 rounded-lg text-xs font-medium apple-press ${
                      store.is_enabled
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-zinc-200 text-zinc-500'
                    }`}
                  >
                    {store.is_enabled ? 'Actif' : 'Désactivé'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security & Settings */}
      {activeTab === 'security' && (
        <div className="apple-glass rounded-2xl p-6 space-y-4 max-w-lg">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
            Paramètres Généraux & Sécurité
          </h4>
          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Nom de la famille</label>
              <input
                type="text"
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none border border-zinc-200 dark:border-zinc-700"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 block mb-1">Devise d&apos;affichage</label>
              <input
                type="text"
                value={newCurrency}
                onChange={(e) => setNewCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none border border-zinc-200 dark:border-zinc-700"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 block mb-1">Code PIN Parents (4 chiffres)</label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm outline-none border border-zinc-200 dark:border-zinc-700 font-mono tracking-widest text-center"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-2 apple-press shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Mettre à jour les paramètres
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
