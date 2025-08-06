'use client';

import React, { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { Analytics } from "@vercel/analytics/react";

type ReviewState = 'idle' | 'loading' | 'reviewing' | 'results';

interface LayoutProps {
  children: ReactNode;
  reviewState?: ReviewState;
}

const Layout: React.FC<LayoutProps> = ({ children, reviewState }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  
  if (pathname === '/login' || pathname === '/signup') {
    return <>{children}</>;
  }

  const isImmersiveMode = reviewState === 'loading' || reviewState === 'reviewing';

  const mainClasses = isImmersiveMode
    ? 'flex-grow flex flex-col items-center justify-center p-4'
    : 'p-4 sm:p-6 lg:p-8';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out
        md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         <Sidebar onClose={closeSidebar} />
      </div>
     
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className="md:ml-64 flex flex-col min-h-screen">
        {!isImmersiveMode && (
          <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 p-4 flex items-center justify-between md:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-600 hover:text-slate-900"
              aria-label="メニューを開く"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <h1 className="text-lg font-bold text-slate-800">Sync Words</h1>
            <div className="w-6" />
          </header>
        )}
        
        <main className={mainClasses}>
          {children}
        </main>
      </div>
      <Analytics />
    </div>
  );
};

export default Layout;