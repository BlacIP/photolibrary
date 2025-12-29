'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RiUserLine, RiLogoutBoxLine, RiSettings4Line } from '@remixicon/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { api } from '@/lib/api-client';

export function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get('auth/me')
      .then(data => setUser(data))
      .catch(() => { });
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('auth/logout');
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (!user) return null; // Or placeholder skeleton

  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : user.email.substring(0, 2).toUpperCase();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-bg-weak-50 text-left outline-none focus:ring-2 focus:ring-primary-base transition-colors group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-base text-white font-semibold shadow-sm group-hover:opacity-90">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-strong-950 truncate">
              {user.name || 'Admin'}
            </p>
            <p className="text-xs text-text-sub-600 truncate">{user.email}</p>
          </div>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[220px] rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          side="right"
          align="end"
          sideOffset={10}
        >


          <DropdownMenu.Item className="outline-none">
            <Link
              href="/admin/profile"
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
            >
              <RiUserLine size={16} />
              My Profile
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item className="outline-none">
            <Link
              href="/admin/settings"
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
            >
              <RiSettings4Line size={16} />
              Settings
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />

          <DropdownMenu.Item
            onSelect={handleLogout}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer outline-none"
          >
            <RiLogoutBoxLine size={16} />
            Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
