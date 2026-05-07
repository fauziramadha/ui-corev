import React, { useMemo } from "react"
import { TMDB } from "@lorenzopant/tmdb"
import { TmdbContext } from "@/hooks/use-tmdb"
import { useAppSettings } from "@/hooks/use-appsettings"

export function TMDBProvider({ children }: { children: React.ReactNode }) {
    const { tmdbApiKey, tmdbOptions } = useAppSettings()

    const tmdb = useMemo(() => {
        return new TMDB(tmdbApiKey, tmdbOptions)
    }, [tmdbApiKey, tmdbOptions])

    return <TmdbContext.Provider value={{ tmdb }}>{children}</TmdbContext.Provider>
}
