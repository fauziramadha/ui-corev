import { useMemo, useState } from "react"
import type { TMDB } from "@lorenzopant/tmdb"
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react"
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { useHeroSlides } from "./use-heroslides"
import type { HeroFetcherResult } from "./types"
import { useHeroAutoplay } from "./use-hero-autoplay"
import { Button } from "@/components/ui/button.tsx"
import "@/styles/animation.css"

export function HeroCarousel({ tmdb, fetcher }: { tmdb: TMDB; fetcher: HeroFetcherResult }) {
    const { slides, loading } = useHeroSlides(tmdb, fetcher)

    const [heroApi, setHeroApi] = useState<CarouselApi>()
    const [activeSlide, setActiveSlide] = useState(0)
    const [progressKey, setProgressKey] = useState(0)

    useHeroAutoplay({
        heroApi,
        enabled: true,
        slideCount: slides.length,
        onSelect: (index) => {
            setActiveSlide(index)
            setProgressKey((p) => p + 1)
        },
    })

    const heroEmptyState = useMemo(
        () => (
            <div className="flex min-h-100 flex-col items-center justify-center gap-4 px-6 text-center">
                <Sparkles className="size-8 text-primary" />
                <h1 className="text-2xl font-semibold">Loading content...</h1>
            </div>
        ),
        []
    )

    if (loading || slides.length === 0) return heroEmptyState

    return (
        <Carousel setApi={setHeroApi} opts={{ loop: true }} className="h-full w-full">
            <CarouselContent className="ml-0 h-full">
                {slides.map((slide) => (
                    <CarouselItem key={`${slide.title}-${slide.year}`} className="pl-0">
                        <section className="relative h-screen w-full overflow-hidden">
                            <div className="absolute inset-0">
                                <img src={slide.image} alt={slide.title} className="h-full w-full object-cover object-center" />
                            </div>

                            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(0,0,0,0.92)_10%,rgba(0,0,0,0.45)_45%,rgba(0,0,0,0.82)_100%)]" />

                            <div className="relative z-10 flex h-full items-end">
                                <div className="mx-auto w-full max-w-7xl px-6 pb-18 sm:px-8 lg:px-12 lg:pb-23">
                                    <div className="max-w-2xl space-y-5">
                                        <img className="max-h-34 max-w-140" src={slide.logo} alt={slide.title} />

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground sm:text-base">
                                            <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                                                <Sparkles className="size-3.5" />
                                                {slide.rating}
                                            </span>
                                            <span>{new Date(slide.year).toLocaleDateString()}</span>
                                            <span>{slide.runtime}</span>
                                        </div>

                                        <p className="max-w-xl leading-relaxed text-muted-foreground">
                                            {slide.description.length > 235 ? `${slide.description.slice(0, 235).split(" ").slice(0, -1).join(" ")}...` : slide.description}
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
                {slides.map((slide, index) => {
                    const isActive = activeSlide === index

                    return (
                        <button
                            key={`dot-${slide.title}-${slide.year}`}
                            onClick={() => {
                                heroApi?.scrollTo(index)
                                setProgressKey((p) => p + 1)
                            }}
                            className={`relative h-2.5 overflow-hidden rounded-full transition-all duration-300 ${isActive ? "w-10 bg-primary/20" : "w-2.5 bg-white/30 hover:bg-white/50"}`}
                        >
                            {isActive && <div key={`${progressKey}-${index}`} className="animate-carousel-progress absolute inset-0 origin-left rounded-full bg-primary" />}
                        </button>
                    )
                })}
            </div>
        </Carousel>
    )
}
