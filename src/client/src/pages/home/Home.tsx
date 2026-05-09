import { useTmdb } from "@/hooks/use-tmdb"
import { HeroCarousel } from "@/components/media/HeroCarousel/HeroCarousel"
import { MovieRail, TvRail } from "@/components/media/TypedRails.tsx"

export function HomePage() {
    const tmdb = useTmdb()

    return (
        <div className="min-h-screen overflow-hidden">
            <HeroCarousel tmdb={tmdb} fetcher={() => Promise.all([tmdb.movie_lists.now_playing(), tmdb.tv_lists.popular()])} />

            <div className="pointer-events-none relative -mt-12 h-13">
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/70 to-background py-4" />
            </div>

            <section className="flex flex-col gap-8 bg-background p-8">
                <MovieRail title="Popular Movies" fetcher={() => tmdb.movie_lists.popular({})} />

                <TvRail title="Trending TV Shows" fetcher={() => tmdb.tv_lists.popular({})} />

                <MovieRail title="Top Rated Movies" fetcher={() => tmdb.movie_lists.top_rated()} />
            </section>
        </div>
    )
}

export default HomePage
