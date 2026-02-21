import { getShortsEpisode, getShortsEpisodeDates } from '@/lib/data';
import { notFound } from 'next/navigation';
import YouTubeShortsPlayer from '@/components/YouTubeShortsPlayer';

interface YouTubeShortsPageProps {
  params: Promise<{ date: string }>;
}

export async function generateStaticParams() {
  const dates = await getShortsEpisodeDates();
  return dates.map((date) => ({
    date,
  }));
}

export default async function YouTubeShortsPage({ params }: YouTubeShortsPageProps) {
  const { date } = await params;
  const episode = await getShortsEpisode(date).catch(() => null);
  if (!episode) {
    notFound();
  }

  return <YouTubeShortsPlayer episode={episode} />;
}
