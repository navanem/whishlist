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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDigit = async (digit: string) => {
    if (pin.length >= 4 || isLoading) return;
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMessage(null);

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
          setErrorMessage(null);
          onClose();
        } else {
          const errData = await res.json().catch(() => ({}));
          triggerError(errData.error || 'Code PIN incorrect');
        }
      } catch {
        triggerError('Erreur de connexion');
      }
    }
  };

  const triggerError = (msg: string) => {
    setIsError(true);
    setIsLoading(false);
    setErrorMessage(msg);
    setTimeout(() => {
      setPin('');
      setIsError(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className={`w-full max-w-sm m3-dialog rounded-t-[28px] sm:rounded-[28px] p-6 sm:p-7 flex flex-col items-center relative border border-[var(--md-sys-color-outline-variant)] transition-transform animate-slide-up sm:animate-m3-appear pb-[calc(2rem+env(safe-area-inset-bottom,0px))] ${
          isError ? 'animate-shake' : ''
        }`}
      >
        {/* Drag handle for mobile bottom sheet */}
        <div className="m3-drag-handle sm:hidden" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 m3-icon-btn cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-[var(--md-sys-color-primary-container)] flex items-center justify-center text-[var(--md-sys-color-on-primary-container)] mb-3">
          <Lock className="w-5 h-5" />
        </div>

        <h3 className="text-xl font-medium text-[var(--md-sys-color-on-surface)] tracking-tight mb-1">
          Espace Parents
        </h3>
        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-6 text-center">
          Saisissez votre code PIN (par défaut : 1234)
        </p>

        {/* 4 dots indicator */}
        <div className="flex gap-4 mb-4">
          {[0, 1, 2, 3].map((index) => {
            const filled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  filled
                    ? 'bg-[var(--md-sys-color-primary)] scale-110 shadow-xs'
                    : 'border-2 border-[var(--md-sys-color-outline)] bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {errorMessage && (
          <div className="mb-4 px-3 py-1.5 rounded-full bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-xs text-center font-medium max-w-xs animate-shake">
            {errorMessage}
          </div>
        )}

        {/* Numeric keypad (Material 3 standard) */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="w-16 h-16 rounded-full bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-highest)] active:bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-surface)] text-xl font-medium flex items-center justify-center mx-auto transition-colors cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="w-16 h-16 rounded-full bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-container-highest)] active:bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-surface)] text-xl font-medium flex items-center justify-center mx-auto transition-colors cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => !isLoading && setPin((prev) => prev.slice(0, -1))}
            className="w-16 h-16 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] flex items-center justify-center mx-auto transition-colors cursor-pointer"
            aria-label="Effacer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
