import { getEpisode, getEpisodeDates } from '@/lib/data';
import { notFound } from 'next/navigation';
import YouTubeThumbnailView from '@/components/YouTubeThumbnailView';

interface YouTubeThumbnailPageProps {
  params: Promise<{ date: string }>;
  searchParams?: Promise<{ slide?: string }>;
}

export async function generateStaticParams() {
  const dates = await getEpisodeDates();
  return dates.map((date) => ({
    date,
  }));
}

export default async function YouTubeThumbnailPage({
  params,
  searchParams,
}: YouTubeThumbnailPageProps) {
  const { date } = await params;
  const query = await searchParams;
  const slideParam = Number.parseInt(query?.slide ?? '0', 10);
  const slideIndex = Number.isFinite(slideParam) ? slideParam : 0;

  const episode = await getEpisode(date).catch(() => null);
  if (!episode) {
    notFound();
  }

  // Always resolve slide set by route date (storage date). episode.date may be display-shifted.
  return <YouTubeThumbnailView episodeDate={date} slideIndex={slideIndex} />;
}
