import { Play, Pause, Maximize, Minimize, Volume2, VolumeX, Undo, Redo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { formatTime } from "./utils/time"
import { SubtitleSelector } from "./SubtitleSelector"
import { AudioTrackSelector } from "./AudioTrackSelector"
import type { WheelEventHandler } from "react"
import { SourceSelector } from "@/components/player/SourceSelector.tsx"

interface PlayerControlsProps {
    isPlaying: boolean
    currentTime: number
    duration: number
    volume: number
    isMuted: boolean
    isFullscreen: boolean
    onTogglePlay: () => void
    onSeek: (time: number[]) => void
    onToggleMute: () => void
    onVolumeChange: (volume: number[]) => void
    onToggleFullscreen: () => void
    onDivClick: () => void
    onDoubleClick: () => void
    onWheel: WheelEventHandler<HTMLDivElement>
    show: boolean
}

export function PlayerControls({
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    onTogglePlay,
    onSeek,
    onToggleMute,
    onVolumeChange,
    onToggleFullscreen,
    show,
    onDoubleClick,
    onDivClick,
    onWheel,
}: PlayerControlsProps) {
    return (
        <div
            className={`absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/80 via-transparent to-black/40 px-4 pt-1 pb-2 transition-opacity duration-300 ${show ? "opacity-100" : "pointer-events-none opacity-0"}`}
            onClick={onDivClick}
            onDoubleClick={onDoubleClick}
            onWheel={onWheel}
        >
            <div className="mx-auto w-full max-w-6xl space-y-2">
                {/* Progress Bar */}
                <div className="group relative py-2">
                    <Slider value={[currentTime]} max={duration} step={1} onValueChange={onSeek} className="cursor-pointer" />
                </div>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onSeek([Math.max(0, currentTime - 10)])}>
                            <Undo width={20} height={20} />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={onTogglePlay} className="text-white hover:bg-white/20">
                            {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => onSeek([Math.min(duration, currentTime + 10)])} className="text-white hover:bg-white/20">
                            <Redo width={20} height={20} />
                        </Button>

                        <div className="ml-4 flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={onToggleMute} className="text-white hover:bg-white/20">
                                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </Button>
                            <div className="w-24">
                                <Slider value={[isMuted ? 0 : volume * 100]} max={100} step={1} onValueChange={(v) => onVolumeChange([v[0] / 100])} className="cursor-pointer" />
                            </div>
                        </div>

                        <div className="ml-4 text-sm font-medium text-white/90 tabular-nums">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>
                        <SourceSelector />
                        <SubtitleSelector />
                        <AudioTrackSelector />

                        <Button variant="ghost" size="icon" onClick={onToggleFullscreen} className="text-white hover:bg-white/20">
                            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
