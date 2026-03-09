/**
 * Re-export Payload collection types from payload-types (synced with riot-backend).
 * Use these for app-wide type safety; for pagination see api.ts (PaginatedResponse).
 */
export type {
  Event,
  Category,
  Venue,
  Media,
  Organizer,
  User,
  SavedEvent,
} from './payload-types';

/**
 * Lexical/rich-text content shape used by Event.description and Venue.description.
 * Used by the Lexical renderer component. Aligned with Payload-generated description type.
 */
export interface LexicalContent {
  root: {
    type: string;
    children: {
      type: unknown;
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
