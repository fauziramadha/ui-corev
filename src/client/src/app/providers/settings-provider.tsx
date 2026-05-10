import React, { useMemo, useState } from "react"
import { usePersistentState } from "@/hooks/use-localstorage"
import { AppSettingsContext, type SupportedLocales } from "@/hooks/use-appsettings"
import type { CountryISO3166_1, Timezone, TMDBOptions } from "@lorenzopant/tmdb"
import { getCountry } from "@/lib/tmdb.utils"

const DEFAULT_TMDB_OPTIONS: TMDBOptions = {
    language: "en-US",
    region: undefined,
    images: {
        secure_images_url: true,
        autocomplete_paths: true,
        default_image_sizes: {
            posters: "original",
            backdrops: "original",
            logos: "original",
        },
        fallback_url: "/favicon.svg",
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone,
    cache: true,
}

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
    const standalone = import.meta.env.VITE_STANDALONE === "true"

    const [locale, setLocale] = usePersistentState<SupportedLocales>("app.locale", "en")
    const [region, setRegion] = usePersistentState<CountryISO3166_1 | undefined>("app.region", getCountry())

    const [showSearch, setShowSearch] = usePersistentState<boolean>("app.showSearch", false)
    const [autoplayNext, setAutoplayNext] = usePersistentState<boolean>("app.autoplayNext", true)

    const [tmdbApiKey, setTmdbApiKey] = usePersistentState<string>("app.tmdbApiKey", import.meta.env.VITE_TMDB_API_KEY)

    const [tmdbOptions, setTmdbOptions] = useState<TMDBOptions>({
        ...DEFAULT_TMDB_OPTIONS,
        region,
    })

    const value = useMemo(
        () => ({
            locale,
            region,
            autoplayNext,
            standalone,
            showSearch,
            tmdbApiKey,
            tmdbOptions,

            setLocale,
            setRegion,
            setAutoplayNext,
            setShowSearch,
            setTmdbApiKey,
            setTmdbOptions,
        }),
        [locale, region, autoplayNext, standalone, showSearch, tmdbApiKey, tmdbOptions, setLocale, setRegion, setAutoplayNext, setShowSearch, setTmdbApiKey]
    )

    return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
}
