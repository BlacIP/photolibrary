export type Studio = {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  created_at: string;
};

export type StudioStats = {
  photo_count: number | string;
  storage_bytes: number | string;
  client_count: number | string;
};

export type StudioClient = {
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

export type StudioOwner = {
  id: string;
  email: string;
  role: string;
  auth_provider: string;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
};

export type StudioDetailResponse = {
  studio: Studio;
  stats: StudioStats;
  owners: StudioOwner[];
};
