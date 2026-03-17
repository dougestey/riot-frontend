'use client';

import { useEffect } from 'react';

const SPLASH_DURATION_MS = 700;
const FADE_DURATION_MS = 250;

export function PwaSplashRemover() {
  useEffect(() => {
    const el = document.getElementById('pwa-splash');
    if (!el) return;

    const isWarmNav = sessionStorage.getItem('riot-loaded') === '1';

    if (isWarmNav) {
      // Skip splash animation on in-app navigations
      el.style.display = 'none';
      return;
    }

    // First visit / cold start — show splash then fade out
    sessionStorage.setItem('riot-loaded', '1');

    const hideTimerId = window.setTimeout(() => {
      el.style.transition = `opacity ${FADE_DURATION_MS}ms ease-out`;
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';

      window.setTimeout(() => {
        (el as HTMLElement).style.display = 'none';
      }, FADE_DURATION_MS);
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(hideTimerId);
  }, []);

  return null;
}
