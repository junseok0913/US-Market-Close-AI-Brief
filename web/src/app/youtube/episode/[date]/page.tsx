import { getEpisode, getEpisodeDates } from '@/lib/data';
import { notFound } from 'next/navigation';
import YouTubeEpisodePlayer from '@/components/YouTubeEpisodePlayer';

interface YouTubeEpisodePageProps {
  params: Promise<{ date: string }>;
}

export async function generateStaticParams() {
  const dates = await getEpisodeDates();
  return dates.map((date) => ({
    date,
  }));
}

export default async function YouTubeEpisodePage({ params }: YouTubeEpisodePageProps) {
  const { date } = await params;
  const episode = await getEpisode(date).catch(() => null);
  if (!episode) {
    notFound();
  }

  return <YouTubeEpisodePlayer episode={episode} />;
}
