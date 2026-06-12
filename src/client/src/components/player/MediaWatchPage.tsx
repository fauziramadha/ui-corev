import { useState, useEffect } from "react" // TAMBAHAN: Import Hooks untuk logika otomatis
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { MediaWatchProvider } from "./providers/MediaWatchProvider"
import { useMediaWatch } from "./hooks/useMediaWatch"
import { MediaPlayer } from "./MediaPlayer"
import { ErrorState } from "./ErrorState"
import type { MediaType } from "./types/media.types"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useOmss } from "@/hooks/use-omss.ts"

function MediaWatchPageContent({ type }: { type: MediaType }) {
    const { id } = useParams<{ id: string }>()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const { valid } = useOmss()

    const season = searchParams.get("s") ? parseInt(searchParams.get("s")!) : type === "tv" ? 1 : undefined
    const episode = searchParams.get("e") ? parseInt(searchParams.get("e")!) : type === "tv" ? 1 : undefined

    const media = useMediaWatch(valid ? id! : "", type, valid ? season : undefined, valid ? episode : undefined)
    const { error } = media

    // TAMBAHAN: State sensor cerdas untuk mendeteksi kapan harus beralih ke Server Cadangan
    const [useBackup, setUseBackup] = useState(false)

    // TAMBAHAN: Logika Otomatis - Jika OMSS error/diblokir, langsung nyalakan backup!
    useEffect(() => {
        if (error) {
            setUseBackup(true)
        }
    }, [error])

    // TAMBAHAN: Fungsi peracik URL Embed Cadangan (menggunakan VidSrc sebagai default server stabil)
    const getEmbedUrl = () => {
        if (type === "movie") {
            return `https://vidsrc.net/embed/movie?tmdb=${id}`
        } else {
            return `https://vidsrc.net/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
        }
    }

    if (!valid) {
        return (
            <div className="relative min-h-screen bg-black text-foreground">
                <div className="flex min-h-screen w-full items-center justify-center gap-4">
                    <div className="space-y-4 text-center">
                        <p>Your OMSS server is unreachable. Please set it up correctly.</p>
                        <Button onClick={() => navigate("/settings?tab=omss")}>Go to Settings</Button>
                    </div>
                </div>

                <div className="absolute top-4 left-4 z-50">
                    <Button variant="ghost" className="border border-border" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-6 w-6" /> Back
                    </Button>
                </div>
            </div>
        )
    }

    // TAMBAHAN: Tampilan UI Mewah saat Server Cadangan Mengambil Alih
    if (useBackup) {
        return (
            <div className="relative min-h-screen bg-black text-foreground">
                {/* Header Navigasi dengan Label Indikator Elegan */}
                <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
                    <Button variant="ghost" className="border border-white/20 bg-black/50 backdrop-blur-md text-white hover:bg-white/10" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-6 w-6" /> Back
                    </Button>
                    <span className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        Auto Backup Engaged
                    </span>
                </div>

                {/* Frame Video Cadangan Full Screen */}
                <div className="h-screen w-full">
                    <iframe
                        src={getEmbedUrl()}
                        className="h-full w-full border-0"
                        allowFullScreen
                        allow="autoplay; fullscreen"
                    ></iframe>
                </div>
            </div>
        )
    }

    // Jaring pengaman cadangan jika terjadi malfungsi
    if (error && !useBackup) {
        return <ErrorState error={error} />
    }

    // Tampilan Normal saat Mesin OMSS sukses memutar film
    return (
        <div className="relative min-h-screen bg-black text-foreground">
            <div className="absolute top-4 left-4 z-50">
                <Button variant="ghost" className="border border-border" onClick={() => navigate(-1)}>
                    <ChevronLeft className="h-6 w-6" /> Back
                </Button>
            </div>

            <div className="h-full w-full bg-black">
                <MediaPlayer />
            </div>
        </div>
    )
}

export default function MediaWatchPage({ type }: { type: MediaType }) {
    return (
        <MediaWatchProvider>
            <MediaWatchPageContent type={type} />
        </MediaWatchProvider>
    )
}
