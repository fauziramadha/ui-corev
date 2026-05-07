import { ArrowRight, PlayCircle, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type RailMovie = {
    title: string
    year: string
    type: string
    language: string
    description: string
    rating: string
    image: string
}

type MovieRailProps = {
    title: string
    movies: RailMovie[]
}

export function MovieRail({ title, movies }: MovieRailProps) {
    return (
        <section className="mb-10 last:mb-0">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">{title}</h2>
                <Button variant="ghost" size="sm" className="hidden rounded-full text-zinc-300 hover:bg-white/10 hover:text-white md:inline-flex">
                    View more
                    <ArrowRight className="size-4" />
                </Button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {movies.map((movie) => (
                    <PosterCard key={`${title}-${movie.title}`} movie={movie} />
                ))}
            </div>
        </section>
    )
}

function PosterCard({ movie }: { movie: RailMovie }) {
    return (
        <Card
            size="sm"
            className={cn(
                "group w-[185px] shrink-0 gap-0 overflow-hidden rounded-2xl border border-white/10 bg-black/95 text-white transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-900/20"
            )}
        >
            <div className="relative h-[278px] overflow-hidden">
                <img src={movie.image} alt={movie.title} className="size-full object-cover transition duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/95 group-hover:via-black/35" />

                <div className="absolute inset-0 flex translate-y-2 items-end p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="w-full rounded-xl border border-white/20 bg-black/75 p-3 backdrop-blur-md">
                        <p className="line-clamp-3 text-sm leading-relaxed text-zinc-200">{movie.description}</p>
                        <p className="mt-2 text-sm text-zinc-300">Date: {movie.year}-05-01</p>
                        <p className="text-sm text-zinc-300">Lang: {movie.language}</p>
                        <Button className="mt-3 h-9 w-full rounded-lg bg-white/10 text-white hover:bg-white/20">
                            <PlayCircle className="size-4" />
                            Watch Now!
                        </Button>
                    </div>
                </div>
            </div>

            <CardContent className="space-y-1.5 px-2.5 py-2.5">
                <p className="truncate text-sm leading-tight font-semibold text-zinc-100">{movie.title}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="inline-flex items-center gap-1 text-red-400">
                        <Star className="size-3" />
                        {movie.rating}
                    </span>
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span>{movie.type}</span>
                </div>
            </CardContent>
        </Card>
    )
}

export default MovieRail
