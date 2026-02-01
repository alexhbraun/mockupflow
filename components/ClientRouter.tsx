'use client';
import { Router } from '@/lib/router';
import { useEffect, useState } from 'react';

export function ClientRouter({ children }: { children?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <Router>{children}</Router>;
}



