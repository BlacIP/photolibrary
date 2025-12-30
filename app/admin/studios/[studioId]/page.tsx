"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  RiArrowLeftLine,
  RiHardDriveLine,
  RiImageLine,
  RiUser3Line,
  RiShieldCheckLine,
  RiShieldCrossLine,
  RiDeleteBinLine,
} from "@remixicon/react";
import { api } from "@/lib/api-client";

type Studio = {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  created_at: string;
};

type StudioStats = {
  photo_count: number | string;
  storage_bytes: number | string;
  client_count: number | string;
};

type StudioClient = {
  client_id: string;
  name: string;
  slug: string;
  subheading?: string;
  event_date: string;
  status: string;
  created_at: string;
  photo_count: number | string;
  storage_bytes: number | string;
};

type StudioOwner = {
  id: string;
  email: string;
  role: string;
  auth_provider: string;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
};

export default function StudioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studioId = params.studioId as string;

  const [studio, setStudio] = useState<Studio | null>(null);
  const [stats, setStats] = useState<StudioStats | null>(null);
  const [clients, setClients] = useState<StudioClient[]>([]);
  const [owners, setOwners] = useState<StudioOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const fetchStudio = async () => {
    const data = await api.get(`admin/studios/${studioId}`);
    setStudio(data.studio);
    setStats(data.stats);
    setOwners(Array.isArray(data.owners) ? data.owners : []);
  };

  const fetchClients = async () => {
    const data = await api.get(`admin/studios/${studioId}/clients`);
    setClients(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    Promise.all([fetchStudio(), fetchClients()])
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [studioId]);

  const updateStatus = async (status: string) => {
    if (!studio) return;
    const confirmMessage =
      status === "DELETED"
        ? "Delete this studio? This will block access for all users."
        : `Set studio status to ${status}?`;
    if (!confirm(confirmMessage)) return;

    setUpdatingStatus(true);
    try {
      await api.patch(`admin/studios/${studioId}/status`, { status });
      await fetchStudio();
    } catch (err) {
      console.error(err);
      alert("Failed to update studio status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-text-sub-600">Loading studio...</div>;
  }

  if (!studio) {
    return (
      <div className="p-8">
        <p className="text-text-sub-600">Studio not found.</p>
        <button
          onClick={() => router.push("/admin")}
          className="mt-4 text-sm text-primary-base hover:text-primary-dark"
        >
          Back to studios
        </button>
      </div>
    );
  }

  const photoCount = Number(stats?.photo_count || 0);
  const storageBytes = Number(stats?.storage_bytes || 0);
  const clientCount = Number(stats?.client_count || 0);

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-text-sub-600">
        <Link href="/admin" className="inline-flex items-center gap-1 hover:text-primary-base">
          <RiArrowLeftLine />
          Back to studios
        </Link>
        <span>•</span>
        <span>{studio.slug}</span>
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-title-h4 font-bold text-text-strong-950">{studio.name}</h1>
          <p className="text-sm text-text-sub-600">
            {studio.status} • {studio.plan} • Created {format(new Date(studio.created_at), "PPP")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateStatus("ACTIVE")}
            disabled={updatingStatus}
            className="inline-flex items-center gap-2 rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm font-medium text-text-strong-950 hover:border-primary-base"
          >
            <RiShieldCheckLine size={16} />
            Activate
          </button>
          <button
            onClick={() => updateStatus("SUSPENDED")}
            disabled={updatingStatus}
            className="inline-flex items-center gap-2 rounded-lg border border-stroke-soft-200 px-3 py-2 text-sm font-medium text-text-strong-950 hover:border-primary-base"
          >
            <RiShieldCrossLine size={16} />
            Suspend
          </button>
          <button
            onClick={() => updateStatus("DELETED")}
            disabled={updatingStatus}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:border-red-400"
          >
            <RiDeleteBinLine size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
          <div className="flex items-center gap-2 text-sm text-text-sub-600">
            <RiUser3Line size={16} />
            Clients
          </div>
          <div className="mt-2 text-2xl font-semibold text-text-strong-950">{clientCount}</div>
        </div>
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
          <div className="flex items-center gap-2 text-sm text-text-sub-600">
            <RiImageLine size={16} />
            Photos
          </div>
          <div className="mt-2 text-2xl font-semibold text-text-strong-950">{photoCount}</div>
        </div>
        <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4">
          <div className="flex items-center gap-2 text-sm text-text-sub-600">
            <RiHardDriveLine size={16} />
            Storage
          </div>
          <div className="mt-2 text-2xl font-semibold text-text-strong-950">
            {formatBytes(storageBytes)}
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-stroke-soft-200 bg-bg-white-0">
        <div className="flex items-center justify-between border-b border-stroke-soft-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-text-strong-950">Studio owners</h2>
          <span className="text-xs text-text-sub-600">{owners.length} total</span>
        </div>
        {owners.length === 0 ? (
          <div className="p-6 text-sm text-text-sub-600">No owners recorded.</div>
        ) : (
          <div className="divide-y divide-stroke-soft-200">
            {owners.map((owner) => (
              <div
                key={owner.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm"
              >
                <div>
                  <div className="font-semibold text-text-strong-950">
                    {owner.display_name || owner.email}
                  </div>
                  <div className="text-xs text-text-sub-600">
                    {owner.email} • {owner.role} • {(owner.auth_provider || "local").toUpperCase()}
                  </div>
                </div>
                <div className="text-xs text-text-sub-600">
                  Joined {format(new Date(owner.created_at), "PPP")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0">
        <div className="flex items-center justify-between border-b border-stroke-soft-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-text-strong-950">Clients</h2>
          <span className="text-xs text-text-sub-600">{clients.length} total</span>
        </div>
        {clients.length === 0 ? (
          <div className="p-6 text-sm text-text-sub-600">No clients yet.</div>
        ) : (
          <div className="divide-y divide-stroke-soft-200">
            {clients.map((client) => (
              <Link
                key={client.client_id}
                href={`/admin/studios/${studioId}/clients/${client.client_id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm hover:bg-bg-weak-50"
              >
                <div>
                  <div className="font-semibold text-text-strong-950">{client.name}</div>
                  <div className="text-xs text-text-sub-600">
                    {client.slug} • {format(new Date(client.event_date), "PPP")}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-sub-600">
                  <span>{Number(client.photo_count || 0)} photos</span>
                  <span>{formatBytes(Number(client.storage_bytes || 0))}</span>
                  <span className="uppercase">{client.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
