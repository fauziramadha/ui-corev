import { useEffect, useState } from "react"
import { useOmss } from "@/hooks/use-omss"
import { omssService } from "../services/omss.service"
import type { MediaType } from "../types/media.types"
import type { SourceResponse } from "@omss/sdk"

export function useMediaSources(id: string, type: MediaType, season?: number, episode?: number) {
    const { client } = useOmss()
    const [sources, setSources] = useState<SourceResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string>()

    useEffect(() => {
        async function fetchSources() {
            setIsLoading(true)
            setError(undefined) // Reset status eror saat pengguna mencari film baru
            
            try {
                // 1. KETUK PINTU CMS MANUAL TERLEBIH DAHULU
                let cmsSource = null;
                try {
                    const query = type === "movie" 
                        ? `?type=movie&id=${id}` 
                        : `?type=tv&id=${id}&s=${season}&e=${episode}`;
                        
                    const cmsRes = await fetch(`/api/cms${query}`);
                    const cmsJson = await cmsRes.json();
                    
                    if (cmsJson.success && cmsJson.data) {
                        cmsSource = cmsJson.data;
                    }
                } catch (cmsErr) {
                    // Jika API CMS error, abaikan diam-diam dan biarkan sistem lanjut mencari secara otomatis
                    console.warn("Gagal mengecek CMS Manual, lanjut ke OMSS otomatis...", cmsErr);
                }

                // 2. KETUK PINTU OMSS OTOMATIS
                let omssResponse: SourceResponse | null = null;
                let omssError: unknown = null;
                
                try {
                    if (type === "movie") {
                        omssResponse = await omssService.getMovieSources(client, id)
                    } else if (season !== undefined && episode !== undefined) {
                        omssResponse = await omssService.getTvSources(client, id, season, episode)
                    }
                } catch (oErr) {
                    console.warn("OMSS API gagal merespons:", oErr);
                    omssError = oErr;
                }

                // 3. PENGGABUNGAN (HYBRID MERGING)
                if (cmsSource) {
                    // Jika kamu sudah menaruh link manual, letakkan ia di urutan teratas (Server 1)
                    if (omssResponse) {
                        omssResponse.sources = [cmsSource, ...(omssResponse.sources || [])];
                        setSources(omssResponse);
                    } else {
                        // Fitur Tahan Banting: Jika mesin otomatis OMSS mati tapi CMS manual ada, putar CMS-nya!
                        setSources({
                            sources: [cmsSource],
                            subtitles: []
                        } as unknown as SourceResponse);
                    }
                } else if (omssResponse) {
                    // Jika CMS kosong, pakai murni data otomatis dari mesin OMSS
                    setSources(omssResponse);
                } else {
                    // Jika kedua sistem gagal total, tampilkan eror
                    setError(omssError instanceof Error ? omssError.message : String(omssError || "Gagal memuat sumber film"));
                }
                
            } catch (e) {
                setError(e instanceof Error ? e.message : String(e))
            } finally {
                setIsLoading(false)
            }
        }

        fetchSources()
    }, [id, type, season, episode, client])

    return { sources, isLoading, error }
}
