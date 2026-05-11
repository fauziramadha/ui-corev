import { Calendar, Play, Star } from "lucide-react"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMediaDetails } from "./hooks/useMediaDetails"
import { MediaCast } from "./MediaCast"
import { MediaEpisodes } from "./MediaEpisodes"
import { MediaRecommendations } from "./MediaRecommendations"
import { TrailerDialog } from "./TrailerDialog"
import type { MediaDrawerPayload } from "./types/drawer.types"
import { formatRuntime } from "@/components/media/drawer/mappers/media.mapper.ts"
import { cn } from "@/lib/utils.ts"
import { useNavigate } from "react-router-dom"
import { useMediaDrawer } from "@/components/media/drawer/hooks/useMediaDrawer.ts"

interface MediaDrawerProps {
    payload: MediaDrawerPayload
    depth: number
    isOpen: boolean
    onClose: () => void
    className?: string
}

export function MediaDrawer({ payload, isOpen, onClose, className }: MediaDrawerProps) {
    const { data, isLoading } = useMediaDetails(payload.type, payload.id)
    const { closeAll } = useMediaDrawer()

    const navigate = useNavigate()

    const handlePlay = () => {
        if (!data) return

        const path = payload.type === "movie" ? `/watch/movie/${data.id}` : `/watch/tv/${data.id}`

        closeAll()

        requestAnimationFrame(() => {
            navigate(path)
        })
    }

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className={cn("lenis-stopped lenis-disabled mx-auto mt-0 h-[98vh] max-w-6xl bg-black pt-0 outline-none", className)} data-lenis-prevent="true">
                <DrawerHeader className="sr-only">
                    <DrawerTitle>Media Drawer</DrawerTitle>
                    <DrawerDescription>Content below</DrawerDescription>
                </DrawerHeader>

                {isLoading ? (
                    <MediaDrawerSkeleton />
                ) : !data ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Failed to load media details.</div>
                ) : (
                    <div className="relative h-full overflow-y-auto">
                        {/* STICKY HERO */}
                        <div className="sticky top-0 h-screen w-full">
                            {data.backdropUrl ? (
                                <img src={data.backdropUrl} alt={`${data.title} backdrop`} draggable={false} className="h-full w-full rounded-t-2xl object-cover object-top" />
                            ) : (
                                <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">No backdrop available</div>
                            )}

                            {/* OVERLAY */}
                            <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
                        </div>

                        {/* CONTENT */}
                        <div className="relative z-20 -mt-[45vh] px-4 pb-10 md:px-8">
                            {/* LOGO / TITLE */}
                            <div className="mb-4 max-w-[70%] md:max-w-[40%]">
                                {data.logoUrl ? (
                                    <img src={data.logoUrl} alt={data.title} draggable={false} className="h-auto w-full object-contain" />
                                ) : (
                                    <h1 className="text-2xl font-black tracking-tight text-white md:text-4xl lg:text-6xl">{data.title}</h1>
                                )}
                            </div>

                            {/* META */}
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-3 py-1 backdrop-blur-xl">
                                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                                    <span className="text-sm font-semibold text-white">{data.rating.toFixed(1)}/10</span>
                                </div>

                                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-3 py-1 backdrop-blur-xl">
                                    <Calendar className="h-3.5 w-3.5 text-white" />
                                    <span className="text-sm text-white">{new Date(data.releaseDate).getFullYear()}</span>
                                </div>

                                {data.runtime && (
                                    <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 backdrop-blur-xl">
                                        <span className="text-sm text-white">{formatRuntime(data.runtime)}</span>
                                    </div>
                                )}

                                {data.genres.map((genre) => (
                                    <Badge key={genre} variant="outline" className="rounded-full px-3 py-3 text-primary italic backdrop-blur-xl">
                                        {genre}
                                    </Badge>
                                ))}
                            </div>

                            {/* ACTIONS */}
                            <div className="mb-5 flex items-center gap-2">
                                <Button className="rounded-full" onClick={handlePlay}>
                                    <Play className="mr-2 h-4 w-4 fill-white" />
                                    Play
                                </Button>

                                {data.trailer && <TrailerDialog trailerId={data.trailer} title={data.title} />}
                            </div>

                            {/* OVERVIEW */}
                            <div className="mb-6 max-w-2xl text-left text-sm text-muted-foreground">{data.overview}</div>

                            {/* TV EPISODES */}
                            {data.type === "tv" && data.seasons && (
                                <div className="mb-8">
                                    <MediaEpisodes tvId={data.id} seasons={data.seasons} />
                                </div>
                            )}

                            {/* CAST */}
                            <div className="mb-8">
                                <MediaCast cast={data.cast} />
                            </div>

                            {/* RECOMMENDATIONS */}
                            <div>
                                <MediaRecommendations recommendations={data.recommendations} />
                            </div>
                        </div>
                    </div>
                )}
            </DrawerContent>
        </Drawer>
    )
}

function MediaDrawerSkeleton() {
    return (
        <div className="relative h-full overflow-y-auto bg-black">
            {/* STICKY HERO */}
            <div className="sticky top-0 h-screen w-full">
                <div className="absolute inset-0 animate-pulse bg-muted" />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
            </div>

            {/* CONTENT */}
            <div className="relative z-20 -mt-[45vh] px-4 pb-10 md:px-8">
                <div className="mb-5 h-12 w-[40%] animate-pulse rounded-md bg-muted" />

                <div className="mb-5 flex flex-wrap gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-muted" />
                    ))}
                </div>

                <div className="mb-6 flex gap-2">
                    <div className="h-10 w-28 animate-pulse rounded-full bg-muted" />
                    <div className="h-10 w-28 animate-pulse rounded-full bg-muted" />
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                </div>

                <div className="max-w-2xl space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-[80%] animate-pulse rounded bg-muted" />
                </div>
            </div>
        </div>
    )
}
