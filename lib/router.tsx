import React, { useState, useEffect, useContext, createContext } from 'react';

// Simple event bus for navigation
const NAV_EVENT = 'pushState';

function push(url: string) {
  window.history.pushState({}, '', url);
  window.dispatchEvent(new Event(NAV_EVENT));
}

function replace(url: string) {
  window.history.replaceState({}, '', url);
  window.dispatchEvent(new Event(NAV_EVENT));
}

const RouterContext = createContext<{
  push: (url: string) => void,
  replace: (url: string) => void,
  back: () => void,
  params: Record<string, string>
}>({
  push: () => { },
  replace: () => { },
  back: () => { },
  params: {}
});

export const useRouter = () => useContext(RouterContext);

export const useParams = () => useContext(RouterContext).params;

export const usePathname = () => {
  const [path, setPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setPath(window.location.pathname);
    window.addEventListener(NAV_EVENT, handler);
    window.addEventListener('popstate', handler);
    return () => {
      window.removeEventListener(NAV_EVENT, handler);
      window.removeEventListener('popstate', handler);
    };
  }, []);
  return path;
};

export const useSearchParams = () => {
  const [params, setParams] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setParams(new URLSearchParams(window.location.search));
    window.addEventListener(NAV_EVENT, handler);
    window.addEventListener('popstate', handler);
    return () => {
      window.removeEventListener(NAV_EVENT, handler);
      window.removeEventListener('popstate', handler);
    };
  }, []);

  return params;
};

// Router Component for index.tsx
export const Router = ({ children }: { children?: React.ReactNode }) => {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener(NAV_EVENT, handler);
    window.addEventListener('popstate', handler);
    return () => {
      window.removeEventListener(NAV_EVENT, handler);
      window.removeEventListener('popstate', handler);
    };
  }, []);

  // Simple route matching logic to extract params
  useEffect(() => {
    // Check for /m/:shareId
    const mMatch = currentPath.match(/^\/m\/([^/]+)/);
    if (mMatch) {
      setParams({ shareId: mMatch[1] });
      return;
    }
    // Check for /app/mockups/:id (ignoring query params)
    const mockupMatch = currentPath.split('?')[0].match(/^\/app\/mockups\/([^/]+)/);
    if (mockupMatch && mockupMatch[1] !== 'new') {
      setParams({ id: mockupMatch[1] });
      return;
    }
    setParams({});
  }, [currentPath]);

  const value = {
    push,
    replace,
    back: () => window.history.back(),
    params
  };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
};