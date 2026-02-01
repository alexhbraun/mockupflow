import React from 'react';
import { createRoot } from 'react-dom/client';
import RootLayout from './app/layout';
import LandingPage from './app/page';
import LoginPage from './app/login/page';
import SignupPage from './app/signup/page';
import AppLayout from './app/app/layout';
import Dashboard from './app/app/page';
import NewMockupPage from './app/app/mockups/new/page';
import BuilderPage from './app/app/mockups/[id]/page';
import ViewerPage from './app/m/[shareId]/page';
import { Router, usePathname } from './lib/router';
import './app/globals.css';

const AppContent = () => {
  const pathname = usePathname();

  if (pathname === '/') return <LandingPage />;
  if (pathname === '/login') return <LoginPage />;
  if (pathname === '/signup') return <SignupPage />;
  
  if (pathname.startsWith('/app')) {
    let content = <Dashboard />;
    if (pathname === '/app') content = <Dashboard />;
    else if (pathname === '/app/mockups/new') content = <NewMockupPage />;
    else if (pathname.startsWith('/app/mockups/')) content = <BuilderPage />;
    
    return <AppLayout>{content}</AppLayout>;
  }

  if (pathname.startsWith('/m/')) {
    return <ViewerPage />;
  }

  return <div className="p-8 text-center text-gray-500">404 - Page Not Found</div>;
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Router>
      <RootLayout>
        <AppContent />
      </RootLayout>
    </Router>
  </React.StrictMode>
);