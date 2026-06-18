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
            setError(undefined) 
            
            try {
                let res: SourceResponse;
                
                if (type === "movie") {
                    res = await omssService.getMovieSources(client, id)
                } else if (season !== undefined && episode !== undefined) {
                    res = await omssService.getTvSources(client, id, season, episode)
                } else {
                    throw new Error("Parameter pencarian media tidak lengkap.")
                }

                // VALIDASI OMSS v1.1: Pastikan respons memiliki sumber data yang valid
                if (res && res.sources && res.sources.length > 0) {
                    
                    // PENYORTIRAN CERDAS: Mengutamakan sumber yang memiliki izin streamable
                    res.sources.sort((a, b) => {
                        if (a.streamable === b.streamable) return 0;
                        return a.streamable ? -1 : 1;
                    });
                    
                    setSources(res)
                } else {
                    setError("Tidak ada sumber video yang tersedia dari peladen untuk saat ini.")
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : String(e))
            } finally {
                setIsLoading(false)
            }
        }

        if (id) {
            fetchSources()
        }
    }, [id, type, season, episode, client])

    return { sources, isLoading, error }
}
