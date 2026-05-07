import { useTmdb } from "@/hooks/use-tmdb"
import { HeroCarousel } from "@/components/media/HeroCarousel"

export function HomePage() {
    const tmdb = useTmdb()

    return (
        <div className="min-h-screen overflow-hidden">
            <HeroCarousel tmdb={tmdb} />
            <section className={"mt-4 text-center italic h-30 flex items-center justify-center"}>
                More content coming soon. Stay tuned!
            </section>
        </div>
    )
}

export default HomePage
