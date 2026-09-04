'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { HeroBanner } from '@/components/HeroBanner';
import { MovieRow } from '@/components/MovieRow';
import type { HomepageSection, Movie } from '@/lib/shared';

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const { data } = await api.get<{ hero: Movie | null; sections: HomepageSection[] }>('/homepage');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="pt-16">
      {data?.hero && <HeroBanner movie={data.hero} />}
      {data?.sections?.map((section) => (
        <MovieRow key={section.id} title={section.title} movies={section.movies ?? []} />
      ))}
    </div>
  );
}
