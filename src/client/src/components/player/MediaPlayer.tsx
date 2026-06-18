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

    // Initialize HLS or Native Video
    useEffect(() => {
        const video = videoRef.current
        if (!video || !selectedSource) return

        setIsLoading(true)

        if (selectedSource.type === "hls") {
            if (Hls.isSupported()) {
                // MESIN TURBO HLS.JS (Untuk Android & Desktop)
                const hlsConfig: any = {
                    enableWorker: true,
                    lowLatencyMode: false,
                    maxBufferSize: 0, 
                    maxBufferLength: 60, 
                    maxMaxBufferLength: 120, 
                    maxSeekHole: 5, 
                    manifestLoadingTimeOut: 3000, 
                    fragLoadingTimeOut: 5000, 
                    levelLoadingTimeOut: 5000,
                    manifestLoadingMaxRetry: Infinity,
                    fragLoadingMaxRetry: Infinity,
                    levelLoadingMaxRetry: Infinity,
                    xhrSetup: (xhr: XMLHttpRequest, url: string) => {
                        // Di OMSS v1.1 proxy akan menangani CORS, kredensial browser dimatikan
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
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                hls.recoverMediaError();
                                break;
                            default:
                                setError(`HLS Fatal Error: ${data.type}`)
                                hls.destroy();
                                setIsLoading(false)
                                break;
                        }
                    }
                })
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                // MESIN BAWAAN APPLE (Untuk iOS Safari)
                video.src = selectedSource.url
                video.load()

                // P3K KHUSUS iOS: Memerangi pemutusan 1 Menit dari Apple
                const handleAppleStalled = () => {
                    console.warn("Mesin Apple tersumbat, memancing ulang koneksi...");
                    if (!video.paused && video.networkState === HTMLMediaElement.NETWORK_IDLE) {
                        const current = video.currentTime;
                        video.load();
                        video.currentTime = current;
                        video.play().catch(() => {});
                    }
                };

                const handleAppleError = () => {
                    console.warn("Koneksi Apple terputus, menyambung ulang paksa...");
                    const current = video.currentTime;
                    video.load();
                    video.currentTime = current;
                    video.play().catch(() => {});
                };

                video.addEventListener('stalled', handleAppleStalled);
                video.addEventListener('suspend', handleAppleStalled);
                video.addEventListener('error', handleAppleError);

                return () => {
                    video.removeEventListener('stalled', handleAppleStalled);
                    video.removeEventListener('suspend', handleAppleStalled);
                    video.removeEventListener('error', handleAppleError);
                }
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
    }, [selectedSource, setError, setIsLoading, setIsPlaying])

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate
        }
    }, [playbackRate])

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

    useEffect(() => {
        const video = videoRef.current

        if (!video) return

        const handleEnterPiP = () => setIsPiP(true)
        const handleLeavePiP = () => setIsPiP(false)

        video.addEventListener("enterpictureinpicture", handleEnterPiP)
        video.addEventListener("leavepictureinpicture", handleLeavePiP)

        return () => {
            video.removeEventListener("enterpictureinpicture", handleEnterPiP)
            video.removeEventListener("leavepictureinpicture", handleLeavePiP)
        }
    }, [])

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
            setIsLoading(true);
            videoRef.current.currentTime = val[0]
            setCurrentTime(val[0])
        }
    }

    const togglePictureInPicture = async () => {
        const video = videoRef.current

        if (!video) return

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
                // Menggunakan crossOrigin khusus agar OMSS proxy dapat memproses subtitel tanpa bentrok CORS
                crossOrigin="anonymous"
                poster={media?.backdropUrl.replace("w300", "original")}
                playsInline
            />

            {selectedSubtitle && <CustomSubtitles url={selectedSubtitle.url} currentTime={currentTime} />}

            {isLoading && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <LoadingState message={t("states.buffering")} />
                </div>
            )}

            <PlayerControls
                isPlaying={isPlaying}
                onDoubleClick={toggleFullscreen}
                onWheel={(e: React.WheelEvent<HTMLDivElement>) => {
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
