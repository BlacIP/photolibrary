'use client';

import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import SessionGuard from '@/components/session-guard';
import { AdminShell } from 'photostudio-shared/components/admin/admin-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminShell
      guard={<SessionGuard />}
      sidebar={<AppSidebar activePath={pathname} />}
      headerTitle="Studio Manager"
      headerBadge={
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-base text-xs font-semibold">
          SM
        </span>
      }
    >
      {children}
    </AdminShell>
  );
}
