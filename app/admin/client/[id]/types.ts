export interface Photo {
  id: string;
  url: string;
  filename: string;
  public_id: string;
}

export interface Client {
  id: string;
  name: string;
  event_date: string;
  slug: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  subheading?: string;
  photos: Photo[];
  header_media_url?: string;
  header_media_type?: 'image' | 'video';
}

export type ClientResponse = {
  client: Client;
  photos: Photo[];
};

export type HeaderMediaState = {
  url: string | null;
  type: 'image' | 'video' | null;
};

export type LightboxState = {
  open: boolean;
  url: string | null;
  type: 'image' | 'video';
} | null;

export type AlertState = {
  open: boolean;
  title: string;
  message: string;
};

export type ConfirmState = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
};
