export interface MediaSize {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  filesize?: number | null;
  filename?: string | null;
}

export interface Media {
  id: number;
  alt: string;
  caption?: string | null;
  credit?: string | null;
  tags?: string[] | null;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  sizes?: {
    thumbnail?: MediaSize;
    card?: MediaSize;
    feature?: MediaSize;
  };
  updatedAt: string;
  createdAt: string;
}

export interface Venue {
  id: number;
  name: string;
  slug?: string | null;
  description?: LexicalContent | null;
  address?: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    country?: string | null;
  };
  coordinates?: [number, number] | null;
  website?: string | null;
  phone?: string | null;
  capacity?: number | null;
  image?: (number | null) | Media;
  updatedAt: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  color?: string | null;
  parent?: (number | null) | Category;
  updatedAt: string;
  createdAt: string;
}

export interface Organizer {
  id: number;
  name: string;
  slug?: string | null;
  email?: string | null;
  website?: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface Event {
  id: number;
  title: string;
  slug?: string | null;
  featuredImage?: (number | null) | Media;
  description?: LexicalContent | null;
  isVirtual?: boolean | null;
  virtualUrl?: string | null;
  startDateTime: string;
  endDateTime?: string | null;
  isAllDay?: boolean | null;
  timezone?: string | null;
  venue?: (number | null) | Venue;
  website?: string | null;
  categories?: (number | Category)[] | null;
  organizers?: (number | Organizer)[] | null;
  status?: ('draft' | 'published' | 'cancelled' | 'postponed') | null;
  featured?: boolean | null;
  updatedAt: string;
  createdAt: string;
}

export interface SavedEvent {
  id: number;
  user: number | User;
  event: number | Event;
  savedAt: string;
  updatedAt: string;
  createdAt: string;
}

export interface User {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: (number | null) | Media;
  roles: ('admin' | 'editor' | 'attendee')[];
  email: string;
  updatedAt: string;
  createdAt: string;
}

export interface LexicalContent {
  root: {
    type: string;
    children: {
      type: string;
      version: number;
      [k: string]: unknown;
    }[];
    direction: ('ltr' | 'rtl') | null;
    format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
    indent: number;
    version: number;
  };
  [k: string]: unknown;
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}
