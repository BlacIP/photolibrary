'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RiHomeLine, RiImageLine, RiSettings2Line, RiLogoutBoxLine, RiCameraLensLine } from '@remixicon/react';
import { cn } from '@/utils/cn';

const NAV_ITEMS = [
  { label: 'Home', href: '/admin', icon: RiHomeLine },
  { label: 'Clients', href: '/admin', icon: RiImageLine }, // Reusing admin home for now as it lists clients
  { label: 'Settings', href: '/admin/settings', icon: RiSettings2Line },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    // Basic logout: clear cookie (server side usually, but simplified here)
    // For now we just redirect to login which will overwrite logic or we can add a logout endpoint
    // Let's simplest way: force hard refresh on login page which clears state if not persisted, 
    // but correctly we need to clear cookie.
    // We didn't create logout API yet. 
    document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

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

          {/* Footer */}
          <div className="border-t border-stroke-soft-200 p-4">
             <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-error-base hover:bg-error-weak/10 transition-colors"
              >
                <RiLogoutBoxLine size={20} />
                Sign Out
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-5xl p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
