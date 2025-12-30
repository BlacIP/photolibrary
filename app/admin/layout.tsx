'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from '@/components/app-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-bg-weak-50 text-text-strong-950">
        <div className="flex w-full px-2 md:px-3">
          <AppSidebar activePath={pathname} />
          <SidebarInset className="flex flex-1 min-w-0 flex-col !m-0 !ml-0 !rounded-none !shadow-none px-0">
            <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-stroke-soft-200 bg-bg-white-0/80 px-3 md:px-5 backdrop-blur">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-base text-white text-xs">SM</span>
                <span>Studio Manager</span>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto px-3 pb-6 pt-4 md:px-5 md:pb-8">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
