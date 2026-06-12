import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface BackupPlayerProps {
    id: string
    type: "movie" | "tv" | string
    season?: number
    episode?: number
}

export function BackupPlayer({ id, type, season, episode }: BackupPlayerProps) {
    const navigate = useNavigate()

    // Fungsi peracik URL Embed Cadangan dari VidSrc
    const getEmbedUrl = () => {
        if (type === "movie") {
            return `https://vidsrc.net/embed/movie?tmdb=${id}`
        } else {
            return `https://vidsrc.net/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
        }
    }

    return (
        <div className="relative min-h-screen bg-black text-foreground">
            {/* Header Navigasi dengan Label Indikator Elegan */}
            <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
                <Button 
                    variant="ghost" 
                    className="border border-white/20 bg-black/50 text-white backdrop-blur-md hover:bg-white/10" 
                    onClick={() => navigate(-1)}
                >
                    <ChevronLeft className="h-6 w-6" /> Back
                </Button>
                <span className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500 backdrop-blur-md shadow-lg shadow-amber-500/10">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                    </span>
                    Auto Backup Engaged
                </span>
            </div>

            {/* Frame Video Cadangan Full Screen */}
            <div className="h-screen w-full bg-black">
                <iframe
                    src={getEmbedUrl()}
                    className="h-full w-full border-0"
                    allowFullScreen
                    allow="autoplay; fullscreen"
                    title="CinePro Backup Player"
                ></iframe>
            </div>
        </div>
    )
}
