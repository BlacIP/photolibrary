'use client';

import { SWRConfig } from 'swr';
import { api } from '@/lib/api-client';

type AppProvidersProps = {
  children: React.ReactNode;
};

const swrConfig = {
  fetcher: (key: string) => api.get(key),
  dedupingInterval: 60_000,
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
};

export default function AppProviders({ children }: AppProvidersProps) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
