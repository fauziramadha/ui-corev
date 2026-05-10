import React, { useState } from "react"
import { LayoutGrid, List as ListIcon } from "lucide-react"
import { useSeasonDetails } from "./hooks/useSeasonDetails"
import type { MediaSeason } from "./types/media.types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"

interface MediaEpisodesProps {
    tvId: number
    seasons: MediaSeason[]
}

export const MediaEpisodes: React.FC<MediaEpisodesProps> = ({ tvId, seasons }) => {
    const [selectedSeason, setSelectedSeason] = useState(seasons[0]?.seasonNumber ?? 1)
    const [view, setView] = useState<"carousel" | "list">("carousel")

    const { episodes, isLoading } = useSeasonDetails(tvId, selectedSeason)

    if (!seasons.length) return null

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-semibold">Episodes</h3>
                    <Select value={selectedSeason.toString()} onValueChange={(val) => setSelectedSeason(parseInt(val))}>
                        <SelectTrigger className="w-35">
                            <SelectValue placeholder="Select season" />
                        </SelectTrigger>
                        <SelectContent>
                            {seasons.map((s) => (
                                <SelectItem key={s.id} value={s.seasonNumber.toString()}>
                                    {s.name || `Season ${s.seasonNumber}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Tabs value={view} onValueChange={(val) => setView(val as "carousel" | "list")}>
                    <TabsList className="grid w-25 grid-cols-2">
                        <TabsTrigger value="carousel">
                            <LayoutGrid className="h-4 w-4" />
                        </TabsTrigger>
                        <TabsTrigger value="list">
                            <ListIcon className="h-4 w-4" />
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            ) : view === "carousel" ? (
                <Carousel className="w-full" opts={{ align: "start", dragFree: true }}>
                    <CarouselContent className="-ml-4">
                        {episodes.map((episode) => (
                            <CarouselItem key={episode.id} className="basis-full pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="space-y-2">
                                    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                                        {episode.stillUrl ? (
                                            <img src={episode.stillUrl} alt={episode.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">No Preview</div>
                                        )}
                                        <div className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white backdrop-blur-sm">Ep {episode.episodeNumber}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="leading-none font-medium">{episode.name}</p>
                                        <p className="line-clamp-2 text-xs text-muted-foreground">{episode.overview || "No overview available."}</p>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            ) : (
                <div className="h-100 overflow-x-scroll pr-4">
                    <div className="space-y-4">
                        {episodes.map((episode) => (
                            <div key={episode.id} className="flex gap-4 border-b border-border pb-4 last:border-0">
                                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded bg-muted">
                                    {episode.stillUrl ? (
                                        <img src={episode.stillUrl} alt={episode.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">No Preview</div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">
                                            {episode.episodeNumber}. {episode.name}
                                        </p>
                                        {episode.runtime && <p className="text-xs text-muted-foreground">{episode.runtime}m</p>}
                                    </div>
                                    <p className="line-clamp-2 text-xs text-muted-foreground">{episode.overview || "No overview available."}</p>
                                    <p className="text-[10px] text-muted-foreground">{episode.airDate}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}
