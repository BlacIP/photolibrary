'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiHomeLine, RiSettings2Line, RiCameraLensLine, RiMenuLine, RiCloseLine } from '@remixicon/react';
import { cn } from '@/utils/cn';
import { UserNav } from '@/components/user-nav';

const NAV_ITEMS = [
  { label: 'Home', href: '/admin', icon: RiHomeLine },
  { label: 'Settings', href: '/admin/settings', icon: RiSettings2Line },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-bg-weak-50 text-text-strong-950 font-sans overflow-hidden">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-stroke-soft-200 bg-bg-white-0 z-30">
        <div className="flex h-16 items-center px-6 border-b border-stroke-soft-200">
            <div className="flex items-center gap-2 font-bold text-lg text-text-strong-950">
               <RiCameraLensLine className="text-primary-base" size={24} />
               <span>Studio Manager</span>
            </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-bg-weak-50 text-primary-base'
                      : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950'
                  )}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <div className="border-t border-stroke-soft-200 p-4">
            <UserNav />
        </div>
      </aside>

      {/* Mobile Header (Visible only on Mobile) */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-bg-white-0 border-b border-stroke-soft-200 z-20 px-4 flex items-center justify-between">
         <div className="flex items-center gap-2 font-bold text-lg text-text-strong-950">
            <RiCameraLensLine className="text-primary-base" size={24} />
            <span>Studio Manager</span>
         </div>
         <button 
           onClick={() => setIsMobileMenuOpen(true)}
           className="p-2 text-text-strong-950 hover:bg-bg-weak-50 rounded-lg"
         >
           <RiMenuLine size={24} />
         </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
             onClick={() => setIsMobileMenuOpen(false)}
           />
           
           {/* Slide-out Menu */}
           <aside className="absolute inset-y-0 left-0 w-64 bg-bg-white-0 shadow-xl animate-in slide-in-from-left duration-200 flex flex-col">
              <div className="flex h-16 items-center justify-between px-6 border-b border-stroke-soft-200">
                <span className="font-bold text-lg">Menu</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-text-sub-600 hover:text-text-strong-950 hover:bg-bg-weak-50 rounded-lg"
                >
                   <RiCloseLine size={24} />
                </button>
              </div>

              <nav className="flex-1 space-y-1 px-3 py-6">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-bg-weak-50 text-primary-base'
                          : 'text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950'
                      )}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-stroke-soft-200 p-4">
                <UserNav />
              </div>
           </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen md:ml-64 pt-16 md:pt-0 transition-all duration-300">
       

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="container mx-auto max-w-5xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
