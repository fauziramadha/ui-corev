import { useEffect, useMemo, useRef, useState } from "react"
import { type TMDB } from "@lorenzopant/tmdb"
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type HeroSlide = {
    title: string
    year: string
    rating: string
    description: string
    image: string
    badge: string
}

function toHeroSlides(
    tmdb: TMDB,
    response?: {
        results?: Array<{
            title?: string
            name?: string
            release_date?: string
            overview?: string
            vote_average?: number
            backdrop_path?: string | null
            poster_path?: string | null
            original_language?: string
        }>
    }
) {
    return (response?.results ?? [])
        .filter((movie) => movie.backdrop_path || movie.poster_path)
        .slice(0, 7)
        .map((movie, index) => ({
            title: movie.title ?? movie.name ?? "Untitled",
            year: movie.release_date?.slice(0, 4) ?? "TBA",
            rating: typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : "N/A",
            description: movie.overview?.trim() || "No synopsis available.",
            image: movie.backdrop_path ? tmdb.images.backdrop(movie.backdrop_path, "original") : tmdb.images.poster(movie.poster_path!, "original"),
            badge: index === 0 ? "Now Playing" : index === 1 ? "Trending" : "Popular",
        }))
}

export function HeroCarousel({ tmdb }: { tmdb: TMDB }) {
    const [heroApi, setHeroApi] = useState<CarouselApi>()
    const [activeSlide, setActiveSlide] = useState(0)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])

    const AUTOPLAY_DELAY = 6500
    const [progressKey, setProgressKey] = useState(0)

    const autoplayRef = useRef<number | null>(null)

    useEffect(() => {
        let mounted = true

        async function loadMovies() {
            setLoading(true)
            setError(null)

            try {
                const [nowPlaying] = await Promise.all([tmdb.movie_lists.now_playing()])

                if (!mounted) return

                setHeroSlides(toHeroSlides(tmdb, nowPlaying))
            } catch (fetchError) {
                if (!mounted) return

                console.error(fetchError)
                setError("TMDB movies could not be loaded. Check your API key in Settings.")
            } finally {
                if (mounted) setLoading(false)
            }
        }

        void loadMovies()

        return () => {
            mounted = false
        }
    }, [tmdb])

    const restartAutoplay = () => {
        if (!heroApi) return

        if (autoplayRef.current) {
            window.clearTimeout(autoplayRef.current)
        }

        autoplayRef.current = window.setTimeout(() => {
            heroApi.scrollNext()
        }, AUTOPLAY_DELAY)
    }

    useEffect(() => {
        if (!heroApi) return

        const onSelect = () => {
            setActiveSlide(heroApi.selectedScrollSnap())
            setProgressKey((prev) => prev + 1)
            restartAutoplay()
        }

        onSelect()

        heroApi.on("select", onSelect)
        heroApi.on("reInit", onSelect)

        return () => {
            heroApi.off("select", onSelect)
            heroApi.off("reInit", onSelect)
        }
    }, [heroApi])

    useEffect(() => {
        return () => {
            if (autoplayRef.current) {
                window.clearTimeout(autoplayRef.current)
            }
        }
    }, [])

    const heroEmptyState = useMemo(
        () => (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center text-foreground">
                <Sparkles className="size-8 text-primary" />
                <h1 className="text-2xl font-semibold">Loading TMDB movies...</h1>
                <p className="max-w-xl text-sm text-muted-foreground">The page is wired to the TMDB movie library and will populate as soon as the client can read your API key.</p>
            </div>
        ),
        []
    )

    if (error) {
        return (
            <div className="absolute top-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent>{error}</CardContent>
                </Card>
            </div>
        )
    }

    return (
        <main className="h-screen w-screen">
            {loading || heroSlides.length === 0 ? (
                heroEmptyState
            ) : (
                <Carousel setApi={setHeroApi} opts={{ loop: true }} className="h-full w-full">
                    <CarouselContent className="ml-0 h-full">
                        {heroSlides.map((slide) => (
                            <CarouselItem key={slide.title} className="pl-0">
                                <section className="relative h-screen w-full overflow-hidden">
                                    <div className="absolute inset-0">
                                        <img src={slide.image} alt={slide.title} className="h-full w-full object-cover object-center" />
                                    </div>

                                    <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(0,0,0,0.92)_10%,rgba(0,0,0,0.45)_45%,rgba(0,0,0,0.82)_100%)]" />

                                    <div className="relative z-10 flex h-full items-end">
                                        <div className="mx-auto w-full max-w-7xl px-6 pb-18 sm:px-8 lg:px-12 lg:pb-23">
                                            <div className="max-w-2xl space-y-5">
                                                <p className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-4 py-1 text-xs tracking-[0.25em] text-muted-foreground uppercase backdrop-blur-md">
                                                    <Sparkles className="size-3.5" />
                                                    {slide.badge}
                                                </p>

                                                <h1 className="text-5xl leading-[0.9] font-black text-balance text-foreground drop-shadow-xl">{slide.title}</h1>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground sm:text-base">
                                                    <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                                                        <Sparkles className="size-3.5" />
                                                        {slide.rating}
                                                    </span>
                                                    <span>{slide.year}</span>
                                                </div>

                                                <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
                                                    {slide.description.length > 240 ? `${slide.description.slice(0, 240).split(" ").slice(0, -1).join(" ")}...` : slide.description}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-3 pt-4">
                                                    <Button className="rounded-full px-7">
                                                        <PlayCircle className="size-4" />
                                                        Play
                                                    </Button>

                                                    <Button variant="outline" className="rounded-full border-border bg-background/30 px-7 text-foreground backdrop-blur-md">
                                                        <ArrowRight className="size-4" />
                                                        Learn more
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-3">
                        {heroSlides.map((slide, index) => {
                            const isActive = activeSlide === index

                            return (
                                <button
                                    key={`dot-${slide.title}`}
                                    onClick={() => {
                                        heroApi?.scrollTo(index)
                                        restartAutoplay()
                                        setProgressKey((prev) => prev + 1)
                                    }}
                                    aria-label={`Go to slide ${index + 1}`}
                                    className={`relative h-2.5 overflow-hidden rounded-full transition-all duration-300 ${isActive ? "w-10 bg-primary/20" : "w-2.5 bg-white/30 hover:bg-white/50"}`}
                                >
                                    {isActive ? <div key={`${progressKey}-${index}`} className="animate-carousel-progress absolute inset-0 origin-left rounded-full bg-primary" /> : null}
                                </button>
                            )
                        })}
                    </div>
                </Carousel>
            )}
        </main>
    )
}
