'use client';

import { useEffect, useState } from 'react';
import { App } from 'konsta/react';
import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'ios' | 'material'>('ios');

  useEffect(() => {
    const updateTheme = () => {
      if (window.innerWidth >= 1024) {
        setTheme('material');
      } else {
        setTheme('ios');
      }
    };

    updateTheme();
    window.addEventListener('resize', updateTheme);

    return () => {
      window.removeEventListener('resize', updateTheme);
    };
  }, []);

  return (
    <App theme={theme} dark iosHoverHighlight={false}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </App>
  );
}
