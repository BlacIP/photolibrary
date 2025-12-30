"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { RiBuildingLine, RiImageLine, RiArrowRightLine, RiUser3Line, RiHardDriveLine } from "@remixicon/react";
import { api } from "@/lib/api-client";

interface StudioRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  created_at: string;
  photo_count: number | string;
  storage_bytes: number | string;
  client_count: number | string;
}

export default function AdminStudiosPage() {
  const [studios, setStudios] = useState<StudioRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("admin/studios")
      .then((data) => {
        if (Array.isArray(data)) {
          setStudios(data);
        } else {
          console.error("Failed to load studios", data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (loading) {
    return <div className="p-8 text-center text-text-sub-600">Loading studios...</div>;
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-title-h4 font-bold text-text-strong-950">Studios</h2>
          <p className="text-paragraph-sm text-text-sub-600">Manage studios and view upload totals</p>
        </div>
      </div>

      {studios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stroke-soft-200 bg-bg-white-0 p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg-weak-50">
            <RiBuildingLine className="text-text-sub-600" />
          </div>
          <h3 className="text-lg font-semibold text-text-strong-950">No studios yet</h3>
          <p className="mt-1 text-sm text-text-sub-600">
            Studios register through the studio app. New studios will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio) => (
            <Link
              key={studio.id}
              href={`/admin/studios/${studio.id}`}
              className="group relative flex flex-col rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-5 transition-all hover:border-primary-base hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-base">
                  <RiBuildingLine size={20} />
                </div>
                <div className="text-text-sub-600 group-hover:text-primary-base transition-colors">
                  <RiArrowRightLine size={20} />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-text-strong-950">{studio.name}</h3>
                <p className="text-sm text-text-sub-600">
                  {studio.slug} • {format(new Date(studio.created_at), "PPP")}
                </p>
              </div>

              <div className="mt-4 grid gap-2 border-t border-stroke-soft-200 pt-4 text-xs font-medium text-text-sub-600">
                <div className="flex items-center gap-1.5">
                  <RiUser3Line size={14} />
                  <span>{Number(studio.client_count || 0)} Clients</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RiImageLine size={14} />
                  <span>{Number(studio.photo_count || 0)} Photos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RiHardDriveLine size={14} />
                  <span>{formatBytes(Number(studio.storage_bytes || 0))}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
