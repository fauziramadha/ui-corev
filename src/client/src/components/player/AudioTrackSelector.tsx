import { useAudioTracks } from "./hooks/useAudioTracks"
import { Check, Volume2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function AudioTrackSelector() {
    const { audioTracks, selectedAudioTrack, selectAudioTrack } = useAudioTracks()
    const { t } = useTranslation("player")

    if (audioTracks.length <= 1) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" title={t("controls.audio")}>
                    <Volume2 className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-zinc-900 text-zinc-100">
                {audioTracks.map((track, idx) => (
                    <DropdownMenuItem key={`${track.language}-${idx}`} onClick={() => selectAudioTrack(track)} className="flex items-center justify-between">
                        <span>{track.label || track.language}</span>
                        {selectedAudioTrack?.language === track.language && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
