'use client';

import { App } from 'konsta/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <App theme="ios">{children}</App>;
}
