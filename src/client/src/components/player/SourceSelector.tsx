import { Check, ChevronDown } from "lucide-react"

import { useMemo } from "react"

import { useMediaWatchContext } from "./providers/MediaWatchProvider"

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { normalizeQuality } from "@/lib/strings.utils.ts"

export function SourceSelector() {
    const { state, selectSource } = useMediaWatchContext()

    const sources = useMemo(() => {
        return state.media?.playback.sources.reverse() || []
    }, [state.media?.playback.sources])

    const selectedSource = state.media?.playback.selectedSource

    const groupedSources = useMemo(() => {
        return sources.reduce<Record<string, typeof sources>>((acc, source) => {
            const provider = source.provider.name

            if (!acc[provider]) {
                acc[provider] = []
            }

            acc[provider].push(source)

            return acc
        }, {})
    }, [sources])

    if (sources.length === 0) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <span className="truncate font-medium">{selectedSource?.provider.name || "Select source"}</span>

                        {selectedSource && (
                            <Badge variant="secondary" className="text-[10px]">
                                {selectedSource.quality}
                            </Badge>
                        )}
                    </div>

                    <ChevronDown className="size-4 shrink-0 opacity-60" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="center" className="max-h-105 w-72 overflow-y-auto backdrop-blur-2xl" onWheel={(e) => e.stopPropagation()}>
                {Object.entries(groupedSources).map(([provider, providerSources], groupIndex) => (
                    <div key={provider}>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-xs tracking-wider text-muted-foreground uppercase">{provider}</DropdownMenuLabel>

                            {providerSources.map((source, idx) => {
                                const isSelected = selectedSource?.url === source.url

                                return (
                                    <DropdownMenuItem key={`${source.provider.id}-${idx}`} onClick={() => selectSource(source)} className="flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            Source {idx + 1}
                                            <Badge variant="outline">{normalizeQuality(source.quality)}</Badge>
                                        </div>

                                        {isSelected && <Check className="size-4 text-primary" />}
                                    </DropdownMenuItem>
                                )
                            })}
                        </DropdownMenuGroup>

                        {groupIndex < Object.keys(groupedSources).length - 1 && <DropdownMenuSeparator />}
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
