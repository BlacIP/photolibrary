export type Photo = {
  id: string;
  url: string;
  filename: string;
  width?: number;
  height?: number;
};

export type GalleryLightbox = {
  open: boolean;
  url: string;
  filename: string;
} | null;
