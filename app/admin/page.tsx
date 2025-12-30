'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { api } from '@/lib/api-client';
import { RiUser3Line, RiImageLine, RiArrowRightLine } from '@remixicon/react';

interface Client {
  id: string;
  name: string;
  event_date: string;
  photo_count: number;
}

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('admin/legacy/clients')
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data);
        } else {
          console.error('Failed to load clients', data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-text-sub-600">Loading clients...</div>;
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-title-h4 font-bold text-text-strong-950">Clients</h2>
          <p className="text-paragraph-sm text-text-sub-600">
            Manage your photo gallery clients
          </p>
        </div>
        <Link
          href="/admin/new"
          className="rounded-lg bg-primary-base px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          + Create Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stroke-soft-200 bg-bg-white-0 p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg-weak-50">
            <RiUser3Line className="text-text-sub-600" />
          </div>
          <h3 className="text-lg font-semibold text-text-strong-950">No clients yet</h3>
          <p className="mt-1 text-sm text-text-sub-600">
            Get started by creating your first client gallery.
          </p>
          <Link
            href="/admin/new"
            className="mt-6 inline-block rounded-lg bg-bg-white-0 border border-stroke-soft-200 px-4 py-2 text-sm font-medium text-text-strong-950 hover:bg-bg-weak-50"
          >
            Create Client
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/admin/client/${client.id}`}
              className="group relative flex flex-col rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 transition-all hover:border-primary-base hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-base">
                  <RiUser3Line size={20} />
                </div>
                <div className="text-text-sub-600 group-hover:text-primary-base transition-colors">
                  <RiArrowRightLine size={20} />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-text-strong-950">{client.name}</h3>
                <p className="text-sm text-text-sub-600">
                  {format(new Date(client.event_date), 'PPP')}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1.5 border-t border-stroke-soft-200 pt-4 text-xs font-medium text-text-sub-600">
                <RiImageLine size={14} />
                <span>{client.photo_count} Photos</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
