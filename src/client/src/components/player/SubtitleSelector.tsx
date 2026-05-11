import { useSubtitles } from "./hooks/useSubtitles"
import { Check, Captions } from "lucide-react"
import { useTranslation } from "react-i18next"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function SubtitleSelector() {
    const { subtitles, selectedSubtitle, selectSubtitle } = useSubtitles()
    const { t } = useTranslation("player")

    if (subtitles.length === 0) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" title={t("controls.subtitles")}>
                    <Captions className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-zinc-900 text-zinc-100">
                <DropdownMenuItem onClick={() => selectSubtitle(undefined)} className="flex items-center justify-between">
                    <span>{t("selectors.subtitlesOff")}</span>
                    {!selectedSubtitle && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                {subtitles.map((sub, idx) => (
                    <DropdownMenuItem key={`${sub.url}-${idx}`} onClick={() => selectSubtitle(sub)} className="flex items-center justify-between">
                        <span>{sub.label}</span>
                        {selectedSubtitle?.url === sub.url && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
