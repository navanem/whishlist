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
    }, 600);
  };

  const handleDelete = () => {
    if (isLoading) return;
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-sm apple-glass rounded-[2rem] p-8 flex flex-col items-center relative shadow-2xl transition-transform ${
          isError ? 'animate-shake' : ''
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 apple-press"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight mb-1">
          Espace Parents
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 text-center">
          Saisissez votre code PIN (par défaut : 1234)
        </p>

        {/* 4 dots indicator */}
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map((index) => {
            const filled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  filled
                    ? 'bg-blue-600 dark:bg-blue-400 scale-110 shadow-sm shadow-blue-500/40'
                    : 'border-2 border-zinc-300 dark:border-zinc-700 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[260px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              disabled={isLoading}
              className="w-16 h-16 rounded-full bg-zinc-200/60 dark:bg-zinc-800/80 hover:bg-zinc-300/80 dark:hover:bg-zinc-700/80 text-2xl font-normal text-zinc-900 dark:text-white flex items-center justify-center mx-auto apple-press"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-zinc-200/60 dark:bg-zinc-800/80 hover:bg-zinc-300/80 dark:hover:bg-zinc-700/80 text-2xl font-normal text-zinc-900 dark:text-white flex items-center justify-center mx-auto apple-press"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading || pin.length === 0}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white apple-press disabled:opacity-20"
            aria-label="Effacer"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
