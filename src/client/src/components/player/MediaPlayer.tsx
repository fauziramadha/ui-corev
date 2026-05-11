import React, {useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import { usePlayerState } from "./hooks/usePlayerState"
import { PlayerControls } from "./PlayerControls"
import { LoadingState } from "./LoadingState"
import { useEpisodeAutoplay } from "./hooks/useEpisodeAutoplay"

import { EpisodeAutoplayOverlay } from "./EpisodeAutoplayOverlay"
import { useSubtitles } from "@/components/player/hooks/useSubtitles.ts"

export function MediaPlayer() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const hlsRef = useRef<Hls | null>(null)

    const { media, isPlaying, isLoading, currentTime, duration, volume, isMuted, setIsPlaying, setIsLoading, setCurrentTime, setDuration, setVolume, setIsMuted, setError } = usePlayerState()

    const { handleEpisodeEnded } = useEpisodeAutoplay()
    const {subtitles, selectedSubtitle} = useSubtitles()

    const [showControls, setShowControls] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showAutoplay, setShowAutoplay] = useState(false)

    const controlsTimeoutRef = useRef<number | null>(null)

    const selectedSource = media?.playback.selectedSource

    // Initialize HLS or Native Video
    useEffect(() => {
        const video = videoRef.current
        if (!video || !selectedSource) return

        setIsLoading(true)

        if (selectedSource.type === "hls") {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    ignorePlaylistParsingErrors: true,
                })
                hls.loadSource(selectedSource.url)
                hls.attachMedia(video)
                hlsRef.current = hls

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    if (isPlaying) video.play().catch(() => setIsPlaying(false))
                    setIsLoading(false)
                })

                hls.on(Hls.Events.ERROR, (_, data) => {
                    if (data.fatal) {
                        setError(`HLS Fatal Error: ${data.type}`)
                    }
                })
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = selectedSource.url
            }
        } else {
            video.src = selectedSource.url
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
        }
    }, [selectedSource, setError, setIsLoading, setIsPlaying])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const tracks = video.textTracks

        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i]

            if (!selectedSubtitle) {
                track.mode = "disabled"
                continue
            }

            const match = subtitles.find((s) => s.url === selectedSubtitle.url)

            if (match && track.label === match.label) {
                track.mode = "showing"
            } else {
                track.mode = "disabled"
            }
        }
    }, [selectedSubtitle, subtitles])

    // Sync isPlaying state
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        if (isPlaying) {
            video.play().catch(() => setIsPlaying(false))
        } else {
            video.pause()
        }
    }, [isPlaying, setIsPlaying])

    // Sync volume/mute to video element
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = isMuted ? 0 : volume
            videoRef.current.muted = isMuted
        }
    }, [volume, isMuted])

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration)
            setIsLoading(false)
        }
    }

    const handleEnded = () => {
        setIsPlaying(false)
        if (media?.type === "tv" && media.episodeNumber !== undefined) {
            setShowAutoplay(true)
        }
    }

    const handleMouseMove = () => {
        setShowControls(true)
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000)
    }

    const togglePlay = () => setIsPlaying(!isPlaying)

    const handleSeek = (val: number[]) => {
        if (videoRef.current) {
            videoRef.current.currentTime = val[0]
            setCurrentTime(val[0])
        }
    }

    const toggleMute = () => setIsMuted(!isMuted)

    const handleVolumeChange = (val: number[]) => {
        setVolume(val[0])
        if (val[0] === 0) {
            setIsMuted(true)
        } else if (isMuted) {
            setIsMuted(false)
        }
    }

    const toggleFullscreen = () => {
        if (!containerRef.current) return
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    if (!selectedSource) return <LoadingState message="Resolving sources..." />

    return (
        <div ref={containerRef} className="group relative h-screen w-full overflow-hidden" onMouseMove={handleMouseMove} onMouseLeave={() => setShowControls(false)}>
            <video
                ref={videoRef}
                className="h-full w-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => setIsLoading(false)}
                onClick={togglePlay}
                preload="auto"
                crossOrigin="anonymous"
                poster={media?.backdropUrl}
                playsInline
            >
                {subtitles.map((sub, idx) => (
                    <track key={`${sub.url}-${idx}`} kind="captions" src={sub.url} label={sub.label} srcLang={sub.label || "en"} default={selectedSubtitle?.url === sub.url}  />
                ))}
            </video>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <LoadingState message="Buffering..." />
                </div>
            )}

            <PlayerControls
                isPlaying={isPlaying}
                onDoubleClick={toggleFullscreen}
                onWheel={(e: React.WheelEvent<HTMLDivElement>) => {
                    // scroll up = increase volume
                    const delta = -e.deltaY * 0.001

                    const newVolume = Math.max(0, Math.min(1, volume + delta))

                    setVolume(newVolume)

                    if (newVolume === 0) {
                        setIsMuted(true)
                    } else if (isMuted) {
                        setIsMuted(false)
                    }
                }}
                currentTime={currentTime}
                onDivClick={togglePlay}
                duration={duration}
                volume={volume}
                isMuted={isMuted}
                isFullscreen={isFullscreen}
                onTogglePlay={togglePlay}
                onSeek={handleSeek}
                onToggleMute={toggleMute}
                onVolumeChange={handleVolumeChange}
                onToggleFullscreen={toggleFullscreen}
                show={showControls || !isPlaying}
            />

            <EpisodeAutoplayOverlay
                show={showAutoplay}
                onNext={() => {
                    setShowAutoplay(false)
                    handleEpisodeEnded()
                }}
                onCancel={() => setShowAutoplay(false)}
            />

        </div>
    )
}
