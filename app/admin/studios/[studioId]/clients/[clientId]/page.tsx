"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { RiArrowLeftLine, RiHardDriveLine, RiImageLine } from "@remixicon/react";
import { api } from "@/lib/api-client";

type ClientStats = {
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

export default function StudioClientDetailPage() {
  const params = useParams();
  const studioId = params.studioId as string;
  const clientId = params.clientId as string;

  const [client, setClient] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  useEffect(() => {
    api
      .get(`admin/studios/${studioId}/clients/${clientId}`)
      .then((data) => setClient(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [studioId, clientId]);

  if (loading) {
    return <div className="p-8 text-center text-text-sub-600">Loading client...</div>;
  }

  if (!client) {
    return (
      <div className="p-8 text-text-sub-600">
        Client not found.{" "}
        <Link className="text-primary-base" href={`/admin/studios/${studioId}`}>
          Back to studio
        </Link>
      </div>
    );
  }

  const photoCount = Number(client.photo_count || 0);
  const storageBytes = Number(client.storage_bytes || 0);

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-text-sub-600">
        <Link href={`/admin/studios/${studioId}`} className="inline-flex items-center gap-1 hover:text-primary-base">
          <RiArrowLeftLine />
          Back to studio
        </Link>
        <span>•</span>
        <span>{client.slug}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-title-h4 font-bold text-text-strong-950">{client.name}</h1>
        <p className="text-sm text-text-sub-600">
          {client.status} • {format(new Date(client.event_date), "PPP")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
    </div>
  );
}
