import React, { useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import { useTranslation } from "react-i18next"
import { usePlayerState } from "./hooks/usePlayerState"
import { PlayerControls } from "./PlayerControls"
import { LoadingState } from "./LoadingState"
import { useEpisodeAutoplay } from "./hooks/useEpisodeAutoplay"
import { EpisodeAutoplayOverlay } from "./EpisodeAutoplayOverlay"
import { useSubtitles } from "@/components/player/hooks/useSubtitles.ts"
import { CustomSubtitles } from "@/components/player/CustomSubtitles"

export function MediaPlayer() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const hlsRef = useRef<Hls | null>(null)

    const { media, isPlaying, isLoading, currentTime, duration, volume, isMuted, setIsPlaying, setIsLoading, setCurrentTime, setDuration, setVolume, setIsMuted, setError } = usePlayerState()
    const { t } = useTranslation("player")

    const { handleEpisodeEnded } = useEpisodeAutoplay()
    const { selectedSubtitle } = useSubtitles()

    const [showControls, setShowControls] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showAutoplay, setShowAutoplay] = useState(false)
    const [isPiP, setIsPiP] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [qualities, setQualities] = useState<
        {
            index: number
            height: number
            label: string
        }[]
    >([])

    const [currentQuality, setCurrentQuality] = useState(-1)
    const controlsTimeoutRef = useRef<number | null>(null)
    const selectedSource = media?.playback.selectedSource

    // Deteksi apakah sumber yang dipilih saat ini adalah iframe
    const isIframeMode = selectedSource?.type === "embed" || selectedSource?.type === "iframe"

    // Initialize HLS or Native Video (Hanya jika bukan mode iframe)
    useEffect(() => {
        const video = videoRef.current
        if (!video || !selectedSource || isIframeMode) return

        if (selectedSource.streamable === false) {
            setError("Sumber video ini tidak mendukung streaming langsung di web browser.")
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        if (selectedSource.type === "hls") {
            if (Hls.isSupported()) {
                const hlsConfig: any = {
                    enableWorker: true,
                    lowLatencyMode: false,
                    xhrSetup: (xhr: XMLHttpRequest, url: string) => {
                        xhr.withCredentials = false 
                    }
                }

                const hls = new Hls(hlsConfig)
                
                hls.loadSource(selectedSource.url)
                hls.attachMedia(video)
                hlsRef.current = hls

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    if (isPlaying) video.play().catch(() => setIsPlaying(false))
                    const levels = hls.levels.map((level, index) => ({
                        index,
                        height: level.height,
                        label: `${level.height}p`,
                    }))

                    setQualities(levels)
                    setIsLoading(false)
                })

                hls.on(Hls.Events.ERROR, (_, data) => {
                    if (data.fatal) {
                        setError(`Gagal memutar konten (HLS Error: ${data.type})`)
                        setIsLoading(false)
                    }
                })
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = selectedSource.url
                video.load() 
            }
        } else {
            video.src = selectedSource.url
            video.load() 
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
        }
    }, [selectedSource, setError, setIsLoading, setIsPlaying, isIframeMode])

    useEffect(() => {
        if (videoRef.current && !isIframeMode) {
            videoRef.current.playbackRate = playbackRate
        }
    }, [playbackRate, isIframeMode])

    // Sync isPlaying state
    useEffect(() => {
        const video = videoRef.current
        if (!video || isIframeMode) return

        if (isPlaying) {
            video.play().catch(() => setIsPlaying(false))
        } else {
            video.pause()
        }
    }, [isPlaying, setIsPlaying, isIframeMode])

    // Sync volume/mute to video element
    useEffect(() => {
        if (videoRef.current && !isIframeMode) {
            videoRef.current.volume = isMuted ? 0 : volume
            videoRef.current.muted = isMuted
        }
    }, [volume, isMuted, isIframeMode])

    useEffect(() => {
        const video = videoRef.current
        if (!video || isIframeMode) return

        const handleEnterPiP = () => setIsPiP(true)
        const handleLeavePiP = () => setIsPiP(false)

        video.addEventListener("enterpictureinpicture", handleEnterPiP)
        video.addEventListener("leavepictureinpicture", handleLeavePiP)

        return () => {
            video.removeEventListener("enterpictureinpicture", handleEnterPiP)
            video.removeEventListener("leavepictureinpicture", handleLeavePiP)
        }
    }, [isIframeMode])

    const handleTimeUpdate = () => {
        if (videoRef.current && !isIframeMode) {
            setCurrentTime(videoRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (videoRef.current && !isIframeMode) {
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

    const togglePlay = () => {
        if (!isIframeMode) setIsPlaying(!isPlaying)
    }

    const handleSeek = (val: number[]) => {
        if (videoRef.current && !isIframeMode) {
            videoRef.current.currentTime = val[0]
            setCurrentTime(val[0])
        }
    }

    const togglePictureInPicture = async () => {
        const video = videoRef.current
        if (!video || isIframeMode) return

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture()
                setIsPiP(false)
            } else {
                await video.requestPictureInPicture()
                setIsPiP(true)
            }
        } catch (err) {
            console.error("PiP failed:", err)
        }
    }

    const handleQualityChange = (level: number) => {
        if (!hlsRef.current) return

        hlsRef.current.currentLevel = level
        setCurrentQuality(level)
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

    if (!selectedSource)
        return (
            <LoadingState
                message={
                    <div className={"flex flex-col items-center justify-center"}>
                        <span className={"text-lg"}>{t("states.resolving")}</span>
                        <span>{t("states.resolvingSub")}</span>
                    </div>
                }
            />
        )

    return (
        <div ref={containerRef} className="group relative h-screen w-full overflow-hidden" onMouseMove={handleMouseMove} onMouseLeave={() => setShowControls(false)}>
            
            {/* RENDER BUNGKAL: Tampilkan Iframe atau Video tergantung tipe sumber */}
            {isIframeMode ? (
                <div className="h-full w-full bg-black">
                    <iframe
                        src={selectedSource.url}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-forms" // Proteksi Iklan
                        title="Movie Player"
                        onLoad={() => setIsLoading(false)} // Matikan loading saat iframe selesai dimuat
                    />
                </div>
            ) : (
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
                    onError={() => {
                        setError("Gagal memuat video. Tautan mungkin telah kedaluwarsa atau diblokir.")
                        setIsLoading(false)
                    }}
                    poster={media?.backdropUrl.replace("w300", "original")}
                    playsInline
                />
            )}

            {/* Subtitle khusus video native (bukan iframe) */}
            {selectedSubtitle && !isIframeMode && <CustomSubtitles url={selectedSubtitle.url} currentTime={currentTime} />}

            {isLoading && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <LoadingState message={t("states.buffering")} />
                </div>
            )}

            {/* Player Controls akan tetap dirender, namun kita manipulasi prop isPlaying agar timeline tertutup jika di mode Iframe */}
            <PlayerControls
                isPlaying={isIframeMode ? true : isPlaying} // Paksa status 'playing' agar UI controls terlihat rapi
                onDoubleClick={toggleFullscreen}
                onWheel={(e: React.WheelEvent<HTMLDivElement>) => {
                    if(isIframeMode) return;
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
                ref={containerRef}
                isPiP={isPiP}
                onTogglePiP={togglePictureInPicture}
                playbackRate={playbackRate}
                onPlaybackRateChange={setPlaybackRate}
                qualities={qualities}
                currentQuality={currentQuality}
                onQualityChange={handleQualityChange}
                // Jika ingin benar-benar menyembunyikan timeline saat mode iframe,
                // modifikasi harus dilakukan di dalam komponen PlayerControls itu sendiri,
                // namun pengkondisian isPlaying di atas sudah cukup untuk menyembunyikan tombol play tengah.
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
