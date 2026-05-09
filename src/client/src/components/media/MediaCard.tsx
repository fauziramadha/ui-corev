import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

export interface MediaCardProps {
    title: string
    imagePath?: string | null
    imageAlt?: string
    aspectRatio?: "portrait" | "landscape"
    className?: string
    type: "movie" | "tv"
    id: string | number
    rating: number
    year: number
}

export const MediaCard = React.forwardRef<HTMLDivElement, MediaCardProps>(({ title, imagePath, imageAlt, aspectRatio = "portrait", className, rating, year }, ref) => {
    return (
        <Card ref={ref} className={cn("group overflow-hidden border-none py-0 transition-all", className)}>
            <CardContent className="p-0">
                <div className={cn("relative overflow-hidden rounded-md bg-muted", aspectRatio === "portrait" ? "aspect-2/3" : "aspect-video")}>
                    <img
                        src={imagePath ?? "/favicon.svg"}
                        alt={imageAlt || title}
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.08]"
                        loading="lazy"
                    />

                    {/* Hover overlay */}
                    <div className="pointer-events-none absolute inset-0 flex items-end opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        {/* Gradient shadow */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Text content */}
                        <div className="relative z-10 w-full p-3">
                            <div className="text-sm leading-tight font-semibold">{title}</div>

                            <div className={"w-full flex justify-between mt-1 text-xs font-medium"}>
                                <span className={"flex gap-2 items-center"}><Sparkles height={15} width={15} /> {rating.toFixed(1)}</span>
                                <span>{year}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
})

MediaCard.displayName = "MediaCard"
