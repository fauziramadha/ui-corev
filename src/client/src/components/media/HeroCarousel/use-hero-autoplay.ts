import { useCallback, useEffect, useRef, useState } from "react"
import type { CarouselApi } from "@/components/ui/carousel"

const AUTOPLAY_DELAY = 6500

type Params = {
    heroApi?: CarouselApi
    enabled: boolean
    slideCount: number
    onSelect: (index: number) => void
}

export function useHeroAutoplay({ heroApi, enabled, slideCount, onSelect }: Params) {
    const autoplayRef = useRef<number | null>(null)
    const [isTabVisible, setIsTabVisible] = useState(true)

    const restartAutoplay = useCallback(() => {
        if (!heroApi || !isTabVisible || !enabled) return

        if (autoplayRef.current) {
            window.clearTimeout(autoplayRef.current)
        }

        autoplayRef.current = window.setTimeout(() => {
            if (!heroApi) return

            if (heroApi.canScrollNext()) {
                heroApi.scrollNext()
            } else {
                heroApi.scrollTo(0)
            }
        }, AUTOPLAY_DELAY)
    }, [heroApi, isTabVisible, enabled])

    // visibility handling
    useEffect(() => {
        const handleVisibilityChange = () => {
            const visible = !document.hidden
            setIsTabVisible(visible)

            if (!visible && autoplayRef.current) {
                window.clearTimeout(autoplayRef.current)
            }

            if (visible) restartAutoplay()
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)

        return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
    }, [restartAutoplay])

    // carousel binding
    useEffect(() => {
        if (!heroApi || slideCount === 0) return

        const handleSelect = () => {
            const index = heroApi.selectedScrollSnap()

            onSelect(index)
            restartAutoplay()
        }

        handleSelect()

        heroApi.on("select", handleSelect)
        heroApi.on("reInit", handleSelect)

        restartAutoplay()

        return () => {
            heroApi.off("select", handleSelect)
            heroApi.off("reInit", handleSelect)

            if (autoplayRef.current) {
                window.clearTimeout(autoplayRef.current)
            }
        }
    }, [heroApi, slideCount, restartAutoplay])

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (autoplayRef.current) {
                window.clearTimeout(autoplayRef.current)
            }
        }
    }, [])
}
