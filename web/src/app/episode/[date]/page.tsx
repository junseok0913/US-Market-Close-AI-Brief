import { getEpisode, getEpisodeDates } from '@/lib/data';
import { notFound } from 'next/navigation';
import EpisodePlayer from '@/components/EpisodePlayer';

interface EpisodePageProps {
  params: Promise<{ date: string }>;
}

export async function generateStaticParams() {
  const dates = await getEpisodeDates();
  return dates.map((date) => ({
    date,
  }));
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { date } = await params;

  let episode;
  try {
    episode = await getEpisode(date);
  } catch {
    notFound();
  }

  return <EpisodePlayer episode={episode} />;
}
