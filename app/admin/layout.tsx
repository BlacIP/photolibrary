'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RiHomeLine, RiSettings2Line, RiCameraLensLine } from '@remixicon/react';
import { cn } from '@/utils/cn';
import { UserNav } from '@/components/user-nav';

const NAV_ITEMS = [
  { label: 'Home', href: '/admin', icon: RiHomeLine },
  { label: 'Settings', href: '/admin/settings', icon: RiSettings2Line },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-bg-weak-50 text-text-strong-950 font-sans">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-stroke-soft-200 bg-bg-white-0">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-stroke-soft-200">
            <div className="flex items-center gap-2 font-bold text-lg text-text-strong-950">
               <RiCameraLensLine className="text-primary-base" size={24} />
               <span>Studio Manager</span>
            </div>
          </div>

          {/* Nav */}
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col h-screen">
       

        <div className="flex-1 overflow-y-auto p-8">
          <div className="container mx-auto max-w-5xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
