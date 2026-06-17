import { useEffect, useState } from "react"
import { useOmss } from "@/hooks/use-omss"
import { omssService } from "../services/omss.service"
import type { MediaType } from "../types/media.types"
import type { SourceResponse } from "@omss/sdk"

// --- BASIS DATA CMS MANUAL LOKAL ---
// Letakkan tautan iframe manualmu di sini.
const manualCmsDatabase: Record<string, string> = {
    "movie_1339713": "https://vidsrc.to/embed/movie/1339713",
    "movie_939243": "https://domain-lancar.com/embed/movie/939243",
}

export function useMediaSources(rawId: string, type: MediaType, season?: number, episode?: number) {
    const { client } = useOmss()
    const [sources, setSources] = useState<SourceResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string>()

    useEffect(() => {
        async function fetchSources() {
            setIsLoading(true)
            setError(undefined) 
            
            try {
                // 1. PEMBERSIH ID KHUSUS CMS: Ambil angkanya saja untuk database lokal kita
                const numericId = rawId.replace(/\D/g, '')
                
                // 2. CEK CMS MANUAL LOKAL SECARA INSTAN
                let cmsSource = null;
                const dbKey = type === "tv" ? `tv_${numericId}_${season}_${episode}` : `movie_${numericId}`;
                const manualUrl = manualCmsDatabase[dbKey];

                if (manualUrl) {
                    cmsSource = {
                        id: `cms_${dbKey}`,
                        url: manualUrl,
                        type: "embed", // PERBAIKAN: Harus "embed" agar lolos sensor OMSS SDK
                        streamable: true,
                        quality: "Auto",
                        provider: {
                            id: "server_vip",
                            name: "Server 1 (VIP)" 
                        }
                    };
                }

                // 3. KETUK PINTU OMSS OTOMATIS
                let omssResponse: SourceResponse | null = null;
                let omssError: unknown = null;
                
                try {
                    if (type === "movie") {
                        // PERBAIKAN: Gunakan rawId utuh agar pencarian OMSS tidak rusak (404)
                        omssResponse = await omssService.getMovieSources(client, rawId)
                    } else if (season !== undefined && episode !== undefined) {
                        omssResponse = await omssService.getTvSources(client, rawId, season, episode)
                    }
                } catch (oErr) {
                    console.warn("OMSS API gagal merespons:", oErr);
                    omssError = oErr;
                }

                // 4. PENGGABUNGAN (HYBRID MERGING)
                if (cmsSource) {
                    if (omssResponse) {
                        // Taruh Server 1 di urutan paling depan
                        omssResponse.sources = [cmsSource, ...(omssResponse.sources || [])];
                        setSources(omssResponse);
                    } else {
                        // Jika OMSS mati, Server 1 tetap menyelamatkan filmnya
                        setSources({
                            sources: [cmsSource],
                            subtitles: []
                        } as unknown as SourceResponse);
                    }
                } else if (omssResponse) {
                    setSources(omssResponse);
                } else {
                    setError(omssError instanceof Error ? omssError.message : String(omssError || "Gagal memuat sumber film"));
                }
                
            } catch (e) {
                setError(e instanceof Error ? e.message : String(e))
            } finally {
                setIsLoading(false)
            }
        }

        fetchSources()
    }, [rawId, type, season, episode, client])

    return { sources, isLoading, error }
}
