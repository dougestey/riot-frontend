import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEvent } from '@/lib/api';
import { EventDetail } from '@/components/EventDetail';
import type { Media } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return { title: 'Event Not Found | RIOT' };
  }

  const image =
    event.featuredImage && typeof event.featuredImage !== 'number'
      ? (event.featuredImage as Media).sizes?.feature?.url ?? (event.featuredImage as Media).url
      : undefined;

  return {
    title: `${event.title} | RIOT`,
    description: `${event.title} - Discover events near you on RIOT`,
    openGraph: {
      title: event.title,
      description: `${event.title} - Discover events near you on RIOT`,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  return <EventDetail event={event} />;
}
