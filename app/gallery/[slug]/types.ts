export interface Photo {
  id: string;
  url: string;
  public_id: string;
  filename: string;
}

export interface Client {
  id: string;
  name: string;
  slug: string;
  event_date: string;
  status?: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  subheading?: string;
  header_media_url?: string;
  header_media_type?: 'image' | 'video';
  photos: Photo[];
}
