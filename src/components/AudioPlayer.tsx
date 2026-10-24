'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/christmas-music.mp3');
    audio.loop = true;
    audio.volume = 0.18; // soft background volume
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.log('Audio autoplay prevented:', e);
      });
    }
  };

  return (
    <button
      onClick={togglePlay}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 apple-press border transition-colors ${
        isPlaying
          ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-200/60 dark:border-red-900/40 shadow-xs'
          : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700/80'
      }`}
      title={isPlaying ? 'Couper la musique de Noël' : 'Activer la musique de Noël'}
      aria-label={isPlaying ? 'Couper la musique' : 'Activer la musique'}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400 animate-pulse" />
          <span className="hidden md:inline">Ambiance Noël</span>
        </>
      ) : (
        <>
          <Music className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Musique</span>
        </>
      )}
    </button>
  );
}
