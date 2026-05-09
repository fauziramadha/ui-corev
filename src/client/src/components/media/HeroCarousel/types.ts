import type { MovieDetailsWithAppends, TVDetailsWithAppends, PaginatedResponse, MovieResultItem, TVSeriesResultItem } from "@lorenzopant/tmdb"

export type HeroSlide = {
    title: string
    year: string
    rating: string
    description: string
    image: string
    badge: string
    runtime: string
    logo: string
}

export type DetailedMedia = MovieDetailsWithAppends<"images"[]> | TVDetailsWithAppends<"images"[]>

export type MixedMediaItem = { type: "movie"; id: number } | { type: "tv"; id: number }

export type HeroFetcherResult = () => Promise<(PaginatedResponse<MovieResultItem> | PaginatedResponse<TVSeriesResultItem>)[]>