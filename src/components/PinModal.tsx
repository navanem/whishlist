'use client';

import React, { useState } from 'react';
import { Delete, X, Lock } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
}

export default function PinModal({ isOpen, onClose, onSuccess }: PinModalProps) {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDigit = async (digit: string) => {
    if (pin.length >= 4 || isLoading) return;
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/parent/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify_pin', pin: newPin }),
        });
        if (res.ok) {
          onSuccess(newPin);
          setPin('');
          setIsLoading(false);
          onClose();
        } else {
          triggerError();
        }
      } catch {
        triggerError();
      }
    }
  };

  const triggerError = () => {
    setIsError(true);
    setIsLoading(false);
    setTimeout(() => {
      setPin('');
      setIsError(false);
    }, 500);
  };

  const handleDelete = () => {
    if (isLoading) return;
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-sm bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 flex flex-col items-center relative shadow-2xl border-t sm:border border-zinc-200/80 dark:border-zinc-800 transition-transform animate-slide-up sm:animate-apple-appear pb-[calc(2rem+env(safe-area-inset-bottom,0px))] ${
          isError ? 'animate-shake' : ''
        }`}
      >
        {/* Grab bar indicator on mobile */}
        <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 apple-press bg-zinc-100 dark:bg-zinc-800 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
          <Lock className="w-5 h-5" />
        </div>

        <h3 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight mb-1">
          Espace Parents
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 text-center">
          Saisissez votre code PIN (par défaut : 1234)
        </p>

        {/* 4 dots indicator */}
        <div className="flex gap-4 mb-7">
          {[0, 1, 2, 3].map((index) => {
            const filled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  filled
                    ? 'bg-blue-600 scale-110'
                    : 'border border-zinc-300 dark:border-zinc-700 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {/* iOS Native Pin Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="w-16 h-16 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xl font-semibold flex items-center justify-center apple-press mx-auto transition-colors"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="w-16 h-16 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xl font-semibold flex items-center justify-center apple-press mx-auto transition-colors"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="w-16 h-16 rounded-full text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center justify-center apple-press mx-auto transition-colors"
            aria-label="Effacer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
