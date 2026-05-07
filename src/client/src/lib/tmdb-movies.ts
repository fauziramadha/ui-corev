import type { TMDB } from "@lorenzopant/tmdb"

import type { RailMovie } from "@/components/media/MovieRail"

type TmdbMovie = {
    id: number
    title?: string
    name?: string
    release_date?: string
    overview?: string
    vote_average?: number
    poster_path?: string | null
    backdrop_path?: string | null
    original_language?: string
    media_type?: string
}

type TmdbMovieListResponse = {
    results?: TmdbMovie[]
}

function formatYear(date?: string) {
    if (!date) {
        return "TBA"
    }

    return date.slice(0, 4)
}

function formatLanguage(language?: string) {
    if (!language) {
        return "Unknown"
    }

    return language.toUpperCase()
}

function formatRating(rating?: number) {
    if (typeof rating !== "number" || Number.isNaN(rating)) {
        return "N/A"
    }

    return rating.toFixed(1)
}

function resolveTitle(movie: TmdbMovie) {
    return movie.title ?? movie.name ?? "Untitled"
}

function resolveImage(tmdb: TMDB, movie: TmdbMovie) {
    if (movie.backdrop_path) {
        return tmdb.images.backdrop(movie.backdrop_path, "w1280")
    }

    if (movie.poster_path) {
        return tmdb.images.poster(movie.poster_path, "w780")
    }

    return "/icon512_rounded.png"
}

export function mapTmdbMovies(tmdb: TMDB, response?: TmdbMovieListResponse): RailMovie[] {
    return (response?.results ?? [])
        .filter((movie) => Boolean(movie.id))
        .map((movie) => ({
            title: resolveTitle(movie),
            year: formatYear(movie.release_date),
            type: movie.media_type === "tv" ? "Series" : "Movie",
            language: formatLanguage(movie.original_language),
            description: movie.overview?.trim() || "No synopsis available.",
            rating: formatRating(movie.vote_average),
            image: resolveImage(tmdb, movie),
        }))
}
