import React, { createContext, useContext } from "react"
import type { CountryISO3166_1, TMDBOptions } from "@lorenzopant/tmdb"

export type SupportedLocales = "en"

export const supportedLocales = [
    {
        iso639: "en",
        label: "English",
        primaryTranslationTmdb: "en-US",
    },
] as const

export type AppSettings = {
    locale: SupportedLocales
    region?: CountryISO3166_1

    autoplayNext: boolean
    showSearch: boolean
    standalone: boolean

    tmdbApiKey: string
    tmdbOptions: TMDBOptions

    setLocale: (locale: SupportedLocales) => void
    setRegion: (region: CountryISO3166_1) => void
    setAutoplayNext: (value: boolean) => void
    setShowSearch: (value: boolean) => void

    setTmdbApiKey: (apiKey: string) => void
    setTmdbOptions: React.Dispatch<React.SetStateAction<TMDBOptions>>
}

export const AppSettingsContext = createContext<AppSettings | null>(null)

export function useAppSettings() {
    const ctx = useContext(AppSettingsContext)
    if (!ctx) {
        throw new Error("useAppSettings must be used within AppSettingsProvider")
    }
    return ctx
}
