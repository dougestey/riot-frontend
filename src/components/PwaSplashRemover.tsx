'use client';

import { useEffect } from 'react';

const SPLASH_DURATION_MS = 700;
const FADE_DURATION_MS = 250;

export function PwaSplashRemover() {
  useEffect(() => {
    const el = document.getElementById('pwa-splash');
    if (!el) return;

    let removeTimerId: number | null = null;

    const hideTimerId = window.setTimeout(() => {
      el.style.transition = `opacity ${FADE_DURATION_MS}ms ease-out`;
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';

      removeTimerId = window.setTimeout(() => {
        el.remove();
      }, FADE_DURATION_MS);
    }, SPLASH_DURATION_MS);

    return () => {
      window.clearTimeout(hideTimerId);
      if (removeTimerId) window.clearTimeout(removeTimerId);
    };
  }, []);

  return null;
}
